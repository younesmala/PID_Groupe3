from rest_framework import serializers
from catalogue.models.reservation import Reservation

class ReservationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reservation
        fields = ['id', 'booking_date', 'status', 'user', 'representation', 'quantity', 'payment_status']