from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models import Comment
from api.serializers.comments import CommentAdminSerializer, CommentModerationSerializer


class AdminApiUsersView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class AdminCatalogImportView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class AdminCatalogExportView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class AdminProvidersShowsUpdateView(APIView):
    def get(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class AdminCommentsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        qs = Comment.objects.select_related(
            'user', 'show'
        ).order_by('-created_at')
        status_filter = request.query_params.get('status')
        if status_filter in (
            Comment.STATUS_PENDING,
            Comment.STATUS_APPROVED,
            Comment.STATUS_REJECTED,
        ):
            qs = qs.filter(status=status_filter)
        serializer = CommentAdminSerializer(qs, many=True)
        return Response(serializer.data)


class AdminCommentModerateView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, id):
        comment = get_object_or_404(Comment, pk=id)
        serializer = CommentModerationSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                serializer.errors, status=status.HTTP_400_BAD_REQUEST
            )
        comment.status = serializer.validated_data['status']
        comment.save(update_fields=['status'])
        return Response({'id': comment.pk, 'status': comment.status})
