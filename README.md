# 🎭 Projet Réservations – PID_Groupe3

[![CI/CD](https://github.com/younesmala/PID_Groupe3/actions/workflows/main.yml/badge.svg)](https://github.com/younesmala/PID_Groupe3/actions/workflows/main.yml)

Application web de gestion et de réservation de spectacles, développée avec **Django** (backend) et **React** (frontend).

---

## 🎓 Contexte académique
- **École** : Institut des Carrières Commerciales (ICC) – Bruxelles
- **Cursus** : Bachelier en Informatique – orientation Développement d'Applications
- **Cours** : Projet d'Intégration Développement (PID)
- **Enseignant** : Cédric Ruth

---

## 👥 Équipe & Répartition des tâches

### 🟢 Randy
**Rôle : API REST + i18n Frontend**

✅ Réalisé :
- Navbar React dark (PIDBooking) avec logo orange
- Login/Logout fonctionnel (anna/anna123)
- i18n FR/NL/EN sur toute la navbar
- Sélecteur de langue avec drapeaux 🇫🇷🇳🇱🇬🇧
- Fix 404 sur /api/ → API Root endpoint
- GET/PUT /api/profile/ — profil utilisateur
- Validation complète à l'inscription
- GET /api/auth/check-username/ et check-email/
- Email de confirmation à l'inscription
- GET /api/rss/ — flux RSS représentations
- GET /api/export/shows/ — export CSV
- POST /api/import/shows/ — import CSV
- Système affiliés Free/Starter/Premium
- GET /api/stats/shows/ — statistiques producteur
- i18n HeroSection FR/NL/EN
- i18n ShowDetail et Cart FR/NL/EN
- Traductions DB (description_nl, description_en)

🔜 À faire :
- Page d'inscription React connectée à l'API
- Page profil utilisateur React
- Intégrer les stats dans un dashboard React

---

### 🟢 Younes
**Rôle : Page d'accueil + Catalogue**

✅ Réalisé :
- Page d'accueil React (BrusselsShow)
- Hero Section avec animation
- Cartes de spectacles (ShowCards)
- Page détail spectacle (ShowDetail)
- Endpoint /api/public/shows/
- Données spectacles dans la DB (6 spectacles)
- Publication status APPROVED

🔜 À faire :
- Upload images des spectacles
- Nouveau dump SQL complet avec tous les spectacles
- Remplir title_nl, title_en dans la DB
- Page de recherche / filtres spectacles

---

### 🟢 Vianney
**Rôle : Panier React**

✅ Réalisé :
- Page panier React (Cart.jsx)
- Connexion à /api/cart/

🔜 À faire :
- Page de paiement React
- Confirmation de commande
- Historique des réservations

---

### 🟡 Morad
**Rôle : Page liste des spectacles**

✅ Réalisé :
- Page liste des spectacles React avec cards (rating, lieu, date, affiches)
- Filtres Tous / Aujourd'hui / Prochainement
- Dropdown lieu et sélecteur date
- Connexion à /api/public/shows/ avec paramètres de filtrage
- API publique enrichie (rating, next_schedule, next_location_name)

🔜 À faire :
- Page d'inscription React connectée à /api/auth/register/
- Validation asynchrone (check-username, check-email)
- Page profil utilisateur React connectée à /api/profile/
- Formulaire de modification du profil

---

### 🟡 Soufiane
**Rôle : Reviews / Avis**

🔜 À faire :
- Page avis spectacles React
- Connecter à GET/POST /api/reviews/
- Système de notation (étoiles)
- Modération des avis (admin)

---

### 🟡 Oumar
**Rôle : Dashboard Admin**

🔜 À faire :
- Dashboard admin React
- Connecter à /api/stats/shows/
- Gestion des spectacles (CRUD)
- Gestion des utilisateurs

---

### 🟡 Nicolas
**Rôle : CI/CD + Tests**

✅ Réalisé :
- GitHub Actions (3 jobs parallèles)
- Lint Python (flake8)
- Tests Django
- Build React

🔜 À faire :
- Augmenter la couverture des tests
- Tests d'intégration API
- Tests frontend (Jest/Vitest)

---

## ✅ État des fonctionnalités

| Fonctionnalité | État | Responsable |
|---|---|---|
| Navbar React i18n | ✅ Terminé | Randy |
| Login/Logout | ✅ Terminé | Randy |
| API Root | ✅ Terminé | Randy |
| Profil utilisateur API | ✅ Terminé | Randy |
| Inscription complète | ✅ Terminé | Randy |
| Flux RSS | ✅ Terminé | Randy |
| Export/Import CSV | ✅ Terminé | Randy |
| API Affiliés | ✅ Terminé | Randy |
| Statistiques producteur | ✅ Terminé | Randy |
| i18n Frontend complet | ✅ Terminé | Randy |
| Page d'accueil React | ✅ Terminé | Younes |
| Cartes spectacles | ✅ Terminé | Younes |
| Page détail spectacle | ✅ Terminé | Younes |
| Page liste spectacles (filtres + cards) | ✅ Terminé | Morad |
| API publique enrichie | ✅ Terminé | Morad |
| Panier React | 🟡 En cours | Vianney |
| Page inscription React | 🔴 À faire | Morad |
| Page profil React | 🔴 À faire | Morad |
| Avis/Reviews React | 🔴 À faire | Soufiane |
| Dashboard admin React | 🔴 À faire | Oumar |
| Tests complets | 🔴 À faire | Nicolas |
| Images spectacles | 🔴 À faire | Younes |
| Page paiement React | 🔴 À faire | Vianney |

---

## 🛠️ Stack technique

### Backend
- Python 3.12
- Django 5.0.14
- Django REST Framework 3.15.2
- django-modeltranslation 0.18.11
- python-dotenv 1.1.1
- mysqlclient 2.2.7

### Frontend
- React 19.2.4
- Vite 8.0.1
- React Router DOM 7.13.2
- react-i18next (FR/NL/EN)

### Base de données
- MySQL 8.0 (via MAMP)

### CI/CD
- GitHub Actions (3 jobs parallèles)

---

## 📡 API Endpoints complets

### Auth
- POST /api/auth/login/
- POST /api/auth/logout/
- POST /api/auth/register/
- GET /api/auth/check-username/
- GET /api/auth/check-email/

### Profil
- GET /api/profile/
- PUT /api/profile/update/

### Spectacles
- GET /api/ — API Root
- GET /api/public/shows/
- GET /api/shows/
- GET /api/shows/{id}/
- GET /api/representations/
- GET /api/rss/

### Artistes
- GET /api/artists/
- GET /api/artists/{id}/
- GET /api/types/

### Lieux
- GET /api/locations/
- GET /api/localities/

### Panier & Réservations
- GET /api/cart/
- POST /api/cart/add/
- POST /api/checkout/
- GET /api/reservations/
- GET /api/tickets/

### Avis
- GET /api/reviews/
- POST /api/reviews/

### CSV
- GET /api/export/shows/
- POST /api/import/shows/

### Affiliés
- POST /api/affiliate/register/
- GET /api/affiliate/catalog/
- PUT /api/affiliate/upgrade/{id}/

### Statistiques
- GET /api/stats/shows/
- GET /api/stats/shows/{id}/

### Admin
- GET /api/users/
- GET /api/admin/

---

## 🚀 Lancer le projet

**Terminal 1 — Django :**
```bash
python manage.py runserver
```

**Terminal 2 — React :**
```bash
cd frontend
npm run dev
```

**URLs :**
- React → http://localhost:5173/
- Django → http://localhost:8000/en/
- Admin → http://localhost:8000/admin/
- API → http://localhost:8000/api/

---

## 🔑 Compte de test
- **Username** : anna / **Password** : anna123 — Rôle : ADMIN

---

## 📁 Structure du projet

```
PID_Groupe3/
├── .github/workflows/    # Configuration CI/CD GitHub Actions
├── accounts/             # Gestion des comptes utilisateurs
├── api/                  # API REST (Django REST Framework)
│   ├── serializers/
│   └── views/
├── cart/                 # Gestion du panier
├── catalogue/            # Modèles et vues du catalogue
│   ├── models/
│   ├── forms/
│   └── views/
├── frontend/             # Application React + Vite
│   ├── src/
│   └── public/
├── locale/               # Fichiers de traduction (i18n)
├── reservations/         # Configuration Django principale
├── Templates/            # Templates Django
├── manage.py
├── requirements.txt
└── README.md
```

---

Développé par le Groupe 3 – ICC Bruxelles – 2025-2026
