# 📱 Brussels Show - Navbar Refactorisée

## 📋 Vue d'ensemble

La navbar a été complètement refactorisée pour offrir une expérience moderne, responsive et modulaire, en utilisant **Tailwind CSS** et **lucide-react**.

## 🎯 Objectifs réalisés

✅ Navbar moderne et dark  
✅ Design responsive (mobile & desktop)  
✅ Menu hamburger mobile  
✅ Sélecteur de langue multilingue (FR/NL/EN)  
✅ Boutons authentification cohérents  
✅ Icônes lucide-react  
✅ Structure modulaire et maintenable  
✅ Système d'import/export centralisé  
✅ Préparation pour futurs rôles (producteur, admin)  

---

## 📂 Structure des composants

### Arborescence

```
src/components/
├── Navbar.jsx                          # Wrapper principal (dispatch guest/auth)
├── navbar/                             # Dossier des composants modulaires
│   ├── index.js                        # Exports centralisés
│   ├── GuestNavbar.jsx                 # Navbar pour visiteurs (non connectés)
│   ├── AuthenticatedNavbar.jsx         # Navbar pour utilisateurs loggés
│   ├── NavbarGuestLogo.jsx             # Composant: Logo Brussels Show
│   ├── NavbarLanguageSelector.jsx      # Composant: Sélecteur de langue
│   ├── NavbarAuthButtons.jsx           # Composant: Boutons Connexion/Inscription
│   └── NavbarMobileMenu.jsx            # Composant: Menu hamburger mobile
├── LoginModal.jsx                      # Modal de connexion existante
└── Navbar.css                          # Styles legacy (optionnel)
```

---

## 🎨 Composants

### 1. **GuestNavbar** (Visiteurs non connectés)

#### Fichier: `src/components/navbar/GuestNavbar.jsx`

**Responsabilités:**
- Affichage pour utilisateurs non authentifiés
- Gestion du sélecteur de langue
- Dispatch du modal de connexion
- Support multilingue (/fr, /nl, /en)

**Structure visuelle desktop:**
```
[Logo Brussels Show]          [Langue] [Connexion] [Inscription]
```

**Structure visuelle mobile:**
```
[Logo]  [≡ Menu]
```

**Props:**
- `onLogin` (function): Callback au succès de connexion

---

### 2. **AuthenticatedNavbar** (Utilisateurs connectés)

#### Fichier: `src/components/navbar/AuthenticatedNavbar.jsx`

**Responsabilités:**
- Affichage pour utilisateurs authentifiés
- Indicateur de rôle (Admin/Producteur/Client)
- Dropdowns producteur et admin
- Panier avec badge
- Bouton profil et déconnexion

**Features:**
- Role-based dropdowns
- Language selector
- Shopping cart with count
- User profile quick access
- Clean logout button

---

### 3. **NavbarGuestLogo** (Logo)

#### Fichier: `src/components/navbar/NavbarGuestLogo.jsx`

