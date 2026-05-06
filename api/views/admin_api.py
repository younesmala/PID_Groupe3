from django.shortcuts import get_object_or_404
from django.db.models import Count, Sum, F, DecimalField
from django.contrib.auth.models import User
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models import Comment, Reservation, Show
from api.serializers.comments import CommentAdminSerializer, CommentModerationSerializer


class AdminStatsView(APIView):
    """Admin dashboard stats: users, shows, reservations, revenue"""
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        total_users = User.objects.count()
        total_shows = Show.objects.count()
        total_reservations = Reservation.objects.count()

        revenue = Reservation.objects.filter(
            payment_status='paid'
        ).aggregate(
            total=Sum(
                F('representation_reservations__price__price') * F('representation_reservations__quantity'),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
        )['total'] or 0

        pending_reservations = Reservation.objects.filter(
            payment_status='pending'
        ).count()

        return Response({
            'total_users': total_users,
            'total_shows': total_shows,
            'total_reservations': total_reservations,
            'pending_reservations': pending_reservations,
            'revenue': float(revenue),
        }, status=status.HTTP_200_OK)


class AdminApiUsersView(APIView):
    """List all users with roles for admin management"""
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        users = User.objects.prefetch_related('groups').all()
        data = []
        for user in users:
            roles = list(user.groups.values_list('name', flat=True))
            data.append({
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_staff': user.is_staff,
                'is_active': user.is_active,
                'roles': roles,
                'date_joined': user.date_joined,
            })
        return Response(data, status=status.HTTP_200_OK)

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
