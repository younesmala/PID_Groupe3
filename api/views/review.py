from rest_framework import generics, permissions
from catalogue.models.review import Review
from api.serializers.review import ReviewSerializer

class ReviewListCreateView(generics.ListCreateAPIView):
    serializer_class = ReviewSerializer

    def get_permissions(self):
        # Tout le monde peut voir les avis, mais il faut être connecté pour poster
        if self.request.method == 'POST':
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def get_queryset(self):
        # Pour le public, on ne montre que les avis approuvés
        show_id = self.request.query_params.get('show_id')
        queryset = Review.objects.filter(status='approved')
        if show_id:
            queryset = queryset.filter(show_id=show_id)
        return queryset

    def perform_create(self, serializer):
        # On force l'auteur de l'avis et le statut 'pending'
        serializer.save(user=self.request.user, status='pending')