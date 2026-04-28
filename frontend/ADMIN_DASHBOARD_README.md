# Dashboard Admin React - Guide d'utilisation

## 📊 Vue d'ensemble

Le dashboard admin affiche les statistiques des spectacles et représentations connecté à l'API `/api/stats/shows/`.

## 🎯 Fonctionnalités

### 1. **Statistiques globales**
   - Total des spectacles en base de données
   - Affichage en carte colorée en haut du dashboard

### 2. **Liste des spectacles**
   - Grid de spectacles avec filtrage visuel
   - Affiche pour chaque spectacle :
     - Titre
     - Statut réservable (✓/✗)
     - Nombre de représentations
     - Places disponibles totales
   - Clic sur une carte pour voir les détails

### 3. **Détails du spectacle**
   - Affiche le spectacle sélectionné en grand
   - Informations générales (total représentations, statut)
   - **Tableau des représentations** avec :
     - Date/Heure
     - Lieu
     - Places disponibles (rouge si 0)

## 🛠️ Architecture

### Fichiers créés :
- `frontend/src/pages/AdminDashboard.jsx` - Composant principal
- `frontend/src/pages/AdminDashboard.css` - Styling
- `App.jsx` - Route `/admin/dashboard` ajoutée

### API utilisée :
```
GET /api/stats/shows/
- Retourne : total_shows, array de shows avec stats

GET /api/stats/shows/<id>/
- Retourne : détails du spectacle avec représentations
```

## 🔐 Authentification

Le dashboard utilise le token Bearer stocké dans `localStorage.access_token`.

**À adapter** : Remplace `localStorage.getItem('access_token')` par ta méthode d'authentification.

## 🎨 Design

- **Layout responsif** : 2 colonnes sur desktop, 1 sur mobile
- **Scrollbar personnalisée** : Bleu #007bff
- **Cartes interactives** : Hover effects et animations
- **Statut visuel** : Places = 0 en rouge

## 🚀 Accès

```
URL : http://localhost:5173/admin/dashboard
```

Tu peux ajouter un lien dans la Navbar :
```jsx
{isLoggedIn && <Link to="/admin/dashboard">Tableau de bord</Link>}
```

## 💡 Améliorations possibles

- [ ] Filtre par type de spectacle
- [ ] Tri par colonnes (date, places)
- [ ] Export CSV des statistiques
- [ ] Graphiques de tendances
- [ ] Recherche rapide par titre
- [ ] Pagination pour beaucoup de spectacles
