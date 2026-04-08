from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from catalogue.models import Type
from api.serializers.types import TypeSerializer


class TypesView(APIView):
    """
    GET /api/types/
    """

    def get(self, request, *args, **kwargs):
        types = Type.objects.all().order_by("type")
        serializer = TypeSerializer(types, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)






class TypesDetailView(APIView):
    """
    GET /api/types/<id>/
    """
    def get(self, request, pk):
        try:
            type_obj = Type.objects.get(pk=pk)
        except Type.DoesNotExist:
            return Response(
                {"detail": "Type not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = TypeSerializer(type_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
