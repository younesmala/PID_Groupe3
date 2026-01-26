# Logbook de groupe – Projet PID Réservations

## Objectif du document

Ce logbook de groupe a pour objectif de **tracer l’avancement du projet** et de
**documenter le travail réalisé par chaque membre de l’équipe** dans le cadre
du Projet d’Intégration et de Développement (PID).

veuillez svp, à des fins de partages avec les autres membres du groupe, y inclure les problèmes rencontrés + solutions.

---

## Organisation du travail en équipe (Git & Branches)

### Principe général

Pour travailler efficacement en équipe et éviter les conflits, le projet utilise
une **organisation par branches Git**.

- La branche **`main`** contient uniquement du code **stable et validé**
- Chaque membre du groupe travaille sur **sa propre branche**
  (exemple : `dev_younes`, `dev_morad`, `dev_soufiane`, etc.)
- Le travail individuel **ne se fait jamais directement sur `main`**

Cette méthode permet :
- de travailler en parallèle sans se gêner,
- de tester et relire le code avant intégration,
- de garder un historique propre du projet.

---

### Règles à respecter

- ❌ Ne jamais coder directement sur la branche `main`
- ✅ Toujours travailler sur sa branche personnelle (`dev_prenom`)
- ✅ Faire des commits réguliers avec des messages clairs
- ✅ L’intégration vers `main` se fait uniquement après validation du groupe

---

### Workflow standard (pas à pas)

#### 1️⃣ Se placer sur sa branche personnelle
Avant de commencer à coder, chaque membre doit vérifier sa branche active :

```bash
1. git branch
2. git checkout dev_prenom (exemple: git checkout dev_younes)

#### 2️⃣ Travailler normalement

coder la fonctionnalité demandée

tester l’application en local

vérifier que tout fonctionne

#### 3️⃣ Enregistrer son travail (commit)

git status
git add .
git commit -m "description claire de la fonctionnalité réalisée"

#### 4️⃣ Envoyer son travail sur GitHub (push)

Le push se fait uniquement sur la branche personnelle :
git push origin dev_prenom (exemple: git push origin dev_younes)

#### Intégration dans la branche main

L’intégration du travail vers main se fait via :

une Pull Request (PR) sur GitHub,

une validation par le groupe (relecture, tests),

puis une fusion (merge) vers main.

----------------------------------------------------------------------------------------------------

Mise en place de la Home & navigation – Workflow Git (MVP Alpha)

=> Objectif: 

Mettre en place une page d’accueil fonctionnelle et une navigation principale claire, tout en respectant un workflow Git collaboratif (branches + PR).

✅ Travail réalisé (branche dev_younes)
1. Fonctionnel (Application)

Création d’une page d’accueil Catalogue accessible via :

http://127.0.0.1:8000/catalogue/

Mise en place d’une navigation principale :

Lien vers la liste des artistes

Lien vers l’admin Django

Centralisation du layout via :

catalogue/templates/lyouts/base.html


Utilisation correcte des blocs Django ({% block content %})

2. Routing (URLs)

Le projet redirige correctement :

/catalogue/ → page d’accueil Catalogue
/catalogue/artist/ → liste des artistes
/admin/ → admin Django


Le routing est réparti correctement entre :

reservations/urls.py (projet)

catalogue/urls.py (application)

=> Nettoyage du dépôt (problème résolu)
Problème identifié

Des fichiers non versionnables étaient présents dans le dépôt :

venv/

__pycache__/

fichiers .pyc

fichiers générés par Django et Python

Cela provoquait :

des conflits Git massifs

des PR impossibles à merger proprement

Solution appliquée: 

Suppression de ces fichiers du suivi Git

Mise à jour de .gitignore pour empêcher leur retour

Rebase propre de la branche dev_younes sur main

Résolution manuelle des conflits

Push sécurisé avec :

git push --force-with-lease


==> Le dépôt est désormais propre, stable et collaboratif <==

État actuel du projet (22/01/2026): 

✔️ MVP Alpha fonctionnel

✔️ Navigation claire

✔️ Base solide pour développement parallèle

✔️ Conforme aux consignes de versioning (Release Alpha)

--------------------------------------------------------------------------------------------------------------------------------------------
