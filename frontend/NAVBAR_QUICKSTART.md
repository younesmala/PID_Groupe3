# Navbar Refactor - Guide de démarrage rapide

## 🎯 Résumé en 30 secondes

La navbar Brussels Show a été refactorisée avec:
- ✅ **6 composants modulaires** (vs 1 monolithique avant)
- ✅ **Tailwind CSS** pour le styling (responsive first)
- ✅ **lucide-react** pour les icônes
- ✅ **Deux états:** Visiteur (GuestNavbar) + Connecté (AuthenticatedNavbar)
- ✅ **Menu hamburger mobile** avec animations
- ✅ **Sélecteur langue** (FR/NL/EN) avec persistence

---

## 🚀 Démarrer rapidement

### 1. Voir la navbar en action

```bash
cd frontend
npm run dev
# Ouvre http://localhost:5175/fr
```

### 2. Structure des fichiers

```
components/
├── Navbar.jsx                  ← Entrypoint (wrapper)
└── navbar/
    ├── index.js               ← Réexports
    ├── GuestNavbar.jsx        ← State: Non connecté
    ├── AuthenticatedNavbar.jsx ← State: Connecté
    ├── NavbarGuestLogo.jsx
    ├── NavbarLanguageSelector.jsx
    ├── NavbarAuthButtons.jsx
    └── NavbarMobileMenu.jsx
```

---

## 🎨 Design visuel

### Structure desktop
```
┌─────────────────────────────────────────────────────────┐
│                                                           │
│ [Logo]              [Langue ▼] [Connexion] [Inscription] │
│                                                           │
└─────────────────────────────────────────────────────────┘
Background: #0f172a (slate-900)
```

### Structure mobile
```
┌────────────────────────────────┐
│ [Logo]                    [≡]  │
├────────────────────────────────┤
│ Langue        [FR ▼]           │
│ Connexion   [Bouton]           │
│ Inscription [Bouton]           │
└────────────────────────────────┘
```

---

## 📝 Code examples

### Utiliser la navbar dans App.jsx

```jsx
import Navbar from './components/Navbar'

function App() {
  const [user, setUser] = useState(null)
  const [cartCount, setCartCount] = useState(0)

  return (
    <>
      <Navbar
        user={user}              // null = visiteur
        onLogin={handleLogin}
        onLogout={handleLogout}
        cartCount={cartCount}
      />
      {/* Reste de l'app */}
    </>
  )
}
```

### Importer les composants individuels

```jsx
// Option 1: Via barrel export
import { GuestNavbar, NavbarLanguageSelector } from './components/navbar'

// Option 2: Direct import
import GuestNavbar from './components/navbar/GuestNavbar'
import { ChevronDown, Menu } from 'lucide-react'
```

### Customiser avec Tailwind

```jsx
// Dans GuestNavbar.jsx
<nav className="sticky top-0 z-50 bg-slate-900 border-b border-white/10">
  {/* Classes Tailwind composables */}
  <div className="hidden md:flex gap-4 items-center">
    {/* Desktop layout */}
  </div>
  <div className="md:hidden">
    {/* Mobile layout */}
  </div>
</nav>
```

---

## 🔄 Flow d'authentification

```
┌─────────────────┐
│  App Component  │
└────────┬────────┘
         │ user: null
         ▼
    ┌─────────────┐
    │ Navbar.jsx  │ (wrapper)
    └─────┬───────┘
          │ if (!user) →
          │
          ▼
   ┌──────────────────┐
   │  GuestNavbar     │ ← Affichage visiteur
   │ - Logo           │
   │ - Language       │
   │ - Login/Signup   │
   └────────┬─────────┘
            │ Click Connexion
            │
            ▼
      ┌────────────────┐
      │ LoginModal     │
      └────────┬───────┘
               │ Success
               │
               ▼
        ┌─────────────┐
        │ onLogin()   │
        └──────┬──────┘
               │ user: {username, role, ...}
               │
               ▼
        ┌──────────────────┐
        │ AuthenticatedNav │ ← Affichage connecté
        │ - Role indicator │
        │ - Producer space │
        │ - Admin panel    │
        │ - Cart           │
        │ - Profile        │
        └──────────────────┘
```

---

## 🎨 Palette de couleurs

