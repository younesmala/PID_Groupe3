import re
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status
from api.models import NewsletterSubscriber

EMAIL_RE = re.compile(r'^[^\s@]+@[^\s@]+\.[^\s@]+$')


@api_view(['POST'])
@authentication_classes([])
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
    msg = (
        f'Bonjour,\n\nVous êtes bien inscrit à la newsletter '
        f'BrusselsShow avec l\'adresse {email}.\n\nÀ bientôt !'
    )
    send_mail(
        subject='Confirmation inscription newsletter BrusselsShow',
        message=msg,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=True,
    )
    return Response(
        {'message': 'Inscription réussie.'},
        status=status.HTTP_201_CREATED,
    )
