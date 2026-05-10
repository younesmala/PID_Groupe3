from rest_framework import serializers
from catalogue.models.review import Review

class ReviewSerializer(serializers.ModelSerializer):
    # On affiche le nom de l'utilisateur plutôt que son ID pour le frontend
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Review
        fields = ['id', 'show', 'username', 'review', 'stars', 'status', 'created_at']
        # Ces champs ne sont pas remplis par l'utilisateur via le formulaire
        read_only_fields = ['id', 'status', 'username', 'created_at']

    def validate_stars(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être comprise entre 1 et 5.")
        return value