# Configuration Gmail pour l'envoi d'emails

## Étapes pour configurer Gmail

### 1. Créer ou utiliser une adresse Gmail
- Utilisez une adresse Gmail existante ou créez-en une sur [mail.google.com](https://mail.google.com)

### 2. Activer l'authentification à deux facteurs (2FA)
⚠️ **IMPORTANT** : La 2FA est obligatoire pour générer des mots de passe d'application

1. Allez sur [myaccount.google.com](https://myaccount.google.com)
2. Cliquez sur **Sécurité** (onglet de gauche)
3. Activez la **Vérification en deux étapes** si pas déjà fait

### 3. Générer un mot de passe d'application
1. Allez sur [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Sélectionnez **Mail** et **Windows Computer** (ou votre OS)
3. Google génère un mot de passe unique de 16 caractères
4. **Copiez ce mot de passe** - c'est celui à utiliser dans `.env`, PAS votre mot de passe Gmail

### 4. Mettre à jour le fichier `.env`
```env
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre.email@gmail.com
EMAIL_HOST_PASSWORD=votre-mot-passe-application-16-caracteres
DEFAULT_FROM_EMAIL=votre.email@gmail.com
```

### 5. Tester l'envoi d'emails
Ouvrez une console Python Django et testez :
```bash
python manage.py shell
```

Puis dans la console :
```python
from django.core.mail import send_mail

send_mail(
    'Sujet du test',
    'Ceci est un email de test',
    'votre.email@gmail.com',
    ['destinataire@example.com'],
    fail_silently=False,
)
```

Ou utilisez le script de test fourni :
```bash
python manage.py send_test_email votre.email@gmail.com
```

## Options de configuration

### En développement (Console)
Si vous ne souhaitez pas envoyer d'emails réels en développement, le fichier `.env.example` montre comment basculer en mode console :
```env
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

Les emails s'afficheront simplement dans la console.

## Dépannage

### Erreur : "Application-specific password required"
- Assurez-vous d'avoir activé la 2FA sur votre compte Google
- Assurez-vous d'utiliser le mot de passe d'application, pas le mot de passe Gmail

### Erreur : "Username and Password not accepted"
- Vérifiez que `EMAIL_HOST_USER` correspond à votre adresse Gmail complète
- Vérifiez que le mot de passe d'application est correct (16 caractères sans espaces)

### Erreur : "Connection refused"
- Vérifiez les paramètres `EMAIL_HOST` et `EMAIL_PORT`
- Gmail SMTP : `smtp.gmail.com:587` avec TLS

## Sécurité

⚠️ **IMPORTANT** :
- Ne commencez JAMAIS le fichier `.env` à Git
- Le fichier `.gitignore` doit contenir `.env`
- En production, utilisez des variables d'environnement du serveur, pas un fichier local

## Ressources utiles
- [Gmail App Passwords Setup](https://support.google.com/accounts/answer/185833)
- [Django Email Documentation](https://docs.djangoproject.com/en/5.0/topics/email/)
