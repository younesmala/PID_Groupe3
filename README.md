

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


## Fonctionnalités implémentées

### 1. Authentification (Login / Logout)
- Intégration du système d’authentification natif de Django
- Utilisation des vues d’authentification (`LoginView`, `LogoutView`)
- Mise en place d’une page de connexion personnalisée (`login.html`)
- Champs :
  - Username
  - Password
- Bouton de connexion
- Lien « Mot de passe oublié »

---

### 2. Organisation propre des templates
- Mise en place d’un layout principal (`base.html`)
- Centralisation du HTML commun :
  - Navbar
  - Container principal
- Utilisation des blocs Django :
  - `{% block title %}`
  - `{% block content %}`
- Héritage des pages via :
  ```django
  {% extends "layouts/base.html" %}

  ---

## 3. Gestion de la navigation selon l’état de connexion

Ajout d’une **navbar dynamique** qui s’adapte automatiquement à l’état de connexion de l’utilisateur.

- Si l’utilisateur est connecté :
  - Affichage du **nom d’utilisateur**
  - Bouton **Déconnexion**
- Si l’utilisateur est déconnecté :
  - Bouton **Connexion**

Ce comportement est géré via les templates Django grâce à la condition :

```django
{% if user.is_authenticated %}
---

## 4. Amélioration de l’interface avec Bootstrap

Intégration de **Bootstrap 5 via CDN** afin d’améliorer l’interface utilisateur.

- Mise en page moderne et responsive
- Utilisation des classes Bootstrap (`container`, `row`, `col`, `card`, `btn`)
- Navbar stylée et cohérente sur toutes les pages
- Interface adaptée aux différentes tailles d’écran

Bootstrap permet d’obtenir une interface propre et professionnelle sans CSS personnalisé complexe.

---

## 5. Amélioration de la page d’accueil

Refonte de la page d’accueil pour améliorer la lisibilité et l’expérience utilisateur :

- Contenu centré dans une **carte Bootstrap**
- Titre principal clair
- Texte de bienvenue lisible
- Interface épurée et cohérente avec le reste du site

La page d’accueil sert désormais de point d’entrée clair pour l’utilisateur.

---

## 6. Fonctionnement global validé

Le fonctionnement général de l’application a été validé :

- Connexion utilisateur fonctionnelle
- Redirection correcte après connexion
- Déconnexion fonctionnelle
- Retour à l’état invité après déconnexion
- Navbar mise à jour automatiquement selon l’état de connexion
- Aucun conflit entre les templates

L’authentification et la navigation sont stables et fiables.

---

## 7. Bonnes pratiques respectées

- Séparation claire des responsabilités :
  - Layout global (`base.html`)
  - Pages spécifiques par fonctionnalité
- Organisation propre des templates
- Code lisible et structuré
- Utilisation correcte des templates Django (`extends`, `block`)
- Commits clairs et descriptifs en français
- Interface utilisateur cohérente et moderne
Mise a jours de taches 1avril 2026

Nicolas
 Mission Frontend — Liste + Navigation  Objectif : créer la base du frontend artistes. À faire : 1. Créer la page liste des artistes - afficher une liste (mock data) - bouton : voir / modifier / supprimer 2. Mettre en place la navigation - liste → détail - liste → modifier   Important : - utiliser des données fake - structure propre (composants, fichiers) - préparer les appels API (sans forcément les connecter)   Résultat attendu : - page liste fonctionnelle - navigation opérationnelle - base frontend prête

Vianey 
Mission Frontend — Détail + Formulaire Objectif : compléter l’interface artistes.  👉 À faire : 1. Page détail artiste - afficher les infos (mock data) 2. Formulaire artiste - ajout - modification - validation simple  👉 Résultat attendu : - page détail fonctionnelle - formulaire prêt - intégration facile avec API

Soufiane
Mission Frontend — Composants réutilisables Objectif : créer une base de composants pour tout le projet.  👉 À faire : 1. Créer des composants : - bouton (primary, danger, etc.) - input (formulaire) - card (pour afficher un artiste) 2. Structurer proprement : - dossier components - composants réutilisables - code propre et lisible  👉 Important : - composants génériques (réutilisables partout) - props bien définies - style cohérent  👉 Résultat attendu : - composants prêts à être utilisés dans toutes les pages - base frontend solide

Randy Masamba 
Mission Frontend — UI / UX + Composants Objectif : améliorer l’interface et préparer des composants réutilisables. 👉 À faire : 1. Créer des composants réutilisables : - bouton (primary, danger, etc.) - input (formulaire) - card (pour afficher un artiste) 2. Améliorer le design : - alignement des éléments - espacement (margin / padding) - structure propre (header, contenu, etc.) e

Younes 
Frontend — UI / UX
Mission Frontend — UI / UX
améliorer design (spacing, layout)
messages (succès, erreur)
états (loading, empty)
 Résultat :
interface propre et professionnelle

Morad
Mission Frontend — Composants
 À faire :
bouton (primary, danger)
input
card artiste
 Résultat :
base composants réutilisables
Oumar
3. Ajouter des messages utilisateur : - message succès (ex: "Artiste ajouté") - message erreur - message liste vide 4. Ajouter états visuels : - loading (chargement) - empty state (aucun artiste) - erreur API (préparé même si API pas encore prête)

⁩

## 📜 Licence

Projet académique – **Bachelier en Informatique de Gestion (PID)**  
© 2025 – Usage pédagogique uniquement
