from rest_framework import serializers
from catalogue.models.review import Review


class ReviewSerializer(serializers.ModelSerializer):
    # On affiche le nom de l'utilisateur plutôt que son ID pour le frontend
    username = serializers.ReadOnlyField(source='user.username')
    show_title = serializers.ReadOnlyField(source='show.title')
    show_slug = serializers.ReadOnlyField(source='show.slug')

    class Meta:
        model = Review
        fields = ['id', 'show', 'show_title', 'show_slug', 'username', 'review', 'stars', 'status', 'created_at']
        # Ces champs ne sont pas remplis par l'utilisateur via le formulaire
        read_only_fields = ['id', 'status', 'username', 'show_title', 'show_slug', 'created_at']


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
