from django.shortcuts import get_object_or_404
from django.contrib.auth.models import User
from django.db.models import Sum, F, DecimalField
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from catalogue.models import Comment, Reservation, Show
from api.models import UserProfile
from api.serializers.comments import CommentAdminSerializer, CommentModerationSerializer
from api.serializers.admin_api import UserListAdminSerializer


class AdminStatsView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        total_users = User.objects.filter(is_active=True, profile__is_deleted=False).count()
        total_shows = Show.objects.filter(bookable=True).count()
        pending_shows = Show.objects.filter(publication_status=Show.PublicationStatus.PENDING).count()
        total_reservations = Reservation.objects.count()
        pending_reservations = Reservation.objects.filter(payment_status='pending').count()
        revenue = Reservation.objects.filter(payment_status='paid').aggregate(
            total=Sum(
                F('representation_reservations__price__price') * F('representation_reservations__quantity'),
                output_field=DecimalField(max_digits=12, decimal_places=2)
            )
        )['total'] or 0
        return Response({
            'total_users': total_users,
            'total_shows': total_shows,
            'pending_shows': pending_shows,
            'total_reservations': total_reservations,
            'pending_reservations': pending_reservations,
            'revenue': float(revenue),
        })


class AdminApiUsersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request, *args, **kwargs):
        """Get list of all users with admin info"""
        users = User.objects.select_related('profile').all().order_by('id')
        serializer = UserListAdminSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def put(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)

    def delete(self, request, *args, **kwargs):
        return Response({"detail": "Placeholder"}, status=501)


class AdminApiUserStatusView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, id):
        user = get_object_or_404(User.objects.select_related('profile'), pk=id)
        if user.is_staff or user.is_superuser:
            return Response(
                {'detail': 'Admin users cannot be deactivated.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])

        profile = getattr(user, 'profile', None)
        return Response(
            {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_active': user.is_active,
                'role': profile.role if profile else 'USER',
                'is_deleted': profile.is_deleted if profile else False,
            }
        )


class AdminShowDetailView(APIView):
    permission_classes = [IsAdminUser]

    def patch(self, request, id):
        show = get_object_or_404(Show, pk=id)
        requested_status = str(request.data.get('status', '')).strip().lower()

        if requested_status == 'validated':
            show.publication_status = Show.PublicationStatus.APPROVED
            show.bookable = False
            show.save(update_fields=['publication_status', 'bookable'])
            return Response({'id': show.id, 'publication_status': show.publication_status, 'bookable': show.bookable})

        if requested_status == 'rejected':
            show.publication_status = Show.PublicationStatus.REJECTED
            show.bookable = False
            show.save(update_fields=['publication_status', 'bookable'])
            return Response({'id': show.id, 'publication_status': show.publication_status, 'bookable': show.bookable})

        return Response(
            {'detail': "Statut invalide. Valeurs acceptees: validated, rejected."},
            status=status.HTTP_400_BAD_REQUEST,
        )


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


class AdminPendingProducersView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        profiles = (
            UserProfile.objects
            .select_related('user')
            .filter(role='PRODUCER')
            .order_by('user__id')
        )

        data = [
            {
                'id': profile.user.id,
                'name': (
                    f"{profile.user.first_name} {profile.user.last_name}".strip()
                    or profile.user.username
                ),
                'email': profile.user.email,
                'status': (
                    'deleted'
                    if profile.is_deleted
                    else ('approved' if profile.user.is_active else 'pending')
                ),
            }
            for profile in profiles
        ]
        return Response(data)


class AdminPendingProducerDetailView(APIView):
    permission_classes = [IsAdminUser]

    def _get_producer(self, id):
        return get_object_or_404(
            User.objects.select_related('profile'),
            id=id,
            profile__role='PRODUCER',
        )

    def patch(self, request, id):
        user = self._get_producer(id)
        if user.profile.is_deleted:
            return Response(
                {'detail': 'This producer has been deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = True
        user.save(update_fields=['is_active'])
        return Response(
            {
                'id': user.id,
                'name': (
                    f"{user.first_name} {user.last_name}".strip()
                    or user.username
                ),
                'email': user.email,
                'status': 'approved',
            }
        )

    def delete(self, request, id):
        user = self._get_producer(id)
        if user.profile.is_deleted:
            return Response(
                {'detail': 'This producer has already been deleted.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.is_active = False
        user.set_unusable_password()
        user.save(update_fields=['is_active', 'password'])
        user.profile.is_deleted = True
        user.profile.save(update_fields=['is_deleted'])

        return Response(
            {
                'id': user.id,
                'name': (
                    f"{user.first_name} {user.last_name}".strip()
                    or user.username
                ),
                'email': user.email,
                'status': 'deleted',
            }
        )