```
Primaire (Actions):
  #FF4500 ← Orange principal

Dark Theme (Background):
  #0f172a ← slate-900
  #1f2937 ← slate-800

Text:
  #ffffff ← Blanc pur
  rgba(255,255,255,0.7) ← white/70
  rgba(255,255,255,0.5) ← white/50

Borders:
  rgba(255,255,255,0.1) ← white/10
  rgba(255,255,255,0.3) ← white/30

Highlights:
  #ffd84d ← yellow-400 (role badge)
```

---

## 📱 Responsive behavior

| Type | xs-sm | md | lg-xl |
|------|-------|----|----|
| Logo | Visible | Visible | Visible |
| Hamburger | ✅ Visible | ✅ Hidden | ✅ Hidden |
| Desktop menu | ❌ Hidden | ✅ Visible | ✅ Visible |
| Language (dropdown) | Full width | Compact | Compact |
| Button labels | Hidden* | Visible | Visible |

*Icons only on mobile

---

## 🔧 Commandes útiles

```bash
# Développement
npm run dev          # Démarrer Vite sur port 5175

# Build
npm run build        # Production build

# Linting
npm lint             # Vérifier ESLint

# Install deps
npm install          # Installer dépendances
npm install lucide-react  # Ajouter une icône lib
```

---

## 📚 Dépendances clé

```json
{
  "react": "^19.2.4",
  "react-router-dom": "^7.13.2",
  "react-i18next": "^17.0.4",
  "lucide-react": "^latest",
  
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0"
  }
}
```

---

## 🎯 Cas d'usage courants

### Ajouter un nouveau bouton
```jsx
// Dans NavbarAuthButtons.jsx
<button className="px-4 py-2 text-sm font-medium text-white hover:bg-white/10 rounded-lg transition-colors">
  Mon Bouton
</button>
```

### Changer la couleur primaire
```js
// tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        500: '#FF4500', // Changer ici
      }
    }
  }
}
```

### Ajouter une langue
```jsx
// Dans NavbarLanguageSelector.jsx
const LANGUAGES = [
  { code: 'DE', label: 'Deutsch', flag: '🇩🇪' },
  // ... rest
]
```

### Afficher un menu selon rôle
```jsx
// Dans AuthenticatedNavbar.jsx
{isProducer && (
  <NavDropdown label="Mon espace" links={producerLinks} />
)}
```

---

## ⚠️ Common mistakes

❌ Oublier `.sticky` et `z-50` pour la navbar
```jsx
// ❌ Mauvais
<nav className="bg-slate-900">

// ✅ Bon
<nav className="sticky top-0 z-50 bg-slate-900">
```

❌ Utiliser des classes CSS arbitraires
```jsx
// ❌ Mauvais (pas généré par Tailwind)
<div className="margin-left: 12px">

// ✅ Bon
<div className="ml-3">
```

❌ Oublier les breakpoints pour mobile
```jsx
// ❌ Mauvais (toujours visible)
<div className="flex gap-4">

// ✅ Bon (responsive)
<div className="hidden md:flex gap-4">
```

---

## 🧪 Testing checklist

```
Visiteur (non connecté):
☐ Navbar affiche: Logo, Langue, Connexion, Inscription
☐ Language selector fonctionne (/fr → /en)
☐ Localisation persiste (refresh)
☐ Menu hamburger responsive
☐ Modal connexion apparaît

Utilisateur connecté:
☐ AuthenticatedNavbar remplace GuestNavbar
☐ Role indicator affiche le rôle
☐ Producteur voit "Espace Producteur"
☐ Admin voit "Administration"
☐ Panier affiche count
☐ Profil link fonctionne
☐ Logout fonctionne
```

---

## 📖 Documentation complète

Voir `NAVBAR_REFACTOR.md` pour:
- Architecture détaillée
- Tous les components expliqués
- Design system complet
- Intégration i18n
- Préparation futurs rôles

---

## 🆘 Besoin d'aide?

**Fichiers clé:**
- `frontend/NAVBAR_REFACTOR.md` - Documentation complète
- `src/components/Navbar.jsx` - Wrapper principal
- `src/components/navbar/GuestNavbar.jsx` - État visiteur
- `tailwind.config.js` - Configuration Tailwind

**Ressources:**
- [Tailwind CSS](https://tailwindcss.com)
- [lucide-react](https://lucide.dev)
- [React Router](https://reactrouter.com)
- [i18next](https://www.i18next.com/)

---

✅ Status: Production Ready  
📅 Dernière mise à jour: Mai 2026
