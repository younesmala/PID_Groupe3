from django.contrib.syndication.views import Feed
from django.utils import timezone
from catalogue.models.representation import Representation
from rest_framework.response import Response
from rest_framework.views import APIView


class RssNextRepresentationsView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class UpcomingRepresentationsFeed(Feed):
    title = "PIDBooking – Prochaines représentations"
    link = "/api/rss/"
    description = "Liste des prochaines représentations de spectacles."

    def items(self):
        return Representation.objects.filter(
            schedule__gte=timezone.now()
        ).order_by('schedule')[:20]

    def item_title(self, item):
        return f"{item.show.title} – {item.schedule.strftime('%d/%m/%Y %H:%M')}"

    def item_description(self, item):
        lieu = str(item.location) if item.location else 'Non précisé'
        return (
            f"Spectacle : {item.show.title}\n"
            f"Date : {item.schedule.strftime('%d/%m/%Y')}\n"
            f"Heure : {item.schedule.strftime('%H:%M')}\n"
            f"Lieu : {lieu}"
        )

    def item_link(self, item):
        return f"/api/shows/{item.show.id}/"
