from django.contrib.auth import authenticate
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.core.mail import send_mail
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth.models import User
import re


class AuthSignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        data = request.data
        username = data.get('username', '').strip()
        password = data.get('password', '')
        confirm_password = data.get('confirm_password', '')
        email = data.get('email', '').strip()
        first_name = data.get('first_name', '').strip()
        last_name = data.get('last_name', '').strip()

        errors = {}

        if not username:
            errors['username'] = 'Le nom d\'utilisateur est requis.'
        elif User.objects.filter(username=username).exists():
            errors['username'] = 'Ce nom d\'utilisateur est déjà pris.'

        if not email:
            errors['email'] = 'L\'email est requis.'
        elif User.objects.filter(email=email).exists():
            errors['email'] = 'Cet email est déjà utilisé.'

        if not password:
            errors['password'] = 'Le mot de passe est requis.'
        elif len(password) < 6:
            errors['password'] = 'Le mot de passe doit contenir au moins 6 caractères.'
        elif not re.search(r'[A-Z]', password):
            errors['password'] = 'Le mot de passe doit contenir au moins une majuscule.'
        elif not re.search(r'[^a-zA-Z0-9]', password):
            errors['password'] = 'Le mot de passe doit contenir au moins un caractère spécial.'

        if password != confirm_password:
            errors['confirm_password'] = 'Les mots de passe ne correspondent pas.'

        if errors:
            return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )

        try:
            send_mail(
                subject='Bienvenue sur Brussels Show !',
                message=(
                    f'Bonjour {first_name or username},\n\n'
                    'Votre compte a été créé avec succès.\n\n'
                    'L\'équipe Brussels Show'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=True,
            )
        except Exception:
            pass

        return Response({
            'message': 'Compte créé avec succès.',
            'username': user.username,
            'email': user.email,
        }, status=status.HTTP_201_CREATED)


@method_decorator(csrf_exempt, name='dispatch')
class AuthLoginView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username', '')
        password = request.data.get('password', '')

        user = authenticate(request, username=username, password=password)
        if user is None:
            return Response(
                {"success": False, "error": "Identifiants incorrects"},
                status=400
            )

        auth_login(request, user)
        return Response({
            "success": True,
            "username": user.username,
            "email": user.email,
        })


@method_decorator(csrf_exempt, name='dispatch')
class AuthLogoutView(APIView):
    def post(self, request, *args, **kwargs):
        auth_logout(request)
        return Response({"success": True, "message": "Déconnecté"})


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    username = data.get('username', '').strip()
    password = data.get('password', '')
    confirm_password = data.get('confirm_password', '')
    email = data.get('email', '').strip()
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()

    errors = {}

    if not username:
        errors['username'] = 'Le nom d\'utilisateur est requis.'
    elif User.objects.filter(username=username).exists():
        errors['username'] = 'Ce nom d\'utilisateur est déjà pris.'

    if not email:
        errors['email'] = 'L\'email est requis.'
    elif User.objects.filter(email=email).exists():
        errors['email'] = 'Cet email est déjà utilisé.'

    if not password:
        errors['password'] = 'Le mot de passe est requis.'
    elif len(password) < 6:
        errors['password'] = 'Le mot de passe doit contenir au moins 6 caractères.'
    elif not re.search(r'[A-Z]', password):
        errors['password'] = 'Le mot de passe doit contenir au moins une majuscule.'
    elif not re.search(r'[^a-zA-Z0-9]', password):
        errors['password'] = 'Le mot de passe doit contenir au moins un caractère spécial.'

    if password != confirm_password:
        errors['confirm_password'] = 'Les mots de passe ne correspondent pas.'

    if errors:
        return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(
        username=username,
        password=password,
        email=email,
        first_name=first_name,
        last_name=last_name,
    )

    try:
        send_mail(
            subject='Bienvenue sur PIDBooking !',
            message=(
                f'Bonjour {first_name or username},\n\n'
                'Votre compte a été créé avec succès.\n\n'
                'L\'équipe PIDBooking'
            ),
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
            fail_silently=True,
        )
    except Exception:
        pass

    return Response({
        'message': 'Compte créé avec succès.',
        'username': user.username,
        'email': user.email,
    }, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([AllowAny])
def check_username(request):
    username = request.GET.get('username', '').strip()
    if not username:
        return Response({'available': False, 'message': 'Username requis.'})
    exists = User.objects.filter(username=username).exists()
    return Response({
        'available': not exists,
        'message': 'Disponible' if not exists else 'Déjà pris'
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def check_email(request):
    email = request.GET.get('email', '').strip()
    if not email:
        return Response({'available': False, 'message': 'Email requis.'})
    exists = User.objects.filter(email=email).exists()
    return Response({
        'available': not exists,
        'message': 'Disponible' if not exists else 'Déjà utilisé'
    })
