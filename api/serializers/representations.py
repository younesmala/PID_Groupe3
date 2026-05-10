from rest_framework import serializers
from catalogue.models import Representation


class RepresentationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Representation
        fields = ["id", "show", "schedule", "location", "available_seats"]
