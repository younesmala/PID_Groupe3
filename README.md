# 🎭 Projet Réservations – PID_Groupe3

[![CI/CD](https://github.com/younesmala/PID_Groupe3/actions/workflows/main.yml/badge.svg)](https://github.com/younesmala/PID_Groupe3/actions/workflows/main.yml)

Application web de gestion et de réservation de spectacles, développée avec **Django** (backend) et **React** (frontend).

---

## 📖 Description du projet

**Projet Réservations** est une application web permettant de gérer un catalogue complet de spectacles, artistes, représentations et réservations associées.

Le projet comprend actuellement :

- un **catalogue d'artistes** (CRUD complet)
- un **catalogue de spectacles** avec représentations et lieux
- un système de **panier et réservation** pour les utilisateurs
- un **back-office administrateur** (Django Admin)
- une **API REST** (Django REST Framework) pour les interactions frontend
- une **interface React** moderne avec Vite
- le support du **multilingue** (i18n) via django-modeltranslation

---

## 🎓 Contexte académique

- **École** : Institut des Carrières Commerciales (ICC) – Ville de Bruxelles
- **Cursus** : Bachelier en Informatique – orientation Développement d'Applications
- **Cours** : Projet d'Intégration Développement (PID)
- **Enseignant** : Cédric Ruth

---

## 👥 Équipe de développement

- Younes
- Morad
- Randy
- Vianney
- Soufiane
- Oumar
- Nicolas

---

## 🛠️ Stack technique

### Backend
- Python 3.12
- Django 5.0.14
- Django REST Framework 3.15.2
- django-modeltranslation 0.18.11 (i18n)
- python-dotenv 1.1.1 (variables d'environnement)
- mysqlclient 2.2.7 (connecteur MySQL)

### Frontend
- React 19.2.4
- Vite 8.0.1
- React Router DOM 7.13.2
- ESLint 9.39.4

### Base de données
- MySQL 8.0 (via MAMP sur macOS ou installation directe sur Windows)

### CI/CD
- GitHub Actions (3 jobs parallèles : lint Python, tests Django, build React)

---

## 📋 Prérequis

Avant de commencer, assurez-vous d'avoir installé :

- Python 3.12 (https://www.python.org/downloads/)
- Node.js 20+ et npm (https://nodejs.org/)
- MySQL 8.0 (via MAMP sur macOS, ou MySQL Installer sur Windows)
- Git (https://git-scm.com/)

---

## 🚀 Installation

### 1. Cloner le dépôt

    git clone https://github.com/younesmala/PID_Groupe3.git
    cd PID_Groupe3

### 2. Configuration du backend Django

**Sur macOS / Linux :**

    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt

**Sur Windows :**

    python -m venv venv
    venv\Scripts\activate
    pip install -r requirements.txt

Note Windows : si mysqlclient pose problème à l'installation, pymysql est utilisé automatiquement en fallback.

### 3. Configuration de la base de données

1. Démarrer MySQL (via MAMP sur macOS, ou le service MySQL sur Windows)

2. Créer la base de données :

    CREATE DATABASE reservation CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

3. Créer le fichier .env à la racine :

    cp .env.example .env      # macOS / Linux
    copy .env.example .env    # Windows

4. Éditer .env avec vos credentials MySQL locaux.

### 4. Appliquer les migrations

    python manage.py migrate

### 5. Créer un super-utilisateur (optionnel)

    python manage.py createsuperuser

### 6. Configuration du frontend React

    cd frontend
    npm install
    cd ..

---

## Mise a jour avant de commencer

Avant de demarrer une nouvelle tache, pensez a mettre votre branche locale a jour avec `main`. Cela permet de recuperer les derniers correctifs, les migrations, les changements frontend et les donnees attendues par le projet.

### 1. Mettre sa branche a jour

Depuis la racine du projet :

    git pull origin main

Si le projet a recu de nouvelles dependances ou migrations :

    pip install -r requirements.txt
    python manage.py migrate

### 2. Mettre a jour la base locale

Une partie importante de l'affichage frontend depend aussi des donnees locales en base. Cela concerne notamment :

- les descriptions des spectacles
- les images des spectacles (`poster_url`)
- les representations et autres donnees associees

Si votre base locale n'est pas a jour, le site peut afficher des spectacles incomplets, des images manquantes ou des pages detail incorrectes.

Selon ce qui est partage par l'equipe, il faut donc :

- soit importer le dernier dump SQL
- soit recharger les fixtures mises a jour

Exemple pour recharger les spectacles :

    python manage.py loaddata catalogue/fixtures/shows.json

En resume : avant de coder, mettez a jour votre branche et votre base locale pour eviter des bugs qui ne viennent pas du code mais de donnees obsoletes.

---

## ▶️ Lancement du projet

### Backend Django (port 8000)

    source venv/bin/activate    # macOS/Linux
    venv\Scripts\activate       # Windows
    python manage.py runserver

### Frontend React (port 5173)

Dans un second terminal :

    cd frontend
    npm run dev

---

## 🌐 Accès à l'application

- http://127.0.0.1:8000/ — Page d'accueil Django
- http://127.0.0.1:8000/catalogue/artist/ — Catalogue des artistes
- http://127.0.0.1:8000/admin/ — Interface d'administration
- http://127.0.0.1:8000/api/ — API REST (DRF Browsable API)
- http://localhost:5173/ — Application React (frontend)

---

## 📡 Documentation API

### Authentification
- POST /api/auth/login/ — Connexion
- POST /api/auth/register/ — Inscription
- POST /api/auth/logout/ — Déconnexion

### Spectacles & Représentations
- GET /api/shows/ — Liste des spectacles
- GET /api/shows/<id>/ — Détail d'un spectacle
- GET /api/representations/ — Liste des représentations

### Artistes
- GET /api/artists/ — Liste des artistes
- GET /api/artists/<id>/ — Détail d'un artiste
- GET /api/types/ — Types d'artistes

### Lieux
- GET /api/locations/ — Liste des salles
- GET /api/localities/ — Liste des localités

### Panier & Réservation
- GET /api/cart/ — Contenu du panier
- POST /api/cart/add/ — Ajouter au panier
- POST /api/checkout/ — Finaliser la commande
- GET /api/reservations/ — Liste des réservations
- GET /api/tickets/ — Liste des tickets

### Avis
- GET /api/reviews/ — Liste des avis
- POST /api/reviews/ — Créer un avis

### Utilisateurs & Admin
- GET /api/users/ — Liste des utilisateurs (admin)
- GET /api/admin/ — Endpoints administrateur

Astuce : explorez l'API interactivement via http://127.0.0.1:8000/api/

---

## 🧪 Tests

### Tests Django

    python manage.py test

### Linting Python (flake8)

    pip install flake8
    flake8 .

### Linting JavaScript (ESLint)

    cd frontend
    npm run lint

---

## 📁 Structure du projet

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
    ├── member/               # Gestion des membres
    ├── reservations/         # Configuration Django principale
    │   ├── settings.py
    │   └── urls.py
    ├── Templates/            # Templates Django
    ├── .env.example          # Modèle de configuration
    ├── .flake8               # Configuration du linter Python
    ├── .gitignore
    ├── manage.py             # Point d'entrée Django
    ├── requirements.txt      # Dépendances Python
    └── README.md

---

## 🔄 CI/CD

Le projet utilise GitHub Actions pour automatiser les vérifications à chaque push et pull request. Le workflow exécute 3 jobs en parallèle :

1. Python Lint (flake8) — Vérification du style de code Python
2. Django Tests (MySQL 8.0) — Tests unitaires Django avec base MySQL
3. Frontend React (npm install + build) — Build du frontend React

Le workflow est défini dans .github/workflows/main.yml.

---

## 🤝 Contribution

Le projet suit un workflow Git basé sur les pull requests :

1. Créer une branche depuis main : git checkout -b feature/ma-fonctionnalite
2. Committer ses changements : git commit -m "feat: description"
3. Pousser sur le dépôt : git push origin feature/ma-fonctionnalite
4. Ouvrir une Pull Request sur GitHub
5. Attendre la validation de la CI/CD et la revue de code
6. Merger après approbation

### Convention de nommage des branches

- feature/* — Nouvelles fonctionnalités
- fix/* — Corrections de bugs
- chore/* — Tâches de maintenance (refacto, config)
- dev_* — Branches de développement d'étapes

---

## 📝 Licence

Projet académique réalisé dans le cadre du Bachelier en Informatique de l'ICC Bruxelles.

---

Développé par le Groupe 3 – ICC Bruxelles – 2025-2026
