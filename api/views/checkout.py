from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models.reservation import Reservation
from catalogue.models.representation import Representation
from django.contrib.auth.models import User
from django.db import transaction


class CheckoutView(APIView):
    def post(self, request, *args, **kwargs):
        user = request.user
        if not user.is_authenticated:
            return Response({"error": "Authentication required"}, status=status.HTTP_401_UNAUTHORIZED)
        
        cart_items = request.session.get('cart', [])
        if not cart_items:
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)
        
        reservations_created = []
        
        with transaction.atomic():
            for item in cart_items:
                representation_id = item.get("representation_id")
                quantity = item.get("quantity", 1)
                
                if not representation_id:
                    return Response({"error": "representation_id is required for each cart item"}, status=status.HTTP_400_BAD_REQUEST)
                
                try:
                    representation = Representation.objects.select_for_update().get(id=representation_id)
                except Representation.DoesNotExist:
                    return Response({"error": f"Representation {representation_id} does not exist"}, status=status.HTTP_400_BAD_REQUEST)
                
                if representation.available_seats < quantity:
                    return Response({"error": f"Not enough seats available for representation {representation_id}"}, status=status.HTTP_400_BAD_REQUEST)
                
                # Décrémenter les places disponibles
                representation.available_seats -= quantity
                representation.save()
                
                # Créer la réservation
                reservation = Reservation.objects.create(
                    user=user,
                    representation=representation,
                    quantity=quantity,
                    status="confirmed",
                    payment_status="paid"  # Assumer paiement réussi pour cet exemple
                )
                reservations_created.append(reservation.id)
        
        # Vider le panier
        request.session['cart'] = []
        request.session.modified = True
        
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