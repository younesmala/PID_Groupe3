from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from catalogue.models.show import Show
from catalogue.models.representation import Representation


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def show_stats(request):
    shows = Show.objects.all()
    stats = []

    for show in shows:
        representations = Representation.objects.filter(show=show)
        total_representations = representations.count()
        total_seats = sum(
            r.available_seats for r in representations
        )

        stats.append({
            'show_id': show.id,
            'title': show.title,
            'bookable': show.bookable,
            'total_representations': total_representations,
            'total_available_seats': total_seats,
        })

    return Response({
        'total_shows': len(stats),
        'shows': stats,
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def show_stat_detail(request, show_id):
    try:
        show = Show.objects.get(id=show_id)
    except Show.DoesNotExist:
        return Response(
            {'error': 'Spectacle introuvable.'},
            status=status.HTTP_404_NOT_FOUND
        )

    representations = Representation.objects.filter(
        show=show
    ).order_by('schedule')

    rep_data = []
    for rep in representations:
        rep_data.append({
            'representation_id': rep.id,
            'schedule': rep.schedule.strftime('%d/%m/%Y %H:%M'),
            'location': str(rep.location) if rep.location else None,
            'available_seats': rep.available_seats,
        })

    return Response({
        'show_id': show.id,
        'title': show.title,
        'bookable': show.bookable,
        'total_representations': len(rep_data),
        'representations': rep_data,
    })
