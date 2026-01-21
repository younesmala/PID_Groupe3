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


Une fois le travail terminé ou une étape importante atteinte :
