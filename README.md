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
