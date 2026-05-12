from datetime import datetime
from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.text import slugify
from rest_framework import status
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from catalogue.models import Location, Representation, Review, Show, ShowPrice
from api.serializers.representations import RepresentationSerializer
from api.serializers.review import ReviewModerationSerializer, ReviewProducerSerializer
from api.serializers.shows import ShowSerializer


def _producer_guard(request):
    profile = getattr(request.user, "profile", None)
    if not request.user.is_authenticated:
        return Response({"detail": "Authentification requise."}, status=status.HTTP_401_UNAUTHORIZED)
    if request.user.is_staff or (profile and profile.role == "PRODUCER"):
        return None
    return Response({"detail": "Acces reserve aux producteurs."}, status=status.HTTP_403_FORBIDDEN)


def _save_uploaded_poster(uploaded_file, title):
    extension = Path(uploaded_file.name).suffix.lower() or ".jpg"
    filename = f"{slugify(title) or 'show'}-{uuid4().hex[:8]}{extension}"
    target_dir = settings.BASE_DIR / "frontend" / "public" / "show-posters"
    target_dir.mkdir(parents=True, exist_ok=True)
    target_path = target_dir / filename
    with target_path.open("wb+") as output:
        for chunk in uploaded_file.chunks():
            output.write(chunk)
    return filename


def _normalize_artist_types(data):
    if hasattr(data, "getlist"):
        values = data.getlist("artist_types")
        if values:
            return values
    raw = data.get("artist_types", [])
    if raw in (None, "", []):
        return []
    if isinstance(raw, list):
        return raw
    return [raw]