**Affiche:**
- "Brussels" en blanc
- "Show" en orange (#FF4500)

**Tailwind classes:**
- Hover opacity fade
- Smooth transitions

---

### 4. **NavbarLanguageSelector** (Sélecteur langue)

#### Fichier: `src/components/navbar/NavbarLanguageSelector.jsx`

**Features:**
- Dropdown avec 3 langues (FR, NL, EN)
- Indicateurs visuels (flags emoji)
- Sélection persiste en localStorage
- Click-outside handler
- Smooth chevron rotation

**Langues supportées:**
```javascript
const LANGUAGES = [
  { code: 'FR', label: 'Français', flag: '🇫🇷' },
  { code: 'NL', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
]
```

---

### 5. **NavbarAuthButtons** (Boutons Auth)

#### Fichier: `src/components/navbar/NavbarAuthButtons.jsx`

**Boutons:**
1. **Connexion** (outline)
   - Icône: LogIn (lucide-react)
   - Hover scale effect
   
2. **Inscription** (filled orange)
   - Icône: UserPlus (lucide-react)
   - Active scale effect
   - Shadow effect

---

### 6. **NavbarMobileMenu** (Menu mobile)

#### Fichier: `src/components/navbar/NavbarMobileMenu.jsx`

**Features:**
- Hamburger menu icon (lucide-react)
- Responsive: Hidden on `md` breakpoint
- Dropdown menu avec:
  - Sélecteur de langue
  - Boutons d'authentification
- Click-outside handler
- Smooth animations

---

## 🎨 Design System

### Couleurs

```javascript
// Primary Colors
primary-500: #FF4500 (Orange)
primary-600: #ff4500

// Dark Theme
slate-900: #0f172a (Background)
slate-800: #1f2937 (Dropdown bg)
white/10: rgba(255,255,255,0.1)
white/30: rgba(255,255,255,0.3)
white/50: rgba(255,255,255,0.5)
white/70: rgba(255,255,255,0.7)

// Accents
orange-500: #FF4500
orange-600: #ff4500
yellow-400: #ffd84d (Role tab)
```

### Spacing

```
- Navbar height: 64px (16 * 4)
- Gap between items: 4 (16px) - 8 (32px)
- Padding: 3-4 (12-16px)
- Border radius: 6-8px (rounded-lg)
```

### Typography

```
- Logo: font-bold, text-xl
- Buttons: font-medium, text-sm
- Labels: font-semibold, text-xs
- Letter-spacing: tracking-tight
```

---

## 🔄 Flow d'authentification

```
1. Visiteur non connecté
   ↓
   GuestNavbar s'affiche
   ↓
   Clique sur "Connexion"
   ↓
   LoginModal apparaît
   ↓
   Succès de connexion
   ↓
2. Navbar remonte l'événement
   ↓
   Component parent (Navbar wrapper) gère l'auth
   ↓
   Rérender avec user data
   ↓
3. AuthenticatedNavbar s'affiche automatiquement
```

---

## 🌍 Support multilingue

La navbar utilise le système i18n existant:

```javascript
// Clés i18n utilisées
i18n.changeLanguage('fr' | 'nl' | 'en')

// Application gère les chemins
/fr/*, /nl/*, /en/*
```

**localStorage:**
```javascript
localStorage.setItem('language', 'FR') // Persiste la sélection
```

---

## 📱 Responsive Design

### Breakpoints

```css
/* Mobile-first approach */
- xs: 0px (default)
- sm: 640px
- md: 768px   ← Hidden/shown Navbar elements
- lg: 1024px
- xl: 1280px
```

### Adaptation

```
Mobile (xs):
- Hamburger menu visible
- Language selector full width
- Button text hidden (icons only)

Desktop (md+):
- Hamburger hidden
- Full horizontal layout
- Full button labels
- Dropdowns visible
```

---

## 🔌 Intégration avec App.jsx

```jsx
<Navbar
  user={user}              // null pendant visiteur
  onLogin={handleLogin}    // Callback succès auth
  onLogout={handleLogout}  // Callback déconnexion
  cartCount={cartCount}    // 0 pour visiteurs
/>
```

### Logique dispatch

```javascript
// Dans Navbar.jsx wrapper
if (!isLoggedIn) {
  return <GuestNavbar onLogin={handleLoginSuccess} />
}

return (
  <AuthenticatedNavbar {...props} />
)
```

---

## 🚀 Améliorations apportées

### Avant (Navbar.css)
```css
/* Variables CSS basiques */
/* Layouts flexbox simples */
/* Pas de framework CSS */
```

### Après (Tailwind)
```jsx
/* Utility-first approach */
/* Responsive classes (hidden, md:flex, etc) */
/* Dark theme intégré */
/* Hover/active states */
/* Transitions smooth */
```

### Composants modulaires

| Avant | Après |
|-------|-------|
| 1 gros Navbar.jsx | 6 composants spécialisés |
| CSS file | Tailwind utilities |
| Logique mixte | Separation of concerns |
| Difficile à tester | Easierunit testing |
| Hard to extend | Extensible par composition |

---

## 🎯 Préparation pour futurs rôles

### Architecture prête pour:

1. **Dashboard Producteur**
   ```jsx
   {isProducer && (
     <NavDropdown label="Producteur" links={producerLinks} />
   )}
   ```

2. **Panel Admin**
   ```jsx
   {isAdmin && (
     <NavDropdown label="Admin" links={adminLinks} />
   )}
   ```

3. **Panier & Checkout**
   ```jsx
   <Link to="/cart">
     <ShoppingCart />
     <span className="badge">{cartCount}</span>
   </Link>
   ```

4. **Profile utilisateur**
   ```jsx
   <Link to="/profile">{user.username}</Link>
   ```

---

## 🔧 Configuration Tailwind

### tailwind.config.js
```javascript
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: { ... }, // Orange #FF4500
        dark: { ... },    // Slate theme
      },
    },
  },
}
```

### postcss.config.js
```javascript
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

## 📦 Dépendances ajoutées

```json
{
  "devDependencies": {
    "tailwindcss": "^4.0.0",
    "postcss": "^8.0.0",
    "autoprefixer": "^10.0.0",
    "@tailwindcss/postcss": "^4.0.0"
  },
  "dependencies": {
    "lucide-react": "^latest"
  }
}
```

---

## 🎓 Guide d'utilisation pour les développeurs

### Importer la Navbar

```jsx
import Navbar from './components/Navbar'

// Dans App.jsx
<Navbar
  user={user}
  onLogin={handleLogin}
  onLogout={handleLogout}
  cartCount={cartCount}
/>
```

### Importer les composants individuels

```jsx
// Option 1: Via index.js
import { GuestNavbar, NavbarLanguageSelector } from './components/navbar'

// Option 2: Direct
import GuestNavbar from './components/navbar/GuestNavbar'
```

### Customiser les couleurs

```jsx
// Dans tailwind.config.js
theme: {
  extend: {
    colors: {
      primary: {
        // Ajouter des teintes custom
      }
    }
  }
}
```

### Ajouter des icônes supplémentaires

```jsx
// lucide-react demo
import { Menu, X, LogIn, LogOut, Settings } from 'lucide-react'

<Menu size={24} className="..." />
```

---

## ✅ Checklist de validation

- [x] Navbar responsive
- [x] Menu hamburger mobile
- [x] Sélecteur langue
- [x] Boutons auth cohérents
- [x] Dark theme moderne
- [x] Hover/active effects
- [x] Lucide-react icons
- [x] Structure modulaire
- [x] Multilingue supporté
- [x] Tailwind CSS configuré
- [x] PostCSS configuré
- [x] Prêt pour futurs rôles

---

## 📚 Ressources

- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [lucide-react Icons](https://lucide.dev)
- [React Router](https://reactrouter.com)
- [i18next](https://www.i18next.com/)

---

## 🚧 Prochaines étapes optionnelles

1. **Animations avancées:** Ajouter Framer Motion
2. **Accessibilité:** ARIA labels détaillés
3. **Tests:** Jest + React Testing Library
4. **States:** Skeleton loaders pendant chargement
5. **Notifications:** Toast messages pour actions

---

Créé: Mai 2026  
Dernière mise à jour: Mai 2026  
Statut: ✅ Production Ready
