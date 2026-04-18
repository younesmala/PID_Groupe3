from rest_framework import serializers

class CartItemSerializer(serializers.Serializer):
    representation_id = serializers.IntegerField()
    quantity = serializers.IntegerField()

class CartSerializer(serializers.Serializer):
    items = CartItemSerializer(many=True)