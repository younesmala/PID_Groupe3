import requests
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status


@api_view(['GET'])
@permission_classes([AllowAny])
def brussels_events(request):
    """
    Consomme l'API OpenAgenda pour récupérer
    les événements culturels de Bruxelles.
    """
    try:
        url = (
            "https://opendata.brussels.be/api/explore/v2.1"
            "/catalog/datasets/agenda/records"
            "?limit=10&lang=fr"
        )
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            data = response.json()
            events = []
            for record in data.get('results', []):
                events.append({
                    'title': record.get('title', ''),
                    'description': record.get('description', ''),
                    'location': record.get('location', ''),
                    'start_date': record.get('startdate', ''),
                    'end_date': record.get('enddate', ''),
                })
            return Response({
                'source': 'OpenData Brussels',
                'count': len(events),
                'events': events
            })
        else:
            # Fallback : données statiques de démonstration
            return Response({
                'source': 'OpenData Brussels (demo)',
                'count': 3,
                'events': [
                    {
                        'title': 'Festival Jazz Brussels',
                        'description': 'Festival de jazz au centre de Bruxelles',
                        'location': 'Grand Place, Bruxelles',
                        'start_date': '2026-05-01',
                        'end_date': '2026-05-05',
                    },
                    {
                        'title': 'Théâtre Royal de la Monnaie',
                        'description': 'Opéra et ballet à Bruxelles',
                        'location': 'Place de la Monnaie, 1000 Bruxelles',
                        'start_date': '2026-05-10',
                        'end_date': '2026-05-20',
                    },
                    {
                        'title': 'Musées en Fête',
                        'description': 'Nuit des musées bruxellois',
                        'location': 'Bruxelles centre',
                        'start_date': '2026-05-15',
                        'end_date': '2026-05-15',
                    },
                ]
            })
    except Exception:
        return Response(
            {
                'source': 'OpenData Brussels (demo)',
                'count': 3,
                'events': [
                    {
                        'title': 'Festival Jazz Brussels',
                        'description': 'Festival de jazz au centre de Bruxelles',
                        'location': 'Grand Place, Bruxelles',
                        'start_date': '2026-05-01',
                        'end_date': '2026-05-05',
                    },
                    {
                        'title': 'Théâtre Royal de la Monnaie',
                        'description': 'Opéra et ballet à Bruxelles',
                        'location': 'Place de la Monnaie, 1000 Bruxelles',
                        'start_date': '2026-05-10',
                        'end_date': '2026-05-20',
                    },
                    {
                        'title': 'Musées en Fête',
                        'description': 'Nuit des musées bruxellois',
                        'location': 'Bruxelles centre',
                        'start_date': '2026-05-15',
                        'end_date': '2026-05-15',
                    },
                ]
            }
        )


@api_view(['GET'])
@permission_classes([AllowAny])
def external_shows(request):
    """
    Consomme le webservice Théâtre Contemporain
    pour récupérer des spectacles externes.
    """
    try:
        url = (
            "https://www.theatre-contemporain.net"
            "/api/shows?format=json&limit=20"
        )
        response = requests.get(url, timeout=10)

        if response.status_code == 200:
            data = response.json()
            return Response({
                'source': 'Théâtre Contemporain',
                'data': data
            })
        else:
            return Response(
                {
                    'source': 'Théâtre Contemporain',
                    'error': 'API indisponible',
                    'status': response.status_code
                },
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
    except requests.exceptions.Timeout:
        return Response(
            {'error': 'Timeout'},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
