from django.core.mail import send_mail
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings


class Command(BaseCommand):
    help = 'Envoie un email de test pour vérifier la configuration Gmail'

    def add_arguments(self, parser):
        parser.add_argument(
            'recipient_email',
            type=str,
            help='Email de destination pour le test'
        )

    def handle(self, *args, **options):
        recipient_email = options['recipient_email']

        try:
            self.stdout.write(
                self.style.WARNING(f'Sending test email to {recipient_email}...')
            )

            send_mail(
                subject='Email de test - PID Groupe 3',
                message=(
                    'Cet email de test a été envoyé avec succès!\n\n'
                    'Configuration:\n'
                    f'FROM: {settings.DEFAULT_FROM_EMAIL}\n'
                    f'TO: {recipient_email}\n'
                    f'EMAIL_HOST: {settings.EMAIL_HOST}\n'
                    f'EMAIL_PORT: {settings.EMAIL_PORT}\n'
                    f'EMAIL_USE_TLS: {settings.EMAIL_USE_TLS}\n'
                ),
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recipient_email],
                fail_silently=False,
            )

            self.stdout.write(
                self.style.SUCCESS(
                    f'✓ Email sent successfully to {recipient_email}!'
                )
            )

        except Exception as e:
            raise CommandError(
                f'✗ Failed to send email: {str(e)}\n'
                f'Please check your Gmail configuration in .env file'
            )
