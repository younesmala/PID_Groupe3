from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from catalogue.models import Artist
from api.serializers.artists import ArtistSerializer

class ArtistsView(APIView):
    """
    GET /api/artists/
    """

    def get(self, request):
        qs = Artist.objects.all()
        serializer = ArtistSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ArtistsDetailView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
    
    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
    
    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
    
    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)