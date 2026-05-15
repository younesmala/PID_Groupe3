from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from api.serializers.artist_types import ArtistTypeSerializer
from catalogue.models import ArtistType


class ArtistTypesView(APIView):
    """
    GET /api/artist-types/
    """

    def get(self, request):
        qs = ArtistType.objects.all()
        serializer = ArtistTypeSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
