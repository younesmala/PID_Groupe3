from pathlib import Path
from uuid import uuid4

from django.conf import settings
from django.core.files.storage import default_storage
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from catalogue.models import Artist
from api.models import UserProfile
from api.serializers.artists import ArtistSerializer


ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.gif', '.webp'}


def _is_producer(request):
    if not request.user.is_authenticated or request.user.is_staff:
        return False
    return UserProfile.objects.filter(user=request.user, role='PRODUCER').exists()


def build_artist_payload(request):
    payload = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
    uploaded_photo = request.FILES.get('photo_file') or request.FILES.get('photo')

    if uploaded_photo:
        extension = Path(uploaded_photo.name or '').suffix.lower()
        if extension not in ALLOWED_IMAGE_EXTENSIONS:
            return None, {
                'photo_file': ['Formats acceptes: .jpg, .jpeg, .png, .gif, .webp.']
            }

        storage_path = default_storage.save(
            f"artists/{uuid4().hex}{extension}",
            uploaded_photo,
        )
        payload['photo'] = request.build_absolute_uri(f"{settings.MEDIA_URL}{storage_path}")

    if 'photo_file' in payload:
        del payload['photo_file']

    for optional_field in ('photo', 'address', 'phone', 'email', 'locality'):
        if payload.get(optional_field) == '':
            payload[optional_field] = None

    return payload, None


class ArtistsView(APIView):
    def get(self, request):
        qs = Artist.objects.all()
        if _is_producer(request):
            qs = qs.filter(producer=request.user)
        serializer = ArtistSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        payload, errors = build_artist_payload(request)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = ArtistSerializer(data=payload)

        if serializer.is_valid():
            if _is_producer(request):
                serializer.save(producer=request.user)
            else:
                serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ArtistsDetailView(APIView):
    def _get_artist(self, request, pk):
        try:
            artist = Artist.objects.get(pk=pk)
        except Artist.DoesNotExist:
            return None, Response({"detail": "Not found"}, status=status.HTTP_404_NOT_FOUND)

        if _is_producer(request) and artist.producer_id != request.user.id:
            return None, Response(
                {"detail": "Vous n'etes pas autorise a acceder a cet artiste."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return artist, None

    def get(self, request, pk):
        artist, error_response = self._get_artist(request, pk)
        if error_response:
            return error_response

        serializer = ArtistSerializer(artist)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, pk):
        artist, error_response = self._get_artist(request, pk)
        if error_response:
            return error_response

        payload, errors = build_artist_payload(request)
        if errors:
            return Response(errors, status=status.HTTP_400_BAD_REQUEST)

        serializer = ArtistSerializer(artist, data=payload)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        artist, error_response = self._get_artist(request, pk)
        if error_response:
            return error_response

        artist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
