import logging
import re

from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth import login as auth_login
from django.contrib.auth import logout as auth_logout
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import EmailMultiAlternatives, send_mail
from django.middleware.csrf import get_token
from django.template.loader import render_to_string
from django.conf import settings
from django.utils.decorators import method_decorator
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.views.decorators.csrf import csrf_exempt
from api.models import UserProfile
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import AnonRateThrottle
from rest_framework.views import APIView
from rest_framework import status
from rest_framework.throttling import AnonRateThrottle as PasswordResetThrottle
logger = logging.getLogger(__name__)


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

        role = data.get('role', 'USER')
        if role not in ('USER', 'PRODUCER', 'PRESS_CRITIC'):
            role = 'USER'

        user = User.objects.create_user(
            username=username,
            password=password,
            email=email,
            first_name=first_name,
            last_name=last_name,
        )

        if role in ('PRODUCER', 'PRESS_CRITIC'):
            user.is_active = False
            user.save(update_fields=['is_active'])

        # Mise à jour du rôle sur le profil (créé automatiquement par signal ou manuellement)
        if hasattr(user, 'profile'):
            user.profile.role = role
            user.profile.save()
        else:
            UserProfile.objects.update_or_create(user=user, defaults={'role': role})

        try:
            send_mail(
                subject='Bienvenue sur PIDBooking !',
                message=(
                    f'Bonjour {first_name or username},\n\n'
                    'Votre compte a été créé avec succès sur PIDBooking.\n\n'
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


@method_decorator(csrf_exempt, name='dispatch')
class AuthLoginView(APIView):
    authentication_classes = []
    permission_classes = [AllowAny]

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
        csrf_token = get_token(request)
        role = user.profile.role if hasattr(user, 'profile') else 'USER'

        return Response({
            "success": True,
            "username": user.username,
            "email": user.email,
            "is_staff": user.is_staff,
            "role": role,
            "csrf_token": csrf_token,
        })


@method_decorator(csrf_exempt, name='dispatch')
class AuthLogoutView(APIView):
    def post(self, request, *args, **kwargs):
        auth_logout(request)
        return Response({"success": True, "message": "Déconnecté"})


@api_view(['GET'])
@permission_classes([AllowAny])
def csrf_token(request):
    return Response({"csrf_token": get_token(request)})


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


class PasswordResetView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [PasswordResetThrottle]

    def post(self, request):
        email = request.data.get('email', '').strip()
        lang = request.data.get('lang', 'fr').strip().lower()
        logger.info(
            "PasswordResetView called: email_present=%s lang=%s backend=%s host=%s port=%s tls=%s from_email=%s",
            bool(email),
            lang,
            getattr(settings, 'EMAIL_BACKEND', ''),
            getattr(settings, 'EMAIL_HOST', ''),
            getattr(settings, 'EMAIL_PORT', ''),
            getattr(settings, 'EMAIL_USE_TLS', ''),
            getattr(settings, 'DEFAULT_FROM_EMAIL', ''),
        )
        if lang not in ('fr', 'nl', 'en'):
            lang = 'fr'

        if not email:
            logger.warning('Password reset rejected: missing email in request payload')
            return Response(
                {'error': "L'email est requis."},
                status=status.HTTP_400_BAD_REQUEST
            )

        _GENERIC = Response({
            'message': 'Si cet email existe, un lien de réinitialisation a été envoyé.'
        })

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            logger.info('Password reset requested for unknown email. Returning generic response.')
            return _GENERIC

        logger.info('Password reset user resolved: user_id=%s username=%s', user.id, user.username)

        token = PasswordResetTokenGenerator().make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:5173').rstrip('/')
        reset_url = f'{frontend_url}/{lang}/reset-password?token={token}&uid={uid}'
        logger.info(
            'Password reset token and URL generated: user_id=%s uid=%s token_prefix=%s frontend_url=%s',
            user.id,
            uid,
            token[:12],
            frontend_url,
        )

        # ── Traductions de l'email ─────────────────────────────────────────────
        _I18N = {
            'fr': {
                'subject': 'Réinitialisation de votre mot de passe — Brussels Show',
                'greeting': f'Bonjour {user.first_name or user.username},',
                'intro': (
                    'Vous avez demandé la réinitialisation de votre mot de passe Brussels Show. '
                    'Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.'
                ),
                'btn_label': 'Réinitialiser le mot de passe',
                'fallback_intro': (
                    'Si le bouton ne fonctionne pas, copiez et collez le lien '
                    'ci-dessous dans votre navigateur :'
                ),
                'fallback_label': 'Lien de secours :',
                'expiry': 'Ce lien est valable 24 heures.',
                'no_request': "Si vous n'êtes pas à l'origine de cette demande, ignorez simplement cet email.",
                'footer_note': (
                    'Vous recevez cet email car vous avez demandé la '
                    'réinitialisation de votre mot de passe.'
                ),
            },
            'nl': {
                'subject': 'Wachtwoord opnieuw instellen — Brussels Show',
                'greeting': f'Hallo {user.first_name or user.username},',
                'intro': (
                    'U heeft een verzoek ingediend om uw Brussels Show-wachtwoord opnieuw in te stellen. '
                    'Klik op de onderstaande knop om een nieuw wachtwoord te kiezen.'
                ),
                'btn_label': 'Wachtwoord opnieuw instellen',
                'fallback_intro': (
                    'Als de knop niet werkt, kopieer dan de onderstaande link '
                    'en plak deze in uw browser:'
                ),
                'fallback_label': 'Reservelink:',
                'expiry': 'Deze link is 24 uur geldig.',
                'no_request': 'Als u dit verzoek niet heeft ingediend, kunt u deze e-mail gerust negeren.',
                'footer_note': 'U ontvangt deze e-mail omdat u een wachtwoordreset heeft aangevraagd.',
            },
            'en': {
                'subject': 'Reset your password — Brussels Show',
                'greeting': f'Hello {user.first_name or user.username},',
                'intro': (
                    'You requested a password reset for your Brussels Show account. '
                    'Click the button below to choose a new password.'
                ),
                'btn_label': 'Reset my password',
                'fallback_intro': (
                    'If the button does not work, copy and paste the link '
                    'below into your browser:'
                ),
                'fallback_label': 'Fallback link:',
                'expiry': 'This link expires in 24 hours.',
                'no_request': "If you did not request this, you can safely ignore this email.",
                'footer_note': (
                    'You are receiving this email because a password reset was '
                    'requested for your account.'
                ),
            },
        }
        strings = _I18N[lang]

        # ── Rendu HTML ─────────────────────────────────────────────────────────
        html_body = render_to_string('emails/password_reset.html', {
            'lang': lang,
            'subject': strings['subject'],
            'greeting': strings['greeting'],
            'intro': strings['intro'],
            'btn_label': strings['btn_label'],
            'fallback_intro': strings['fallback_intro'],
            'fallback_label': strings['fallback_label'],
            'reset_url': reset_url,
            'expiry': strings['expiry'],
            'no_request': strings['no_request'],
            'footer_note': strings['footer_note'],
        })

        # ── Texte brut de secours ──────────────────────────────────────────────
        text_body = (
            f"{strings['greeting']}\n\n"
            f"{strings['intro']}\n\n"
            f"{reset_url}\n\n"
            f"{strings['expiry']}\n\n"
            f"{strings['no_request']}\n\n"
            "Brussels Show"
        )

        try:
            logger.info('Attempting password reset email send: user_id=%s recipient=%s', user.id, email)
            msg = EmailMultiAlternatives(
                subject=strings['subject'],
                body=text_body,
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )
            msg.attach_alternative(html_body, 'text/html')
            msg.send(fail_silently=False)
            logger.info('Password reset email sent successfully: user_id=%s recipient=%s', user.id, email)
        except Exception:
            logger.exception('Password reset email send failed: user_id=%s recipient=%s', user.id, email)
            if getattr(settings, 'SMTP_DEBUG', False):
                return Response(
                    {'error': 'SMTP send failed. Check server logs for details.'},
                    status=status.HTTP_503_SERVICE_UNAVAILABLE,
                )

        return _GENERIC


class PasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        uid = request.data.get('uid', '')
        token = request.data.get('token', '')
        new_password = request.data.get('new_password', '')

        if not uid or not token or not new_password:
            return Response(
                {'error': 'Tous les champs sont requis.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            user_pk = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_pk)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response(
                {'error': 'Lien invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not PasswordResetTokenGenerator().check_token(user, token):
            return Response(
                {'error': 'Token invalide ou expiré.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if len(new_password) < 6:
            return Response(
                {'error': 'Le mot de passe doit contenir au moins 6 caractères.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not re.search(r'[A-Z]', new_password):
            return Response(
                {'error': 'Le mot de passe doit contenir au moins une majuscule.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if not re.search(r'[^a-zA-Z0-9]', new_password):
            return Response(
                {'error': 'Le mot de passe doit contenir au moins un caractère spécial.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password)
        user.save()

        return Response({'message': 'Mot de passe réinitialisé avec succès.'})
