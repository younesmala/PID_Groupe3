from rest_framework import generics, permissions, status
from rest_framework.authentication import SessionAuthentication, BasicAuthentication, TokenAuthentication
from catalogue.models.review import Review
from api.serializers.review import ReviewSerializer
from rest_framework.response import Response

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer
    authentication_classes = [SessionAuthentication, BasicAuthentication, TokenAuthentication]

    def get_permissions(self):
        # Tout le monde peut voir les avis, mais il faut être connecté pour poster
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        show_id = self.request.query_params.get('show_id')
        
        # Si c'est un admin, il peut voir tous les avis (pour la modération)
        if self.request.user.is_staff:
            queryset = Review.objects.all()
        else:
            # Pour le public, on ne montre que les avis approuvés
            queryset = Review.objects.filter(status='approved')
            
        if show_id:
            queryset = queryset.filter(show_id=show_id)
        return queryset

    def perform_create(self, serializer):
        # On force l'auteur de l'avis et le statut 'pending'
        serializer.save(user=self.request.user, status='pending')

class ReviewAdminUpdateView(generics.UpdateAPIView):
    """Vue pour permettre aux admins/producteurs d'approuver un avis"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAdminUser]

    def patch(self, request, *args, **kwargs):
        review = self.get_object()
        review.status = request.data.get('status', 'pending')
        review.save()
        return Response({'status': 'updated'})