from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from catalogue.models import Locality
from api.serializers.localities import LocalitySerializer


class LocalitiesView(APIView):
    """
    GET: Récupère toutes les localités
    POST: Crée une nouvelle localité
    """

    def get(self, request, *args, **kwargs):
        localities = Locality.objects.all()
        serializer = LocalitySerializer(localities, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = LocalitySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LocalitiesDetailView(APIView):
    """
    GET: Récupère une localité spécifique
    PUT: Met à jour une localité
    DELETE: Supprime une localité
    """

    def get(self, request, id, *args, **kwargs):
        try:
            locality = Locality.objects.get(id=id)
        except Locality.DoesNotExist:
            return Response(
                {"detail": "Localité non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LocalitySerializer(locality)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id, *args, **kwargs):
        try:
            locality = Locality.objects.get(id=id)
        except Locality.DoesNotExist:
            return Response(
                {"detail": "Localité non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LocalitySerializer(
            locality, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        try:
            locality = Locality.objects.get(id=id)
        except Locality.DoesNotExist:
            return Response(
                {"detail": "Localité non trouvée"},
                status=status.HTTP_404_NOT_FOUND
            )

        locality.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
