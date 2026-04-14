from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models import Representation
from api.serializers.representations import RepresentationSerializer


class RepresentationsView(APIView):
    """
    GET: Récupère toutes les représentations
    POST: Crée une représentation
    """
    def get(self, request, *args, **kwargs):
        qs = Representation.objects.all()
        show_id = request.query_params.get('show')
        if show_id:
            qs = qs.filter(show_id=show_id)
        serializer = RepresentationSerializer(qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = RepresentationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RepresentationsDetailView(APIView):
    """
    GET: Récupère une représentation
    PUT: Met à jour une représentation
    DELETE: Supprime une représentation
    """
    def get(self, request, id, *args, **kwargs):
        try:
            representation = Representation.objects.get(id=id)
        except Representation.DoesNotExist:
            return Response({"detail": "Représentation non trouvée"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RepresentationSerializer(representation)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id, *args, **kwargs):
        try:
            representation = Representation.objects.get(id=id)
        except Representation.DoesNotExist:
            return Response({"detail": "Représentation non trouvée"}, status=status.HTTP_404_NOT_FOUND)

        serializer = RepresentationSerializer(representation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        try:
            representation = Representation.objects.get(id=id)
        except Representation.DoesNotExist:
            return Response({"detail": "Représentation non trouvée"}, status=status.HTTP_404_NOT_FOUND)

        representation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RepresentationsCalendarView(APIView):
    """
    GET: Récupère les représentations sur un intervalle de date (query params: start, end)
    """
    def get(self, request, *args, **kwargs):
        start = request.query_params.get('start')  # format YYYY-MM-DD
        end = request.query_params.get('end')

        representations = Representation.objects.all()
        if start:
            representations = representations.filter(schedule__date__gte=start)
        if end:
            representations = representations.filter(schedule__date__lte=end)

        serializer = RepresentationSerializer(representations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)


class RepresentationsAvailabilityView(APIView):
    """
    GET: Récupère les disponibilités des représentations par location/show
    """
    def get(self, request, *args, **kwargs):
        location_id = request.query_params.get('location')
        show_id = request.query_params.get('show')

        representations = Representation.objects.all()
        if location_id:
            representations = representations.filter(location_id=location_id)
        if show_id:
            representations = representations.filter(show_id=show_id)

        serializer = RepresentationSerializer(representations, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
