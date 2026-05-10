#!/usr/bin/env python3
"""
Script pour configurer l'envoi d'emails via Gmail
"""
import os
import sys
from pathlib import Path

import django
from django.core.mail import get_connection, send_mail

# Ajouter le répertoire du projet au chemin
PROJECT_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(PROJECT_DIR))

# Configuration Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'reservations.settings')
django.setup()


def configure_gmail():
    """Configure les paramètres Gmail"""
    print("\n" + "="*60)
    print("🔧 CONFIGURATEUR GMAIL POUR DJANGO")
    print("="*60)

    print("\n📋 ÉTAPE 1: Générer le mot de passe application Google")
    print("-" * 60)
    print("1. Allez sur: https://myaccount.google.com/apppasswords")
    print("2. Assurez-vous que 2FA est ACTIVÉ")
    print("3. Sélectionnez 'Mail' et 'Windows Computer'")
    print("4. Google génère un mot de passe de 16 caractères")
    print("5. Copiez ce mot de passe ci-dessous (SANS espaces)")

    email = input("\n📧 Entrez votre adresse Email Gmail: ").strip()
    password = input("🔑 Entrez le mot de passe application (16 caractères): ").strip()

    # Validation
    if not email or '@gmail.com' not in email.lower():
        print("❌ Email invalide!")
        return False

    if len(password.replace(' ', '')) != 16:
        print(
            '❌ Mot de passe invalide! '
            f"(doit faire 16 caractères, vous en avez {len(password.replace(' ', ''))})"
        )
        return False

    # Nettoyer le mot de passe (enlever espaces)
    password = password.replace(' ', '')

    # Mettre à jour .env
    env_path = PROJECT_DIR / '.env'

    with open(env_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remplacer la configuration
    new_content = content.replace(
        "# Mode CONSOLE (développement): Les emails s'affichent dans la console\n"
        "EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend\n"
        "DEFAULT_FROM_EMAIL=noreply@pidbooking.com\n"
        "\n"
        "# Mode GMAIL (production): Dé-commentez et remplissez les valeurs réelles\n"
        "# EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend\n"
        "# EMAIL_HOST=smtp.gmail.com\n"
        "# EMAIL_PORT=587\n"
        "# EMAIL_USE_TLS=True\n"
        "# EMAIL_HOST_USER=votre-email-reel@gmail.com\n"
        "# EMAIL_HOST_PASSWORD=votre-mot-passe-application-16-caracteres\n"
        "# DEFAULT_FROM_EMAIL=votre-email-reel@gmail.com",

        "# Mode GMAIL (production)\n"
        "EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend\n"
        "EMAIL_HOST=smtp.gmail.com\n"
        "EMAIL_PORT=587\n"
        "EMAIL_USE_TLS=True\n"
        "EMAIL_HOST_USER=" + email + "\n"
        "EMAIL_HOST_PASSWORD=" + password + "\n"
        "DEFAULT_FROM_EMAIL=" + email
    )

    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(new_content)

    print("\n✅ Configuration mise à jour dans .env")

    # Test de connexion
    print("\n📧 Test de connexion SMTP...")

    try:
        connection = get_connection()
        connection.open()
        connection.close()
        print("✓ Connexion réussie!")
    except Exception as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        print("\n⚠️  Causes possibles:")
        print("   - Email ou mot de passe incorrect")
        print("   - 2FA non activé sur votre compte Google")
        print("   - Pare-feu bloquant SMTP (port 587)")
        return False

    # Test d'envoi
    print("\n📨 Envoi d'un email de test...")

    try:
        send_mail(
            subject='Test Gmail Configuration',
            message="Cet email confirme que votre configuration Gmail fonctionne!",
            from_email=email,
            recipient_list=[email],
            fail_silently=False,
        )
        print(f"✓ Email de test envoyé à {email}!")
    except Exception as e:
        print(f"❌ Erreur lors de l'envoi: {str(e)}")
        return False

    print("\n" + "="*60)
    print("✅ CONFIGURATION GMAIL COMPLÉTÉE!")
    print("="*60)
    print("\n⚠️  IMPORTANT: Redémarrez le serveur Django!")
    print("   Arrêtez le serveur (Ctrl+C) et relancez:")
    print("   python manage.py runserver")
    print()

    return True


if __name__ == '__main__':
    try:
        success = configure_gmail()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Configuration annulée.")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erreur: {str(e)}")
        sys.exit(1)
