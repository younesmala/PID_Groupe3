from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from catalogue.models import Reservation


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
