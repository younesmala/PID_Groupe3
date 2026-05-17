from rest_framework import serializers
from catalogue.models.review import Review


class ReviewSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    show_title = serializers.ReadOnlyField(source='show.title')
    show_slug = serializers.ReadOnlyField(source='show.slug')
    user_role = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ['id', 'show', 'show_title', 'show_slug', 'username', 'user_role', 'review', 'stars', 'status', 'created_at']
        read_only_fields = ['id', 'status', 'username', 'user_role', 'show_title', 'show_slug', 'created_at']

    def get_user_role(self, obj):
        profile = getattr(obj.user, 'profile', None)
        return profile.role if profile else 'USER'


class ReviewCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['stars', 'review']


class ReviewProducerSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    show_title = serializers.ReadOnlyField(source='show.title')

    class Meta:
        model = Review
        fields = ['id', 'show_title', 'username', 'review', 'stars', 'status', 'created_at']


class ReviewModerationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = ['status']

    def validate_status(self, value):
        if value not in [Review.STATUS_APPROVED, Review.STATUS_REJECTED]:
            raise serializers.ValidationError("Statut invalide.")
        return value
