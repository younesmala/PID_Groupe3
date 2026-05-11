from rest_framework import serializers
from django.contrib.auth.models import User


class AdminSerializer(serializers.Serializer):
    # Placeholder pour les donn�es d'administration
    id = serializers.IntegerField(read_only=True)
    name = serializers.CharField(max_length=255)
    # Ajoutez d'autres champs selon le mod�le Admin


class UserListAdminSerializer(serializers.Serializer):
    """Serializer for admin user list view"""
    id = serializers.IntegerField(read_only=True)
    username = serializers.CharField(max_length=150, read_only=True)
    email = serializers.EmailField(read_only=True)
    first_name = serializers.CharField(max_length=150, read_only=True)
    last_name = serializers.CharField(max_length=150, read_only=True)
    is_active = serializers.BooleanField(read_only=True)
    role = serializers.SerializerMethodField(read_only=True)
    is_deleted = serializers.SerializerMethodField(read_only=True)

    def get_role(self, obj):
        if obj.is_staff or obj.is_superuser:
            return 'ADMIN'
        profile = getattr(obj, 'profile', None)
        return profile.role if profile else 'USER'

    def get_is_deleted(self, obj):
        profile = getattr(obj, 'profile', None)
        return profile.is_deleted if profile else False
