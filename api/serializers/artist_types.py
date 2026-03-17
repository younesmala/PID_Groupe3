from rest_framework import serializers
from catalogue.models import ArtistType


class ArtistTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ArtistType
        fields = ["id", "artist", "type"]
