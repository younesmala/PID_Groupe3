from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models import Reservation


class ReservationsView(APIView):
    """Admin endpoint to list all reservations"""
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        # Optional filters
        payment_status = request.query_params.get('payment_status')
        status_filter = request.query_params.get('status')
        user_id = request.query_params.get('user_id')
        
        reservations = Reservation.objects.select_related(
            'user', 'representation', 'representation__show'
        ).all()
        
        if payment_status:
            reservations = reservations.filter(payment_status=payment_status)
        if status_filter:
            reservations = reservations.filter(status=status_filter)
        if user_id:
            reservations = reservations.filter(user_id=user_id)
        
        data = []
        for r in reservations:
            data.append({
                'id': r.id,
                'booking_date': r.booking_date,
                'status': r.status,
                'payment_status': r.payment_status,
                'quantity': r.quantity,
                'user': {
                    'id': r.user.id,
                    'username': r.user.username,
                    'email': r.user.email,
                },
                'representation': {
                    'id': r.representation.id,
                    'when': r.representation.when,
                    'show': {
                        'id': r.representation.show.id,
                        'title': r.representation.show.title,
                    },
                },
            })
        return Response(data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class ReservationsDetailView(APIView):
    """Admin endpoint to manage a single reservation"""
    permission_classes = [IsAdminUser]

    def get(self, request, id, *args, **kwargs):
        try:
            r = Reservation.objects.select_related(
                'user', 'representation', 'representation__show'
            ).get(id=id)
        except Reservation.DoesNotExist:
            return Response(
                {'detail': 'Reservation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        data = {
            'id': r.id,
            'booking_date': r.booking_date,
            'status': r.status,
            'payment_status': r.payment_status,
            'quantity': r.quantity,
            'user': {
                'id': r.user.id,
                'username': r.user.username,
                'email': r.user.email,
            },
            'representation': {
                'id': r.representation.id,
                'when': r.representation.when,
                'show': {
                    'id': r.representation.show.id,
                    'title': r.representation.show.title,
                },
            },
        }
        return Response(data, status=status.HTTP_200_OK)

    def put(self, request, id, *args, **kwargs):
        """Update reservation status"""
        try:
            r = Reservation.objects.get(id=id)
        except Reservation.DoesNotExist:
            return Response(
                {'detail': 'Reservation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if 'status' in request.data:
            r.status = request.data['status']
        if 'payment_status' in request.data:
            r.payment_status = request.data['payment_status']
        
        r.save()
        return Response(
            {'detail': 'Reservation updated'},
            status=status.HTTP_200_OK
        )

    def delete(self, request, id, *args, **kwargs):
        """Cancel reservation"""
        try:
            r = Reservation.objects.get(id=id)
        except Reservation.DoesNotExist:
            return Response(
                {'detail': 'Reservation not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        r.delete()
        return Response(
            {'detail': 'Reservation deleted'},
            status=status.HTTP_204_NO_CONTENT
        )


class MyReservationsView(APIView):
    """User endpoint to list their own reservations"""
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
                    'when': rep.when,
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
