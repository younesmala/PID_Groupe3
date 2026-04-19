from rest_framework import serializers
from catalogue.models import Show


class ShowSerializer(serializers.ModelSerializer):
    class Meta:
        model = Show
        fields = ["id", "slug", "title", "description", "poster_url", "duration",
                  "created_in", "location", "bookable", "created_at", "updated_at", "artist_types"]
