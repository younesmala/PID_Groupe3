
# Projet Réservations – Django (PID)


## 👥 Équipe de développement

- Younes 
- Morad
- Randy
- Vianney
- Soufiane
- Oumar

---

## 📖 Description du projet

L’application **Projet Réservations** est une application web développée avec **Django** permettant de gérer un catalogue de spectacles et, à terme, les réservations associées.

Le projet comprend actuellement :
- un **catalogue d’artistes** (CRUD complet),
- une **page d’accueil**,
- un **back-office administrateur** (Django Admin),
- une **architecture prête** pour l’authentification, les spectacles et les réservations.

Ce projet est réalisé dans le cadre du **PID (Projet d’Intégration et de Développement)** du **Bachelier en Informatique de Gestion**.

Le développement est réalisé de manière **progressive**, par itérations, conformément aux consignes du PID.

---

## 🎯 Objectifs pédagogiques

- Comprendre la structure d’un projet Django professionnel.
- Mettre en place un CRUD fonctionnel avec l’ORM Django.
- Travailler en **équipe** avec GitHub (Issues, branches, Pull Requests).
- Appliquer les bonnes pratiques de développement et de documentation.

---

## 🗂️ Structure du projet

PID_Groupe3/
│
├── reservations/ # Projet principal Django (settings, urls, wsgi)
├── catalogue/ # Application catalogue (artistes, templates, vues)
├── requirements.txt # Dépendances Python
├── manage.py # Commandes Django
├── README.md # Documentation du projet
├── LOGBOOK_GROUPE.md # Journal de bord du groupe


---

## ⚙️ Installation et lancement du projet

### 🔹 Prérequis

- Python **3.12**
- Git
- Environnement virtuel (venv)

---

### 🔹 Installation depuis zéro (Windows)

git clone https://github.com/younesmala/PID_Groupe3.git

cd PID_Groupe3
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver


---

### 🔹 Accès à l’application

- Accueil : http://127.0.0.1:8000/
- Catalogue artistes : http://127.0.0.1:8000/catalogue/artist/
- Administration : http://127.0.0.1:8000/admin/

---

## 🧪 Versions utilisées (IMPORTANT)

- Python **3.12**
- Django **5.0.14**

Tous les membres du groupe doivent utiliser **les mêmes versions** afin d’éviter les conflits.

---

## 🧠 Gestion du projet

### 🔹 GitHub Issues

Toutes les tâches de développement sont gérées via **GitHub Issues**.  
Chaque Issue contient :
- une description claire,
- une checklist des étapes à réaliser,
- une *Definition of Done (DoD)*,
- un responsable (assignee).

---

### 🔹 Workflow Git

- La branche `main` est protégée.
- Chaque membre travaille sur une branche personnelle : `dev_prenom`.
- Toute modification passe par une **Pull Request**.
- Une Pull Request correspond à **une Issue**.

---

### 🔹 GitHub Projects

Un tableau **GitHub Projects (Kanban)** est utilisé comme gestionnaire de projet avec les colonnes :
- Backlog
- To Do
- In Progress
- Review
- Done

---

## 🔄 Itérations du projet

| Itération | Intitulé                              | État |
|----------|---------------------------------------|------|
| 1 | Setup & organisation | 🟡 en cours |
| 2 | CRUD Artistes + navigation | ✅ terminé |
| 3 | Relations simples (Type, Locality, Price) | 🔜 à venir |
| 4 | Authentification | 🔜 à venir |
| 5 | Shows & Réservations (version minimale) | 🔜 à venir |

---

## ✅ Travail déjà réalisé

- Projet Django fonctionnel
- Environnement configuré
- CRUD Artistes complet
- Page d’accueil
- Routing propre
- Django Admin opérationnel
- Gestion Git (branches, remotes)

---

## 🔜 Travail à venir

- Modèles relationnels (Type, Locality, Price)
- Authentification (login / signup)
- Shows et représentations
- Réservations (version simple)
- Améliorations UX (messages, navigation)
- Finalisation du LOGBOOK de groupe

---

## 📜 Licence

Projet académique – **Bachelier en Informatique de Gestion (PID)**  
© 2025 – Usage pédagogique uniquement



1. Mise en place de l’authentification (login / logout)
Intégration du système d’authentification de Django
Utilisation des vues d’authentification natives (LoginView, LogoutView)
Mise en place de la page de connexion personnalisée :
Template login.html
Champs username et password
Bouton de connexion
Lien « Mot de passe oublié »
2. Organisation propre des templates
Mise en place d’un layout principal (base.html)
Centralisation du HTML commun :
<head>
Navbar
Container principal
Utilisation des blocs Django :
{% block title %}
{% block content %}
Les pages héritent désormais du layout avec {% extends "layouts/base.html" %}
3. Gestion de la navigation selon l’état de connexion
Ajout d’une navbar dynamique :
Si l’utilisateur est connecté :
Affichage du nom d’utilisateur
Bouton Déconnexion
Si l’utilisateur est déconnecté :
Bouton Connexion
Comportement conditionnel basé sur :
{% if user.is_authenticated %}
4. Amélioration de l’interface avec Bootstrap
Intégration de Bootstrap 5 via CDN
Mise en page moderne et responsive :
Navbar stylée
Pages centrées
Cartes (card) pour l’accueil et le login
Amélioration visuelle de la page de connexion :
Carte centrée
Champs larges et lisibles
Bouton principal bien visible
5. Page d’accueil améliorée
Page d’accueil épurée et lisible
Contenu affiché dans une carte Bootstrap
Texte de bienvenue clair
Interface cohérente avec le reste du site
6. Fonctionnement global validé
Connexion → redirection correcte
Déconnexion → retour à l’état invité
Navbar mise à jour automatiquement
Aucun conflit entre les templates
Structure propre et maintenable
7. Bonnes pratiques respectées
Séparation claire des responsabilités :
Layout global
Pages spécifiques
Code lisible et structuré
Commits clairs et descriptifs en français
Interface utilisateur cohérente et moderne
Conclusion
Le projet dispose maintenant :
D’un système d’authentification fonctionnel
D’une interface moderne grâce à Bootstrap
D’une structure de templates propre et professionnelle
D’une navigation intuitive selon l’état de connexion de l’utilisateur

