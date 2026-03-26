from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from catalogue.models import Location
from api.serializers.locations import LocationSerializer


class LocationsView(APIView):
    """
    GET: Récupère tous les lieux
    POST: Crée un nouveau lieu
    """
    def get(self, request, *args, **kwargs):
        locations = Location.objects.all()
        serializer = LocationSerializer(locations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = LocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LocationsDetailView(APIView):
    """
    GET: Récupère un lieu spécifique
    PUT: Met à jour un lieu
    DELETE: Supprime un lieu
    """
    def get(self, request, id, *args, **kwargs):
        try:
            location = Location.objects.get(id=id)
        except Location.DoesNotExist:
            return Response(
                {"detail": "Lieu non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LocationSerializer(location)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id, *args, **kwargs):
        try:
            location = Location.objects.get(id=id)
        except Location.DoesNotExist:
            return Response(
                {"detail": "Lieu non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LocationSerializer(location, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        try:
            location = Location.objects.get(id=id)
        except Location.DoesNotExist:
            return Response(
                {"detail": "Lieu non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        location.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)