from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models import Show
from api.serializers.shows import ShowSerializer


class PublicShowsView(APIView):
    def get(self, request, *args, **kwargs):
        shows = Show.objects.filter(
            bookable=True,
            publication_status=Show.PublicationStatus.APPROVED,
        ).order_by("-created_at", "title")
        serializer = ShowSerializer(shows, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class PublicRepresentationsView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
