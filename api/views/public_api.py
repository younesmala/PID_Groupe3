from datetime import datetime, timedelta
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.utils import timezone
from catalogue.models import Show, Representation
from api.serializers.shows import ShowSerializer


class PublicShowsView(APIView):
    def get(self, request, *args, **kwargs):
        shows = Show.objects.filter(bookable=True)

        filter_type = request.query_params.get('filter')
        location_name = request.query_params.get('location')
        date_str = request.query_params.get('date')

        now = timezone.now()
        today_start = now.replace(hour=0, minute=0, second=0, microsecond=0)
        today_end = today_start + timedelta(days=1)

        if filter_type == 'today':
            shows = shows.filter(
                representations__schedule__gte=today_start,
                representations__schedule__lt=today_end,
            ).distinct()
        elif filter_type == 'upcoming':
            shows = shows.filter(
                representations__schedule__gte=today_end,
            ).distinct()

        if location_name:
            shows = shows.filter(
                representations__location__designation__icontains=location_name,
            ).distinct()

        if date_str:
            try:
                date_obj = datetime.strptime(date_str, '%Y-%m-%d')
                date_start = timezone.make_aware(date_obj)
                date_end = date_start + timedelta(days=1)
                shows = shows.filter(
                    representations__schedule__gte=date_start,
                    representations__schedule__lt=date_end,
                ).distinct()
            except ValueError:
                pass

        shows = shows.order_by('-created_at', 'title')
        serializer = ShowSerializer(shows, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class PublicRepresentationsView(APIView):
    def get(self, request, *args, **kwargs):
        locations = (
            Representation.objects
            .filter(schedule__gte=timezone.now(), location__isnull=False)
            .values_list('location__designation', flat=True)
            .distinct()
            .order_by('location__designation')
        )
        return Response({'locations': list(locations)}, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)
