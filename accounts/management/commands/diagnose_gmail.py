from django.core.mail import get_connection
from django.conf import settings
from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Diagnostic de la configuration Gmail'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('\n📋 DIAGNOSTIC GMAIL SMTP\n'))

        placeholder_users = {
            'votre.email@gmail.com',
            'votre.adresse@gmail.com',
            'ton_gmail',
        }
        placeholder_passwords = {
            '',
            'votre-mot-passe-application-gmail',
            'mot_de_passe_application_google_16_caracteres',
            'xxxx xxxx xxxx xxxx',
        }
        
        # 1. Vérifier les paramètres
        self.stdout.write('1️⃣  Paramètres configurés:')
        self.stdout.write(f'   EMAIL_BACKEND: {settings.EMAIL_BACKEND}')
        self.stdout.write(f'   EMAIL_HOST: {settings.EMAIL_HOST}')
        self.stdout.write(f'   EMAIL_PORT: {settings.EMAIL_PORT}')
        self.stdout.write(f'   EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}')
        self.stdout.write(f'   EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}')
        
        # Masquer le mot de passe pour la sécurité
        password = settings.EMAIL_HOST_PASSWORD
        if password:
            masked = password[:2] + '*' * (len(password) - 4) + password[-2:]
            self.stdout.write(f'   EMAIL_HOST_PASSWORD: {masked}')
        else:
            self.stdout.write(self.style.ERROR('   EMAIL_HOST_PASSWORD: ❌ VIDE!'))
        
        self.stdout.write(f'   DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}\n')
        
        # 2. Vérifier les valeurs par défaut (placeholders)
        self.stdout.write('2️⃣  Vérification des placeholders:')
        
        if settings.EMAIL_HOST_USER in placeholder_users:
            self.stdout.write(
                self.style.ERROR(
                    '   ❌ EMAIL_HOST_USER est un placeholder! '
                    'Remplacez par votre vraie adresse Gmail.'
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS(f'   ✓ EMAIL_HOST_USER: {settings.EMAIL_HOST_USER}'))
        
        raw_password = (settings.EMAIL_HOST_PASSWORD or '').strip()
        normalized_password = raw_password.replace(' ', '')

        if raw_password in placeholder_passwords:
            self.stdout.write(
                self.style.ERROR(
                    '   ❌ EMAIL_HOST_PASSWORD est vide ou placeholder! '
                    'Générez un mot de passe application sur Google.'
                )
            )
        elif len(normalized_password) != 16:
            self.stdout.write(
                self.style.ERROR(
                    f'   ❌ EMAIL_HOST_PASSWORD invalide: longueur={len(normalized_password)} (attendu: 16 sans espaces).'
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS('   ✓ EMAIL_HOST_PASSWORD: format 16 caractères OK'))
        
        if settings.DEFAULT_FROM_EMAIL in placeholder_users:
            self.stdout.write(
                self.style.ERROR(
                    '   ❌ DEFAULT_FROM_EMAIL est un placeholder! '
                    'Remplacez par votre vrai email.'
                )
            )
        else:
            self.stdout.write(self.style.SUCCESS(f'   ✓ DEFAULT_FROM_EMAIL: {settings.DEFAULT_FROM_EMAIL}'))

        self.stdout.write('\n2️⃣bis FRONTEND_URL:')
        frontend_url = getattr(settings, 'FRONTEND_URL', '')
        if not frontend_url:
            self.stdout.write(self.style.ERROR('   ❌ FRONTEND_URL est vide.'))
        else:
            self.stdout.write(self.style.SUCCESS(f'   ✓ FRONTEND_URL: {frontend_url}'))
        
        self.stdout.write('\n3️⃣  Test de connexion SMTP:')
        
        try:
            connection = get_connection()
            connection.open()
            self.stdout.write(self.style.SUCCESS('   ✓ Connexion SMTP réussie!'))
            connection.close()
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'   ❌ Erreur de connexion: {str(e)}'))
            self.stdout.write(
                self.style.WARNING(
                    '\n   Causes possibles:\n'
                    '   - EMAIL_HOST_USER ou EMAIL_HOST_PASSWORD incorrect\n'
                    '   - 2FA non activée sur votre compte Google\n'
                    '   - Mot de passe application non généré (pas un mot de passe Gmail normal)\n'
                    '   - Pare-feu bloquant la connexion SMTP\n'
                )
            )
        
        self.stdout.write('\n4️⃣  Checklist:')
        self.stdout.write('   ☐ Avez-vous activé la 2FA sur votre compte Gmail?')
        self.stdout.write('   ☐ Avez-vous généré un mot de passe application?')
        self.stdout.write('   ☐ Avez-vous choisi "Mail" et votre OS?')
        self.stdout.write('   ☐ Avez-vous mis à jour le .env avec le mot de passe?')
        self.stdout.write('   ☐ Le mot de passe a 16 caractères (sans espaces)?')
        self.stdout.write(
            '\n📘 Guide: https://myaccount.google.com/apppasswords'
        )
        self.stdout.write('\n')
