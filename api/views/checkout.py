from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models.reservation import Reservation
from catalogue.models.representation import Representation
from django.contrib.auth.models import User
from django.db import transaction
from cart.cart import Cart


class CheckoutView(APIView):
    def post(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)

        cart = Cart(request)
        if len(cart) == 0:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        reservations_created = []

        with transaction.atomic():
            for item in cart:
                representation = item['representation']
                quantity = item['quantity']

                # Re-vérifier la disponibilité avec un lock
                representation = Representation.objects.select_for_update().get(id=representation.id)

                if representation.available_seats < quantity:
                    return Response(
                        {"error": f"Not enough seats available for {representation}"},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Décrémenter les places disponibles
                representation.available_seats -= quantity
                representation.save()

                # Créer la réservation
                reservation = Reservation.objects.create(
                    user=user,
                    representation=representation,
                    quantity=quantity,
                    status="confirmed",
                    payment_status="paid"
                )
                reservations_created.append(reservation.id)

        # Vider le panier après succès
        cart.clear()

        return Response({
            "message": "Reservations created successfully",
            "reservation_ids": reservations_created
        }, status=status.HTTP_201_CREATED)

    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
