from rest_framework import serializers
from catalogue.models import ShowPrice


class ShowPriceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ShowPrice
        fields = ['id', 'category', 'amount', 'created_at']
        read_only_fields = ['id', 'created_at']
