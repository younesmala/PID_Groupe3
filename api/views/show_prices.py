from django.shortcuts import get_object_or_404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework import status
from catalogue.models import Show, ShowPrice
from api.serializers.show_prices import ShowPriceSerializer


class ShowPricesView(APIView):
    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return [IsAuthenticatedOrReadOnly()]

    def get(self, request, slug):
        show = get_object_or_404(Show, slug=slug)
        prices = ShowPrice.objects.filter(show=show)
        serializer = ShowPriceSerializer(prices, many=True)
        return Response(serializer.data)

    def post(self, request, slug):
        show = get_object_or_404(Show, slug=slug)
        if show.producer != request.user and not request.user.is_staff:
            return Response(
                {'error': "Vous n'êtes pas le producteur de ce spectacle."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ShowPriceSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(show=show)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShowPricesDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def _get_price(self, slug, pk):
        show = get_object_or_404(Show, slug=slug)
        price = get_object_or_404(ShowPrice, id=pk, show=show)
        return show, price

    def put(self, request, slug, pk):
        show, price = self._get_price(slug, pk)
        if show.producer != request.user and not request.user.is_staff:
            return Response(
                {'error': "Vous n'êtes pas le producteur de ce spectacle."},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = ShowPriceSerializer(price, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, pk):
        show, price = self._get_price(slug, pk)
        if show.producer != request.user and not request.user.is_staff:
            return Response(
                {'error': "Vous n'êtes pas le producteur de ce spectacle."},
                status=status.HTTP_403_FORBIDDEN
            )
        price.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
