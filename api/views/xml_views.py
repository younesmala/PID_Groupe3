import xml.etree.ElementTree as ET
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from catalogue.models.show import Show


def _parse_bool(value, default=True):
    if value is None:
        return default
    return value.strip().lower() in ('true', '1', 'yes')


def _parse_int(value, field):
    if value is None or value.strip() == '':
        raise ValueError(f"Le champ '{field}' est requis et doit être un entier.")
    try:
        return int(value.strip())
    except ValueError:
        raise ValueError(f"Le champ '{field}' doit être un entier, reçu : '{value.strip()}'.")


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_shows_xml(request):
    if 'file' not in request.FILES:
        return Response(
            {'error': 'Aucun fichier fourni.'},
            status=status.HTTP_400_BAD_REQUEST
        )
    file = request.FILES['file']
    if not file.name.endswith('.xml'):
        return Response(
            {'error': 'Le fichier doit être au format XML.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        tree = ET.parse(file)
        root = tree.getroot()
    except ET.ParseError as e:
        return Response(
            {'error': f'Fichier XML invalide : {e}'},
            status=status.HTTP_400_BAD_REQUEST
        )

    imported = 0
    errors = 0

    for node in root.findall('show'):
        try:
            title = (node.findtext('title') or '').strip()
            if not title:
                raise ValueError("Le champ 'title' est requis.")

            created_in = _parse_int(node.findtext('created_in'), 'created_in')
            duration_raw = node.findtext('duration')
            duration = _parse_int(duration_raw, 'duration') if duration_raw else None
            description = node.findtext('description')
            bookable = _parse_bool(node.findtext('bookable'), default=True)

            Show.objects.create(
                title=title,
                description=description,
                duration=duration,
                created_in=created_in,
                bookable=bookable,
                producer=request.user,
            )
            imported += 1
        except Exception:
            errors += 1

    return Response(
        {'imported': imported, 'errors': errors},
        status=status.HTTP_200_OK
    )