class ProducerShowsView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        guard = _producer_guard(request)
        if guard is not None:
            return guard
        shows = Show.objects.filter(producer=request.user).order_by("-created_at")
        serializer = ShowSerializer(shows, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        guard = _producer_guard(request)
        if guard is not None:
            return guard

        title = str(request.data.get("title", "")).strip()
        description = str(request.data.get("description", "")).strip()
        duration = request.data.get("duration") or None
        created_in = request.data.get("created_in") or timezone.now().year
        artist = request.data.get("artist") or None
        spoken_language = request.data.get("spoken_language") or "fr"
        artist_types = _normalize_artist_types(request.data)
        poster = request.data.get("poster") or request.data.get("image")

        if not title:
            return Response({"title": ["Le titre est obligatoire."]}, status=status.HTTP_400_BAD_REQUEST)

        payload = {
            "title": title,
            "description": description or None,
            "duration": duration or None,
            "created_in": created_in,
            "artist": artist,
            "spoken_language": spoken_language,
            "publication_status": Show.PublicationStatus.PENDING,
            "bookable": False,
        }

        if artist_types:
            payload["artist_types"] = artist_types

        if poster:
            payload["poster_url"] = _save_uploaded_poster(poster, title)

        serializer = ShowSerializer(data=payload)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        show = serializer.save(
            producer=request.user,
            publication_status=Show.PublicationStatus.PENDING,
            bookable=False,
        )
        return Response(ShowSerializer(show).data, status=status.HTTP_201_CREATED)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Utilisez la mise a jour detaillee du spectacle."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class ProducerShowDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def _get_show(self, request, slug):
        show = get_object_or_404(Show, slug=slug)
        if show.producer != request.user and not request.user.is_staff:
            return None
        return show

    def get(self, request, slug, *args, **kwargs):
        guard = _producer_guard(request)
        if guard is not None:
            return guard

        show = self._get_show(request, slug)
        if show is None:
            return Response({"detail": "Vous n'etes pas le producteur de ce spectacle."}, status=status.HTTP_403_FORBIDDEN)

        return Response(ShowSerializer(show).data)

    def patch(self, request, slug, *args, **kwargs):
        guard = _producer_guard(request)
        if guard is not None:
            return guard

        show = self._get_show(request, slug)
        if show is None:
            return Response({"detail": "Vous n'etes pas le producteur de ce spectacle."}, status=status.HTTP_403_FORBIDDEN)

        requested_status = str(request.data.get("status", "")).strip().lower()
        if requested_status:
            if requested_status == "validated":
                show.bookable = False
                show.updated_at = timezone.now()
                show.save(update_fields=["bookable", "updated_at"])
                return Response(ShowSerializer(show).data)

            if requested_status == "published":
                if show.publication_status != Show.PublicationStatus.APPROVED:
                    return Response(
                        {"detail": "Le spectacle doit etre valide par un admin avant publication."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                if not show.representations.exists():
                    return Response(
                        {"detail": "Ajoutez au moins une seance avant publication."},
                        status=status.HTTP_400_BAD_REQUEST,
                    )
                show.bookable = True
                show.updated_at = timezone.now()
                show.save(update_fields=["bookable", "updated_at"])
                return Response(ShowSerializer(show).data)

            return Response({"detail": "Statut invalide pour le producteur."}, status=status.HTTP_400_BAD_REQUEST)

        data = request.data.copy()
        poster = data.get("poster") or data.get("image")
        if poster:
            data["poster_url"] = _save_uploaded_poster(poster, data.get("title") or show.title)

        data.pop("status", None)
        data.pop("publication_status", None)
        data.pop("bookable", None)

        serializer = ShowSerializer(show, data=data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        updated_show = serializer.save(updated_at=timezone.now())
        return Response(ShowSerializer(updated_show).data)

    def delete(self, request, slug, *args, **kwargs):
        guard = _producer_guard(request)
        if guard is not None:
            return guard

        show = get_object_or_404(Show, slug=slug)
        if show.producer != request.user and not request.user.is_staff:
            return Response(
                {"detail": "Vous n'etes pas le producteur de ce spectacle."},
                status=status.HTTP_403_FORBIDDEN,
            )
        if show.publication_status == Show.PublicationStatus.APPROVED and show.bookable:
            return Response(
                {"detail": "Un spectacle publie ne peut pas etre supprime. Depubliez-le d'abord."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        show.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ProducerShowSessionsView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def _get_show(self, request, slug):
        show = get_object_or_404(Show, slug=slug)
        if show.producer != request.user and not request.user.is_staff:
            return None
        return show

    def get(self, request, slug, *args, **kwargs):
        guard = _producer_guard(request)
        if guard is not None:
            return guard
        show = self._get_show(request, slug)
        if show is None:
            return Response({"detail": "Vous n'etes pas le producteur de ce spectacle."}, status=status.HTTP_403_FORBIDDEN)
        sessions = show.representations.order_by("schedule")
        return Response(RepresentationSerializer(sessions, many=True).data)

    def post(self, request, slug, *args, **kwargs):
        guard = _producer_guard(request)
        if guard is not None:
            return guard
        show = self._get_show(request, slug)
        if show is None:
            return Response({"detail": "Vous n'etes pas le producteur de ce spectacle."}, status=status.HTTP_403_FORBIDDEN)
        if show.publication_status != Show.PublicationStatus.APPROVED:
            return Response(
                {"detail": "Les seances sont configurables uniquement apres validation admin."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        location_id = request.data.get("location_id") or request.data.get("location")
        date_value = request.data.get("date")
        time_value = request.data.get("time")
        capacity = request.data.get("capacity") or request.data.get("available_seats")
        price_value = request.data.get("price")

        if not date_value or not time_value:
            return Response({"detail": "La date et l'heure sont obligatoires."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            schedule = timezone.make_aware(datetime.fromisoformat(f"{date_value}T{time_value}:00"))
        except ValueError:
            return Response({"detail": "Date ou heure invalide."}, status=status.HTTP_400_BAD_REQUEST)

        location = None
        if location_id:
            location = get_object_or_404(Location, pk=location_id)

        serializer = RepresentationSerializer(
            data={
                "show": show.id,
                "schedule": schedule.isoformat(),
                "location": location.id if location else None,
                "available_seats": int(capacity or 0),
            }
        )
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        session = serializer.save()

        if price_value not in (None, "") and not show.prices.exists():
            normalized_price = str(price_value).replace(",", ".").strip()
            try:
                amount = float(normalized_price)
            except ValueError:
                return Response({"detail": "Prix invalide."}, status=status.HTTP_400_BAD_REQUEST)
            if amount > 0:
                ShowPrice.objects.create(show=show, category="Standard", amount=amount)

        return Response(RepresentationSerializer(session).data, status=status.HTTP_201_CREATED)


class ProducerShowsStatsView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class ProducerCommentsView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class ProducerCommentsValidateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class ProducerCommentsRejectView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class ProducerReviewsView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        reviews = Review.objects.filter(show__producer=request.user).select_related("user", "show").order_by("-created_at")
        serializer = ReviewProducerSerializer(reviews, many=True)
        return Response(serializer.data)


class ProducerReviewModerateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        review = get_object_or_404(Review.objects.select_related("show__producer"), pk=id)
        if review.show.producer != request.user and not request.user.is_staff:
            return Response(
                {"error": "Vous n'etes pas le producteur de ce show."},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = ReviewModerationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        review.status = serializer.validated_data["status"]
        review.save(update_fields=["status"])
        return Response({"id": review.pk, "status": review.status})


class ProducerReviewsValidateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class ProducerReviewsRejectView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
