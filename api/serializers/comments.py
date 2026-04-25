from rest_framework import serializers
from catalogue.models import Comment


class CommentSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'username', 'content', 'status', 'created_at']
        read_only_fields = ['id', 'username', 'status', 'created_at']


class CommentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']


class CommentAdminSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    show_title = serializers.CharField(source='show.title', read_only=True)
    show_slug = serializers.CharField(source='show.slug', read_only=True)

    class Meta:
        model = Comment
        fields = [
            'id', 'username', 'show_title', 'show_slug',
            'content', 'status', 'created_at',
        ]
        read_only_fields = fields


class CommentModerationSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=[
        Comment.STATUS_APPROVED,
        Comment.STATUS_REJECTED,
    ])