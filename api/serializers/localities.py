from rest_framework import serializers
from catalogue.models import Locality


class LocalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Locality
        fields = ["id", "postal_code", "locality"]