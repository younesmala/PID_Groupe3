import re
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from api.models import NewsletterSubscriber

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


@api_view(['POST'])
@permission_classes([AllowAny])
def newsletter_subscribe(request):
    email = (request.data.get('email') or '').strip().lower()

    if not email or not EMAIL_RE.match(email):
        return Response(
            {'error': 'Adresse email invalide.'},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if NewsletterSubscriber.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email déjà inscrit.'},
            status=status.HTTP_409_CONFLICT,
        )

    NewsletterSubscriber.objects.create(email=email)
    return Response(
        {'message': 'Inscription réussie.'},
        status=status.HTTP_201_CREATED,
    )