from django.shortcuts import get_object_or_404
from rest_framework.authentication import SessionAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models import Review, Show
from api.serializers.reviews import ReviewProducerSerializer, ReviewModerationSerializer
from api.serializers.shows import ShowSerializer


class ProducerShowsView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        shows = Show.objects.filter(producer=request.user).order_by('-created_at')
        serializer = ShowSerializer(shows, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class ProducerShowDetailView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def delete(self, request, slug, *args, **kwargs):
        show = get_object_or_404(Show, slug=slug)
        if show.producer != request.user and not request.user.is_staff:
            return Response(
                {"detail": "Vous n'êtes pas le producteur de ce spectacle."},
                status=status.HTTP_403_FORBIDDEN,
            )
        show.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


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
        reviews = Review.objects.filter(
            show__producer=request.user
        ).select_related('user', 'show').order_by('-created_at')
        serializer = ReviewProducerSerializer(reviews, many=True)
        return Response(serializer.data)


class ProducerReviewModerateView(APIView):
    authentication_classes = [SessionAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, id):
        review = get_object_or_404(
            Review.objects.select_related('show__producer'), pk=id
        )
        if review.show.producer != request.user and not request.user.is_staff:
            return Response(
                {'error': "Vous n'êtes pas le producteur de ce show."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ReviewModerationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        review.status = serializer.validated_data['status']
        review.save(update_fields=['status'])
        return Response({'id': review.pk, 'status': review.status})


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
