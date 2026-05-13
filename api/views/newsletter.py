import json
from django.http import JsonResponse
from django.views import View
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.core.mail import EmailMultiAlternatives
from django.template.loader import render_to_string
from django.conf import settings
from catalogue.models import NewsletterSubscriber


@method_decorator(csrf_exempt, name='dispatch')
class NewsletterSubscribeView(View):
    def post(self, request):
        try:
            data = json.loads(request.body)
            email = data.get('email', '').strip()
        except (json.JSONDecodeError, AttributeError):
            return JsonResponse({'error': 'Invalid data'}, status=400)

        if not email:
            return JsonResponse({'error': 'Email required'}, status=400)

        _, created = NewsletterSubscriber.objects.get_or_create(email=email)
        if not created:
            return JsonResponse({'message': 'Already subscribed'}, status=200)

        try:
            html_content = render_to_string('emails/newsletter_confirm.html', {'email': email})
            msg = EmailMultiAlternatives(
                subject="Confirmation d'abonnement — Brussels Show",
                body=f"Merci de vous être abonné à la newsletter Brussels Show. Adresse enregistrée : {email}",
                from_email=settings.DEFAULT_FROM_EMAIL,
                to=[email],
            )
            msg.attach_alternative(html_content, 'text/html')
            msg.send()
        except Exception:
            pass

        return JsonResponse({'message': 'Subscribed successfully'}, status=201)
