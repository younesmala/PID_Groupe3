from rest_framework import serializers
from django.db.models import Avg
from django.utils import timezone
from catalogue.models import Show
from api.serializers.show_prices import ShowPriceSerializer


class ShowSerializer(serializers.ModelSerializer):
    rating = serializers.SerializerMethodField()
    location_name = serializers.SerializerMethodField()
    next_schedule = serializers.SerializerMethodField()
    next_location_name = serializers.SerializerMethodField()
    artist_name = serializers.SerializerMethodField()
    prices = ShowPriceSerializer(many=True, read_only=True)

    class Meta:
        model = Show
        fields = [
            "id", "slug", "title", "description", "poster_url", "duration",
            "created_in", "artist", "artist_name", "location", "location_name", "bookable",
            "publication_status", "created_at", "updated_at", "artist_types",
            "rating", "next_schedule", "next_location_name", "prices",
        ]

    def get_artist_name(self, obj):
        if obj.artist:
            return str(obj.artist)
        return None

    def get_rating(self, obj):
        avg = obj.show.filter(validated=True).aggregate(Avg('stars'))['stars__avg']
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
