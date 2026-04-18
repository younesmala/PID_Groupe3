from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from catalogue.models import Show
from api.serializers.shows import ShowSerializer


class ShowsView(APIView):
    """
    GET: Récupère tous les spectacles
    POST: Crée un nouveau spectacle
    """
    def get(self, request, *args, **kwargs):
        shows = Show.objects.all()
        serializer = ShowSerializer(shows, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = ShowSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShowsDetailView(APIView):
    """
    GET: Récupère un spectacle spécifique
    PUT: Met à jour un spectacle
    DELETE: Supprime un spectacle
    """
    def get(self, request, id, *args, **kwargs):
        try:
            show = Show.objects.get(id=id)
        except Show.DoesNotExist:
            return Response(
                {"detail": "Spectacle non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ShowSerializer(show)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id, *args, **kwargs):
        try:
            show = Show.objects.get(id=id)
        except Show.DoesNotExist:
            return Response(
                {"detail": "Spectacle non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ShowSerializer(show, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        try:
            show = Show.objects.get(id=id)
        except Show.DoesNotExist:
            return Response(
                {"detail": "Spectacle non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        show.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ShowsSearchView(APIView):
    """
    GET: Recherche des spectacles
    """
    def get(self, request, *args, **kwargs):
        # Implémentation basique de recherche - peut être étendue
        query = request.query_params.get('q', '')
        if query:
            shows = Show.objects.filter(title__icontains=query)
        else:
            shows = Show.objects.all()

        serializer = ShowSerializer(shows, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)