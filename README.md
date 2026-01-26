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

