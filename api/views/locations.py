from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from catalogue.models import Location, Show
from api.serializers.locations import LocationSerializer


class LocationsView(APIView):
    """
    GET: Récupère tous les lieux avec options pour inclure les shows
    POST: Crée un nouveau lieu
    """

    def get(self, request, *args, **kwargs):
        include_shows = request.query_params.get('include_shows', 'false').lower() == 'true'
        locations = Location.objects.prefetch_related('shows').all()
        
        if include_shows:
            # Include upcoming shows for each location
            data = []
            for location in locations:
                shows = location.shows.filter(
                    publication_status='approved',
                    bookable=True
                ).order_by('-created_at')
                
                shows_data = []
                for show in shows:
                    representations = show.representations.filter(
                        when__gte=timezone.now()
                    ).order_by('when')
                    
                    shows_data.append({
                        'id': show.id,
                        'title': show.title,
                        'slug': show.slug,
                        'poster_url': show.poster_url,
                        'duration': show.duration,
                        'artist': {
                            'id': show.artist.id,
                            'name': show.artist.name
                        } if show.artist else None,
                        'upcoming_representations': [
                            {
                                'id': r.id,
                                'when': r.when,
                            }
                            for r in representations[:3]  # Limit to 3 upcoming
                        ]
                    })
                
                location_data = LocationSerializer(location).data
                location_data['shows'] = shows_data
                data.append(location_data)
            return Response(data, status=status.HTTP_200_OK)
        else:
            serializer = LocationSerializer(locations, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        serializer = LocationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LocationsDetailView(APIView):
    """
    GET: Récupère un lieu spécifique avec ses shows
    PUT: Met à jour un lieu
    DELETE: Supprime un lieu
    """

    def get(self, request, id, *args, **kwargs):
        try:
            location = Location.objects.prefetch_related('shows').get(id=id)
        except Location.DoesNotExist:
            return Response(
                {"detail": "Lieu non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        include_shows = request.query_params.get('include_shows', 'false').lower() == 'true'
        
        if include_shows:
            shows = location.shows.filter(
                publication_status='approved',
                bookable=True
            ).order_by('-created_at')
            
            shows_data = []
            for show in shows:
                representations = show.representations.filter(
                    when__gte=timezone.now()
                ).order_by('when')
                
                shows_data.append({
                    'id': show.id,
                    'title': show.title,
                    'slug': show.slug,
                    'poster_url': show.poster_url,
                    'duration': show.duration,
                    'artist': {
                        'id': show.artist.id,
                        'name': show.artist.name
                    } if show.artist else None,
                    'upcoming_representations': [
                        {
                            'id': r.id,
                            'when': r.when,
                        }
                        for r in representations[:3]
                    ]
                })
            
            location_data = LocationSerializer(location).data
            location_data['shows'] = shows_data
            return Response(location_data, status=status.HTTP_200_OK)
        else:
            serializer = LocationSerializer(location)
            return Response(serializer.data, status=status.HTTP_200_OK)

    def put(self, request, id, *args, **kwargs):
        try:
            location = Location.objects.get(id=id)
        except Location.DoesNotExist:
            return Response(
                {"detail": "Lieu non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = LocationSerializer(
            location, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id, *args, **kwargs):
        try:
            location = Location.objects.get(id=id)
        except Location.DoesNotExist:
            return Response(
                {"detail": "Lieu non trouvé"},
                status=status.HTTP_404_NOT_FOUND
            )

        location.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
