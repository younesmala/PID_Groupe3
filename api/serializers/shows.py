from pathlib import Path

from django.conf import settings
from django.db.models import Avg
from django.utils import timezone
from rest_framework import serializers
from catalogue.models import Show, Review
from api.serializers.show_prices import ShowPriceSerializer


class ShowSerializer(serializers.ModelSerializer):
    poster_url = serializers.SerializerMethodField()
    rating = serializers.SerializerMethodField()
    location_name = serializers.SerializerMethodField()
    next_schedule = serializers.SerializerMethodField()
    next_location_name = serializers.SerializerMethodField()
    artist_name = serializers.SerializerMethodField()
    sessions_count = serializers.SerializerMethodField()
    prices = ShowPriceSerializer(many=True, read_only=True)
    producer_username = serializers.SerializerMethodField()
    producer_name = serializers.SerializerMethodField()

    class Meta:
        model = Show
        fields = [
            "id", "slug",
            "title", "title_fr", "title_nl", "title_en",
            "description", "description_fr", "description_nl", "description_en",
            "poster_url", "duration", "spoken_language",
            "created_in", "artist", "artist_name", "location", "location_name", "bookable",
            "publication_status", "created_at", "updated_at", "artist_types",
            "rating", "next_schedule", "next_location_name", "sessions_count", "prices",
            "producer_username", "producer_name",
        ]

    def get_artist_name(self, obj):
        if obj.artist:
            return str(obj.artist)
        return None

    def get_poster_url(self, obj):
        value = obj.poster_url
        if not value:
            return value
        if value.startswith(("http://", "https://", "/")):
            return value

        media_candidate = Path(settings.MEDIA_ROOT) / "show-posters" / value
        if media_candidate.exists():
            return f"{settings.MEDIA_URL}show-posters/{value}"

        return value

    def get_rating(self, obj):
        avg = obj.reviews.filter(status=Review.STATUS_APPROVED).aggregate(Avg('stars'))['stars__avg']
        return round(avg, 1) if avg else None

    def get_location_name(self, obj):
        if obj.location:
            return obj.location.designation
        return None

    def _next_rep(self, obj):
        return (
            obj.representations
            .filter(schedule__gte=timezone.now())
            .order_by('schedule')
            .select_related('location')
            .first()
        )

    def get_next_schedule(self, obj):
        rep = self._next_rep(obj)
        return rep.schedule.isoformat() if rep else None

    def get_next_location_name(self, obj):
        rep = self._next_rep(obj)
        if rep and rep.location:
            return rep.location.designation
        if obj.location:
            return obj.location.designation
        return None

    def get_sessions_count(self, obj):
        return obj.representations.count()

    def get_producer_username(self, obj):
        return obj.producer.username if obj.producer else None

    def get_producer_name(self, obj):
        if not obj.producer:
            return None
        full_name = f"{obj.producer.first_name} {obj.producer.last_name}".strip()
        return full_name or obj.producer.username
