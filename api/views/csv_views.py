import csv
import io
from django.http import HttpResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.response import Response
from rest_framework import status
from catalogue.models.show import Show


@api_view(['GET'])
@permission_classes([IsAuthenticated, IsAdminUser])
def export_shows_csv(request):
    response = HttpResponse(content_type='text/csv')
    response['Content-Disposition'] = (
        'attachment; filename="shows.csv"'
    )
    writer = csv.writer(response)
    writer.writerow([
        'id', 'slug', 'title', 'description',
        'duration', 'created_in', 'bookable', 'created_at'
    ])
    for show in Show.objects.all().order_by('id'):
        writer.writerow([
            show.id,
            show.slug,
            show.title,
            show.description,
            show.duration,
            show.created_in,
            show.bookable,
            show.created_at,
        ])
    return response


@api_view(['POST'])
@permission_classes([IsAuthenticated, IsAdminUser])
def import_shows_csv(request):
    if 'file' not in request.FILES:
        return Response(
            {'error': 'Aucun fichier fourni.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    file = request.FILES['file']
    if not file.name.endswith('.csv'):
        return Response(
            {'error': 'Le fichier doit être au format CSV.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    decoded = file.read().decode('utf-8')
    reader = csv.DictReader(io.StringIO(decoded))
    created = 0
    errors = []
    for row in reader:
        try:
            Show.objects.update_or_create(
                slug=row.get('slug', ''),
                defaults={
                    'title': row.get('title', ''),
                    'description': row.get('description', ''),
                    'duration': row.get('duration') or None,
                    'created_in': int(row.get('created_in', 0)),
                    'bookable': row.get('bookable', 'True') == 'True',
                }
            )
            created += 1
        except Exception as e:
            errors.append(str(e))
    return Response({
        'message': f'{created} spectacle(s) importé(s).',
        'errors': errors
    }, status=status.HTTP_200_OK)
