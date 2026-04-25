from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import SearchFilter, OrderingFilter
from catalogue.models import Show
from api.serializers.shows import ShowSerializer
from api.filters import ShowFilter


class ShowsView(generics.GenericAPIView):
    queryset = Show.objects.all()
    serializer_class = ShowSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_class = ShowFilter
    search_fields = ['title', 'description']
    ordering_fields = ['title', 'created_at']
    ordering = ['title']

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = ShowSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShowsDetailView(generics.GenericAPIView):
    serializer_class = ShowSerializer

    def get_object(self, slug):
        try:
            return Show.objects.get(slug=slug)
        except Show.DoesNotExist:
            return None

    def get(self, request, slug, *args, **kwargs):
        show = self.get_object(slug)
        if show is None:
            return Response(
                {"detail": "Spectacle non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ShowSerializer(show)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, slug, *args, **kwargs):
        show = self.get_object(slug)
        if show is None:
            return Response(
                {"detail": "Spectacle non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        serializer = ShowSerializer(show, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, slug, *args, **kwargs):
        show = self.get_object(slug)
        if show is None:
            return Response(
                {"detail": "Spectacle non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )
        show.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ShowsSearchView(generics.GenericAPIView):
    serializer_class = ShowSerializer
    filter_backends = [SearchFilter]
    search_fields = ['title', 'description']

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if query:
            return Show.objects.filter(title__icontains=query)
        return Show.objects.all()

    def get(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
