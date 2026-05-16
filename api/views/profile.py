from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from catalogue.models import UserMeta


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    try:
        langue = user.usermeta.langue
    except UserMeta.DoesNotExist:
        langue = ''
    return Response({
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "date_joined": user.date_joined,
        "is_staff": user.is_staff,
        "language": langue,
    })


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_profile(request):
    user = request.user
    data = request.data
    user.first_name = data.get('first_name', user.first_name)
    user.last_name = data.get('last_name', user.last_name)
    user.email = data.get('email', user.email)
    if 'password' in data and data['password']:
        user.set_password(data['password'])
    user.save()
    language = data.get('language')
    if language:
        UserMeta.objects.update_or_create(
            user=user,
            defaults={'langue': language}
        )
    return Response({
        "message": "Profil mis à jour avec succès",
        "username": user.username,
        "email": user.email,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "language": language or '',
    })
