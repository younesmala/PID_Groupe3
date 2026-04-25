from rest_framework import serializers
from catalogue.models import Review


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Review
        fields = ['id', 'username', 'stars', 'review', 'status', 'created_at']
        read_only_fields = ['id', 'username', 'status', 'created_at']


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['stars', 'review']

    def validate_stars(self, value):
        if not 1 <= value <= 5:
            raise serializers.ValidationError('La note doit être entre 1 et 5.')
        return value


class ReviewProducerSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    show_title = serializers.CharField(source='show.title', read_only=True)
    show_slug = serializers.CharField(source='show.slug', read_only=True)

    class Meta:
        model = Review
        fields = [
            'id', 'username', 'show_title', 'show_slug',
            'stars', 'review', 'status', 'created_at',
        ]
        read_only_fields = fields


class ReviewModerationSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        Review.STATUS_APPROVED,
        Review.STATUS_REJECTED,
    ])