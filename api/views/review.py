from rest_framework import generics, permissions, status
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from catalogue.models.review import Review
from api.serializers.review import ReviewSerializer, ReviewModerationSerializer
from rest_framework.response import Response


class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]

    @staticmethod
    def _is_admin_like(user):
        if not user or not user.is_authenticated:
            return False
        profile_role = getattr(getattr(user, 'profile', None), 'role', '')
        return bool(user.is_staff or user.is_superuser or profile_role == 'ADMIN')

    def get_permissions(self):
        # Tout le monde peut voir les avis, mais il faut être connecté pour poster
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        show_id = self.request.query_params.get('show_id')
        status_filter = self.request.query_params.get('status')
        is_admin_like = self._is_admin_like(self.request.user)

        # Si c'est un admin, il peut voir tous les avis (pour la modération)
        if is_admin_like:
            queryset = Review.objects.all()
        else:
            # Pour le public, on ne montre que les avis approuvés
            queryset = Review.objects.filter(status='approved')

        if status_filter:
            allowed_statuses = {'pending', 'approved', 'rejected'}
            if status_filter in allowed_statuses and (status_filter == 'approved' or is_admin_like):
                queryset = queryset.filter(status=status_filter)

        if show_id:
            queryset = queryset.filter(show_id=show_id)
        return queryset

    def perform_create(self, serializer):
        # On force l'auteur de l'avis et le statut 'pending'
        serializer.save(user=self.request.user, status='pending')


class ReviewAdminUpdateView(generics.UpdateAPIView):
    """Vue pour permettre aux admins/producteurs d'approuver un avis"""
    queryset = Review.objects.all()
    serializer_class = ReviewModerationSerializer

    @staticmethod
    def _is_admin_like(user):
        if not user or not user.is_authenticated:
            return False
        profile_role = getattr(getattr(user, 'profile', None), 'role', '')
        return bool(user.is_staff or user.is_superuser or profile_role == 'ADMIN')

    def patch(self, request, *args, **kwargs):
        if not self._is_admin_like(request.user):
            return Response({'detail': 'Vous n\'avez pas la permission.'}, status=status.HTTP_403_FORBIDDEN)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)
