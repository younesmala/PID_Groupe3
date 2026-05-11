from django.shortcuts import get_object_or_404
from decimal import Decimal
from rest_framework import status
from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from catalogue.models import Reservation


def _get_reservation_total_paid(reservation):
    if reservation.total_paid and reservation.total_paid > Decimal('0.00'):
        return reservation.total_paid

    total_amount = Decimal('0.00')
    for line in reservation.representation_reservations.all():
        if line.price_id and line.price:
            total_amount += line.price.price * line.quantity

    if total_amount > Decimal('0.00'):
        return total_amount

    # Legacy reservations may miss line items: fallback to the lowest show price.
    if reservation.representation_id and reservation.representation.show_id:
        show_prices = reservation.representation.show.prices.all()
        minimum_amount = min((show_price.amount for show_price in show_prices), default=Decimal('0.00'))
        if minimum_amount > Decimal('0.00'):
            return minimum_amount * reservation.quantity

    return total_amount


class ReservationsView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class ReservationsDetailView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class AdminReservationsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        queryset = Reservation.objects.select_related(
            'user',
            'representation',
            'representation__show',
        ).prefetch_related(
            'representation_reservations__price',
            'representation__show__prices',
        ).order_by('-booking_date')

        payment_status = request.query_params.get('payment_status')
        reservation_status = request.query_params.get('status')

        if payment_status:
            queryset = queryset.filter(payment_status=payment_status)

        if reservation_status:
            queryset = queryset.filter(status=reservation_status)

        data = []
        for reservation in queryset:
            total_paid = _get_reservation_total_paid(reservation)

            data.append({
                'id': reservation.id,
                'booking_date': reservation.booking_date,
                'status': reservation.status,
                'payment_status': reservation.payment_status,
                'quantity': reservation.quantity,
                'total_paid': str(total_paid),
                'user': {
                    'id': reservation.user_id,
                    'username': reservation.user.username,
                    'email': reservation.user.email,
                },
                'representation': {
                    'id': reservation.representation_id,
                    'when': reservation.representation.schedule,
                    'show': {
                        'id': reservation.representation.show_id,
                        'title': reservation.representation.show.title,
                    },
                },
            })

        return Response(data)


class AdminReservationsDetailView(APIView):
    permission_classes = [IsAdminUser]

    def put(self, request, id, *args, **kwargs):
        reservation = get_object_or_404(Reservation, pk=id)
        payment_status = request.data.get('payment_status')
        reservation_status = request.data.get('status')
        updated_fields = []

        if payment_status is not None:
            valid_payment_statuses = {'pending', 'paid', 'failed', 'refunded'}
            if payment_status not in valid_payment_statuses:
                return Response(
                    {'detail': 'Invalid payment_status value.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            reservation.payment_status = payment_status
            updated_fields.append('payment_status')
            if payment_status == 'paid' and reservation.total_paid == Decimal('0.00'):
                computed_total = _get_reservation_total_paid(reservation)
                if computed_total > Decimal('0.00'):
                    reservation.total_paid = computed_total
                    updated_fields.append('total_paid')

        if reservation_status is not None:
            valid_statuses = {'pending', 'confirmed', 'cancelled'}
            if reservation_status not in valid_statuses:
                return Response(
                    {'detail': 'Invalid status value.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            reservation.status = reservation_status
            updated_fields.append('status')

        if not updated_fields:
            return Response(
                {'detail': 'No fields to update.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reservation.save(update_fields=updated_fields)
        return Response(
            {
                'id': reservation.id,
                'status': reservation.status,
                'payment_status': reservation.payment_status,
            },
            status=status.HTTP_200_OK,
        )

    def delete(self, request, id, *args, **kwargs):
        reservation = get_object_or_404(Reservation, pk=id)
        reservation.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MyReservationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        reservations = Reservation.objects.filter(user=request.user).select_related(
            'representation', 'representation__show', 'representation__location'
        ).order_by('-booking_date')
        data = []
        for r in reservations:
            rep = r.representation
            show = rep.show
            data.append({
                'id': r.id,
                'booking_date': r.booking_date,
                'status': r.status,
                'payment_status': r.payment_status,
                'quantity': r.quantity,
                'representation': {
                    'id': rep.id,
                    'when': rep.schedule,
                    'location': str(rep.location) if rep.location else None,
                    'show': {
                        'id': show.id,
                        'title': show.title,
                    },
                },
            })
        return Response(data)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
