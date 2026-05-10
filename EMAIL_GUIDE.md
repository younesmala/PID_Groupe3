# 📧 Configuration Emails - Guide Complet

## 🎯 État Actuel

- ✅ **Système d'emails configuré et fonctionnel**
- ✅ **Mode CONSOLE actif** (parfait pour le développement)
- ✅ **Prêt pour Gmail** quand tu auras tes identifiants

---

## 📋 Mode Console (Développement) - ACTIF ACTUELLEMENT

### Comment ça marche ?
Les emails **ne sont pas envoyés réellement**. Ils s'affichent simplement dans la console Django.

**Avantages:**
- ✓ Pas besoin de compte Gmail
- ✓ Parfait pour tester le système localement
- ✓ Voir le contenu complet de l'email en développement

**Exemple:**
```
Sending test email to user@example.com...
Content-Type: text/plain; charset="utf-8"
From: noreply@pidbooking.com
To: user@example.com
Subject: Bienvenue sur PID Booking
...
```

### Tester
```bash
python manage.py send_test_email your-email@example.com
```

---

## 📧 Mode Gmail (Production/Réel)

### Quand utiliser ce mode ?
Quand tu veux envoyer de **vrais emails** aux utilisateurs.

### Configuration (4 étapes)

#### 1️⃣ Activer 2FA sur Google
```
1. Allez sur: https://myaccount.google.com/security
2. Activez "Vérification en deux étapes"
```

#### 2️⃣ Générer le mot de passe application
```
1. Allez sur: https://myaccount.google.com/apppasswords
2. Sélectionnez:
   - Type d'application: Mail
   - Appareil: Windows Computer
3. Google génère 16 caractères
4. Copiez le mot de passe
```

#### 3️⃣ Configurer automatiquement
```bash
python setup_gmail.py
```
Le script va:
- ✓ Vous demander votre email Gmail
- ✓ Vous demander le mot de passe application
- ✓ Mettre à jour le fichier `.env` automatiquement
- ✓ Tester la connexion

#### 4️⃣ Redémarrer Django
```bash
# Arrêtez le serveur (Ctrl+C) puis:
python manage.py runserver
```

---

## 🔧 Configuration Manuelle (Si tu préfères)

Si tu veux configurer Gmail manuellement, édite le fichier `.env`:

```env
# Mettez en commentaire le mode CONSOLE:
# EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend

# Dé-commentez le mode GMAIL et remplissez vos identifiants:
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=votre-email@gmail.com
EMAIL_HOST_PASSWORD=votre-mot-passe-application-16-caracteres
DEFAULT_FROM_EMAIL=votre-email@gmail.com
```

---

## 🧪 Tester la Configuration

### Test simple
```bash
python manage.py send_test_email utilisateur@example.com
```

### Test avec diagnostic complet
```bash
python manage.py diagnose_gmail
```

### Test dans la console Django
```bash
python manage.py shell
```

Puis:
```python
from django.core.mail import send_mail

send_mail(
    'Sujet du test',
    'Contenu du test',
    'from@example.com',
    ['to@example.com'],
    fail_silently=False,
)
```

---

## ⚠️ Dépannage

### Le script `setup_gmail.py` ne fonctionne pas ?

**Erreur: "Module not found"**
```bash
# Assurez-vous d'être dans le bon répertoire:
cd c:\Users\liern\OneDrive\Bureau\PID_Groupe3-main\ (5)\PID_Groupe3-main
python setup_gmail.py
```

**Erreur: "Username and Password not accepted"**
- ❌ Avez-vous utilisé votre mot de passe Gmail normal ? (c'est mauvais)
- ✓ Utilisez le mot de passe application généré par Google (16 caractères)
- ❌ Avez-vous activé 2FA ? (c'est obligatoire)

**Erreur: "Connection refused"**
- Vérifiez que vous n'êtes pas derrière un pare-feu bloquant SMTP
- Essayez le port 465 avec SSL au lieu de 587 avec TLS

---

## 🔒 Sécurité

⚠️ **IMPORTANT:**

1. **Ne commitez JAMAIS le `.env` à Git**
   ```bash
   # Vérifiez que .gitignore contient:
   .env
   .env.local
   ```

2. **Ne partagez PAS votre mot de passe application**
   - Il est unique et lié à votre compte Google
   - Régénérez-le si vous le soupçonnez compromis

3. **En production:**
   - Utilisez les variables d'environnement du serveur (Heroku, etc)
   - Pas de fichier `.env` sur le serveur

---

## 📞 Ressources

- [Google App Passwords Setup](https://support.google.com/accounts/answer/185833)
- [Django Email Documentation](https://docs.djangoproject.com/en/5.0/topics/email/)
- [SMTP Gmail Settings](https://support.google.com/mail/answer/7126229)

---

## 📊 Quick Reference

| Mode | Backend | Emails | Quand l'utiliser |
|------|---------|--------|------------------|
| **Console** | `console.EmailBackend` | S'affichent en console | Développement local |
| **Gmail** | `smtp.EmailBackend` | Envoyés réellement | Production/Test réel |

---

**Configuration actuelle:** Mode Console ✅  
**Pour passer à Gmail:** `python setup_gmail.py`
