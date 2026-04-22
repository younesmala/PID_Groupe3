from rest_framework import serializers
from catalogue.models import Show


class ShowSerializer(serializers.ModelSerializer):
    artist_name = serializers.SerializerMethodField()

    class Meta:
        model = Show
        fields = ["id", "slug", "title", "description", "poster_url", "duration",
                  "created_in", "artist", "artist_name", "location", "bookable",
                  "publication_status", "created_at", "updated_at", "artist_types"]

    def get_artist_name(self, obj):
        return str(obj.artist) if obj.artist else None
