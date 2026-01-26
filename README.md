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