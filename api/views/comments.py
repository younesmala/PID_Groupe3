from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models import Comment, Show
from api.serializers.comments import CommentSerializer, CommentCreateSerializer


class ShowCommentsView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, slug):
        show = get_object_or_404(Show, slug=slug)
        comments = Comment.objects.filter(
            show=show, status=Comment.STATUS_APPROVED
        ).select_related('user').order_by('-created_at')
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request, slug):
        show = get_object_or_404(Show, slug=slug)
        serializer = CommentCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(
                show=show,
                user=request.user,
                status=Comment.STATUS_PENDING,
            )
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
