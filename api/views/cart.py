from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.shortcuts import get_object_or_404

from catalogue.models import Representation, Price
from cart.cart import Cart


def parse_quantity(raw_value):
    try:
        return int(raw_value)
    except (TypeError, ValueError):
        return None


class CartView(APIView):
    def get(self, request, *args, **kwargs):
        cart = Cart(request)
        items = []
        for item in cart:
            items.append({
                'representation_id': item['representation'].id,
                'representation': str(item['representation']),
                'price_id': item['price_obj'].id,
                'price_type': item['price_obj'].type,
                'unit_price': str(item['price']),
                'quantity': item['quantity'],
                'total_price': str(item['total_price']),
                'available_seats': item['representation'].available_seats,
            })
        return Response({
            'items': items,
            'total': str(cart.get_total_price()),
            'count': len(cart),
        })

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Use /api/cart/add/"}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, *args, **kwargs):
        cart = Cart(request)
        cart.clear()
        return Response({"detail": "Cart cleared"})


class CartAddView(APIView):
    def post(self, request, *args, **kwargs):
        representation_id = request.data.get('representation_id')
        price_id = request.data.get('price_id')
        price_type = request.data.get('price_type')
        quantity = parse_quantity(request.data.get('quantity', 1))

        if quantity is None or quantity <= 0:
            return Response({"detail": "Quantité invalide."}, status=status.HTTP_400_BAD_REQUEST)

        representation = get_object_or_404(
            Representation, pk=representation_id)

        if price_id:
            price = get_object_or_404(Price, pk=price_id)
        elif price_type:
            price = Price.objects.filter(type__iexact=price_type).first()
            if not price:
                return Response({"detail": "Tarif introuvable."}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"detail": "ID de prix ou type de prix requis."}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart(request)
        key = f"{representation.id}_{price.id}"
        current_quantity = cart.cart.get(key, {}).get('quantity', 0)

        if representation.available_seats < (current_quantity + quantity):
            return Response(
                {"detail": f"Seulement {representation.available_seats} place(s) disponible(s)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart.add(representation=representation, price=price, quantity=quantity)
        return Response({
            "detail": "Ajouté au panier.",
            "cart_count": len(cart),
        })


class CartUpdateView(APIView):
    def post(self, request, *args, **kwargs):
        representation_id = request.data.get('representation_id')
        price_id = request.data.get('price_id')
        price_type = request.data.get('price_type')
        quantity = parse_quantity(request.data.get('quantity', 1))

        if quantity is None:
            return Response({"detail": "Quantité invalide."}, status=status.HTTP_400_BAD_REQUEST)

        representation = get_object_or_404(
            Representation, pk=representation_id)

        if price_id:
            price = get_object_or_404(Price, pk=price_id)
        elif price_type:
            price = Price.objects.filter(type__iexact=price_type).first()
            if not price:
                return Response({"detail": "Tarif introuvable."}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"detail": "ID de prix ou type de prix requis."}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart(request)
        if quantity <= 0:
            cart.remove(representation, price)
            return Response({"detail": "Article retiré.", "cart_count": len(cart)})

        if representation.available_seats < quantity:
            return Response(
                {"detail": f"Seulement {representation.available_seats} place(s) disponible(s)."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart.add(representation=representation, price=price,
                 quantity=quantity, override_quantity=True)
        return Response({"detail": "Panier mis à jour.", "cart_count": len(cart)})


class CartRemoveView(APIView):
    def post(self, request, *args, **kwargs):
        representation_id = request.data.get('representation_id')
        price_id = request.data.get('price_id')
        price_type = request.data.get('price_type')

        representation = get_object_or_404(
            Representation, pk=representation_id)

        if price_id:
            price = get_object_or_404(Price, pk=price_id)
        elif price_type:
            price = Price.objects.filter(type__iexact=price_type).first()
            if not price:
                return Response({"detail": "Tarif introuvable."}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response({"detail": "ID de prix ou type de prix requis."}, status=status.HTTP_400_BAD_REQUEST)

        cart = Cart(request)
        cart.remove(representation, price)
        return Response({"detail": "Article retiré.", "cart_count": len(cart)})
