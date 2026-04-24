from django.contrib.syndication.views import Feed
from django.utils import timezone
from django.utils.feedgenerator import Rss201rev2Feed
from catalogue.models.representation import Representation


class UpcomingRepresentationsFeed(Feed):
    title = "PIDBooking – Prochaines représentations"
    link = "/api/rss/"
    description = (
        "Liste des prochaines représentations de spectacles "
        "à Bruxelles — PIDBooking"
    )
    language = "fr"
    feed_type = Rss201rev2Feed
    author_name = "PIDBooking"
    categories = ("Spectacles", "Culture", "Bruxelles")

    def items(self):
        return Representation.objects.filter(
            schedule__gte=timezone.now()
        ).select_related('show', 'location').order_by('schedule')[:20]

    def item_title(self, item):
        return f"{item.show.title} – {item.schedule.strftime('%d/%m/%Y')}"

    def item_description(self, item):
        show = item.show
        description = show.description or ''
        lieu = str(item.location) if item.location else 'Non précisé'
        return (
            f"Spectacle : {show.title}\n"
            f"Date : {item.schedule.strftime('%d/%m/%Y')}\n"
            f"Heure : {item.schedule.strftime('%H:%M')}\n"
            f"Lieu : {lieu}\n"
            f"Réservable : {'Oui' if show.bookable else 'Non'}\n"
            f"Description : {description[:200]}"
        )

    def item_link(self, item):
        return f"/api/shows/{item.show.id}/"

    def item_pubdate(self, item):
        return item.schedule

    def item_categories(self, item):
        return ("Spectacle", "Culture")

    def item_author_name(self, item):
        return "PIDBooking"
