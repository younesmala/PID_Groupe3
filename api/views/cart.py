from decimal import Decimal
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status

from catalogue.models import Representation, Price
from cart.cart import Cart


class CartView(APIView):
    def get(self, request, *args, **kwargs):
        cart = Cart(request)
        items = []
        for item in cart:
            items.append({
                'representation_id': item['representation'].id,
                'representation': str(item['representation']),
                'price_type': item['price_obj'].type,
                'unit_price': str(item['price']),
                'quantity': item['quantity'],
                'total_price': str(item['total_price']),
            })
        return Response({
            'items': items,
            'total': str(cart.get_total_price()),
            'count': len(cart),
        })

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Use /cart/add/"}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)

    def delete(self, request, *args, **kwargs):
        cart = Cart(request)
        cart.clear()
        return Response({"detail": "Cart cleared"})


class CartAddView(APIView):
    def post(self, request, *args, **kwargs):
        representation_id = request.data.get('representation_id')
        quantity = int(request.data.get('quantity', 1))
        price_type = request.data.get('price_type', 'standard')

        try:
            representation = Representation.objects.get(pk=representation_id)
        except Representation.DoesNotExist:
            return Response({"detail": "Représentation introuvable."}, status=status.HTTP_404_NOT_FOUND)

        if representation.available_seats < quantity:
            return Response(
                {"detail": f"Seulement {representation.available_seats} place(s) disponible(s)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        price = (
            Price.objects.filter(type__iexact=price_type).first()
            or Price.objects.first()
        )
        if not price:
            return Response({"detail": "Aucun tarif disponible."}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart(request)
        cart.add(representation=representation, price=price, quantity=quantity)

        return Response({
            "detail": "Ajouté au panier.",
            "cart_count": len(cart),
        })

    def get(self, request, *args, **kwargs):
        return Response({"detail": "POST uniquement."}, status=status.HTTP_405_METHOD_NOT_ALLOWED)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)


class CartUpdateView(APIView):
    def post(self, request, *args, **kwargs):
        representation_id = request.data.get('representation_id')
        quantity = int(request.data.get('quantity', 1))
        price_type = request.data.get('price_type', 'standard')

        try:
            representation = Representation.objects.get(pk=representation_id)
        except Representation.DoesNotExist:
            return Response({"detail": "Représentation introuvable."}, status=status.HTTP_404_NOT_FOUND)

        price = (
            Price.objects.filter(type__iexact=price_type).first()
            or Price.objects.first()
        )
        if not price:
            return Response({"detail": "Aucun tarif disponible."}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart(request)
        cart.add(representation=representation, price=price, quantity=quantity, override_quantity=True)
        return Response({"detail": "Panier mis à jour.", "cart_count": len(cart)})

    def get(self, request, *args, **kwargs):
        return Response({"detail": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)


class CartRemoveView(APIView):
    def post(self, request, *args, **kwargs):
        representation_id = request.data.get('representation_id')
        price_type = request.data.get('price_type', 'standard')

        try:
            representation = Representation.objects.get(pk=representation_id)
        except Representation.DoesNotExist:
            return Response({"detail": "Représentation introuvable."}, status=status.HTTP_404_NOT_FOUND)

        price = (
            Price.objects.filter(type__iexact=price_type).first()
            or Price.objects.first()
        )
        if not price:
            return Response({"detail": "Aucun tarif disponible."}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart(request)
        cart.remove(representation, price)
        return Response({"detail": "Article retiré.", "cart_count": len(cart)})

    def get(self, request, *args, **kwargs):
        return Response({"detail": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Not implemented"}, status=status.HTTP_501_NOT_IMPLEMENTED)
