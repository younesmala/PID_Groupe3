from rest_framework import serializers
from catalogue.models import Location, Locality


class LocalitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Locality
        fields = ['id', 'designation']


class LocationSerializer(serializers.ModelSerializer):
    locality = LocalitySerializer(read_only=True)

    class Meta:
        model = Location
        fields = ["id", "slug", "designation",
                  "address", "locality", "website", "phone"]
