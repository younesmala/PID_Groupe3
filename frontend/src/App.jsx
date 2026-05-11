import { useEffect, useState } from "react"
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom"

import ArtistsList from "./pages/ArtistsList"
import ArtistDetail from "./pages/ArtistDetail"
import ArtistEdit from "./pages/ArtistEdit"
import Home from "./pages/Home"
import ShowsList from "./pages/ShowsList"
import ShowDetail from "./pages/ShowDetail"
import Cart from "./pages/Cart"
import Checkout from "./pages/Checkout"
import Search from "./pages/Search"
import Reviews from "./pages/Reviews"
import Signup from "./pages/Signup"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/ResetPassword"
import Profile from "./pages/Profile"
import Confirmation from "./pages/Confirmation"
import MyTickets from "./pages/MyTickets"

import Navbar from "./components/Navbar"
import Footer from "./components/Footer"
import CookieBanner from "./components/CookieBanner"

import ProducerDashboard from "./pages/ProducerDashboard"
import ProducerShows from "./pages/ProducerShows"
import ProducerSessions from "./pages/ProducerSessions"
import ProducerAllSessions from "./pages/ProducerAllSessions"
import ProducerStats from "./pages/ProducerStats"
import ProducerShowForm from "./pages/ProducerShowForm"
import AdminDashboard from "./pages/AdminDashboard"

import {
  getStoredUser,
  storeUser,
  logout,
  fetchCurrentUser,
} from "./services/authService"

import { getCart } from "./services/cartService"
import i18n from "./i18n"

const SUPPORTED_LANGUAGES = ["fr", "nl", "en"]

function getPreferredLanguage() {
  const storedLanguage = localStorage.getItem("language")
  const normalizedStoredLanguage = (storedLanguage || "").toLowerCase()

  if (SUPPORTED_LANGUAGES.includes(normalizedStoredLanguage)) {
    return normalizedStoredLanguage
  }

  const i18nLanguage = (i18n.language || "fr").slice(0, 2).toLowerCase()

  if (SUPPORTED_LANGUAGES.includes(i18nLanguage)) {
    return i18nLanguage
  }

  return "fr"
}

function buildLocalizedPath(pathname, language) {
  if (pathname === "/") {
    return `/${language}`
  }

  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`
  return `/${language}${normalizedPath}`
}

function LanguageUrlManager() {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const segments = location.pathname.split("/").filter(Boolean)
    const firstSegment = (segments[0] || "").toLowerCase()
    const hasSupportedLanguagePrefix = SUPPORTED_LANGUAGES.includes(firstSegment)

    if (hasSupportedLanguagePrefix) {
      const storageLanguage = firstSegment.toUpperCase()

      if (localStorage.getItem("language") !== storageLanguage) {
        localStorage.setItem("language", storageLanguage)
      }

      if (i18n.language !== firstSegment) {
        i18n.changeLanguage(firstSegment)
      }

      return
    }

    let rawPathWithoutLanguage = location.pathname
    const firstLooksLikeLanguage = /^[a-z]{2}$/i.test(firstSegment)

    if (firstLooksLikeLanguage) {
      rawPathWithoutLanguage = `/${segments.slice(1).join("/")}`

      if (rawPathWithoutLanguage === "/") {
        rawPathWithoutLanguage = "/"
      }
    }

    const preferredLanguage = getPreferredLanguage()
    const localizedPath = buildLocalizedPath(rawPathWithoutLanguage, preferredLanguage)

    navigate(`${localizedPath}${location.search}${location.hash}`, {
      replace: true,
    })
  }, [location.hash, location.pathname, location.search, navigate])

  return null
}

function ProtectedRoute({ user, children }) {
  if (!user?.username) {
    return <Navigate to="/" replace />
  }

  return children
}

function AdminProtectedRoute({ user, children }) {
  if (!user?.username) {
    return <Navigate to="/" replace />
  }

  const normalizedRole = String(user?.role || "").toUpperCase()
  const isAdmin = !!user?.is_staff || normalizedRole === "ADMIN"

  if (!isAdmin) {
    return <Navigate to="/" replace />
  }

  return children
}

function LocalizedNotFoundRedirect() {
  const { lang } = useParams()
  const normalizedLanguage = (lang || "").toLowerCase()
  const fallbackLanguage = SUPPORTED_LANGUAGES.includes(normalizedLanguage)
    ? normalizedLanguage
    : getPreferredLanguage()

  return <Navigate to={`/${fallbackLanguage}`} replace />
}

function AppContent() {
  const navigate = useNavigate()
  const [user, setUser] = useState(getStoredUser)
  const [cartCount, setCartCount] = useState(0)

  const username = user?.username || null
  const isLoggedIn = !!username

  async function handleLogin(loginData) {
    if (typeof loginData === "string") {
      setUser((prev) => ({
        ...prev,
        username: loginData,
      }))

      return
    }

    storeUser(loginData)

    try {
      const profile = await fetchCurrentUser()

      storeUser(profile)

      const newUser = {
        username: profile.username || loginData.username,
        role: profile.role || loginData.role || null,
        is_staff: !!profile.is_staff || !!loginData.is_staff,
        email: profile.email || loginData.email || null,
      }

      setUser(newUser)

      // Redirection intelligente selon le rôle
      const language = getPreferredLanguage()
      const normalizedRole = String(newUser.role || '').toUpperCase()
      const isAdmin = !!newUser.is_staff || normalizedRole === 'ADMIN'
      if (isAdmin) {
        navigate(`/${language}/admin/dashboard`)
      } else if (normalizedRole === 'PRODUCER' || normalizedRole === 'PRODUCTEUR') {
        navigate(`/${language}/producer/dashboard`)
      }
    } catch {
      const newUser = {
        username: loginData.username || null,
        role: loginData.role || null,
        is_staff: !!loginData.is_staff,
        email: loginData.email || null,
      }

      setUser(newUser)

      // Redirection même si le fetch du profil échoue
      const language = getPreferredLanguage()
      const normalizedRole = String(newUser.role || '').toUpperCase()
      const isAdmin = !!newUser.is_staff || normalizedRole === 'ADMIN'
      if (isAdmin) {
        navigate(`/${language}/admin/dashboard`)
      } else if (normalizedRole === 'PRODUCER' || normalizedRole === 'PRODUCTEUR') {
        navigate(`/${language}/producer/dashboard`)
      }
    }
  }

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // Keep logout resilient if the backend session already expired.
    }

    setUser(null)
    setCartCount(0)
  }

  useEffect(() => {
    let active = true

    function handleCartUpdated(event) {
      if (!active) return

      const nextCount = event.detail?.cartCount

      if (typeof nextCount === "number") {
        setCartCount(nextCount)
      }
    }

    async function loadCartCount() {
      try {
        const cart = await getCart()

        if (active) {
          setCartCount(cart.count ?? 0)
        }
      } catch {
        if (active) {
          setCartCount(0)
        }
      }
    }

    loadCartCount()

    window.addEventListener("cart-updated", handleCartUpdated)

    return () => {
      active = false
      window.removeEventListener("cart-updated", handleCartUpdated)
    }
  }, [username])

  return (
    <>
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        cartCount={cartCount}
      />

      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Home />} />
        <Route path="/:lang" element={<Home />} />
        <Route path="/artist/:id" element={<ArtistDetail />} />
        <Route path="/:lang/artist/:id" element={<ArtistDetail />} />
        <Route path="/artist/:id/edit" element={<ArtistEdit />} />
        <Route path="/:lang/artist/:id/edit" element={<ArtistEdit />} />
        <Route path="/artists" element={<ArtistsList />} />
        <Route path="/:lang/artists" element={<ArtistsList />} />
        <Route path="/shows" element={<ShowsList />} />
        <Route path="/:lang/shows" element={<ShowsList />} />
        <Route path="/show/:id" element={<ShowDetail />} />
        <Route path="/:lang/show/:id" element={<ShowDetail />} />
        <Route path="/shows/:slug" element={<ShowDetail />} />
        <Route path="/:lang/shows/:slug" element={<ShowDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/:lang/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/:lang/checkout" element={<Checkout />} />
        <Route
          path="/confirmation/:reservationId"
          element={<Confirmation />}
        />
        <Route
          path="/:lang/confirmation/:reservationId"
          element={<Confirmation />}
        />
        <Route path="/signup" element={<Signup />} />
        <Route path="/:lang/signup" element={<Signup />} />
        <Route path="/login" element={<Home />} />
        <Route path="/:lang/login" element={<Home />} />
        <Route
          path="/profile"
          element={
            <Profile
              isLoggedIn={isLoggedIn}
              username={username}
            />
          }
        />
        <Route
          path="/:lang/profile"
          element={
            <Profile
              isLoggedIn={isLoggedIn}
              username={username}
            />
          }
        />
        <Route path="/search" element={<Search />} />
        {/* Redirection si l'utilisateur tente d'aller sur /login manuellement */}
        <Route 
          path="/login" 
          element={
            <Navigate to="/" replace onRender={() => {
              window.dispatchEvent(new Event("open-login-modal"));
            }} />
          } 
        />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/:lang/reviews" element={<Reviews />} />
        <Route
          path="/tickets"
          element={<MyTickets isLoggedIn={isLoggedIn} />}
        />
        <Route
          path="/:lang/tickets"
          element={<MyTickets isLoggedIn={isLoggedIn} />}
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/:lang/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/:lang/reset-password" element={<ResetPassword />} />

        {/* ── Espace Producteur ── */}
        <Route
          path="/producer/dashboard"
          element={
            <ProtectedRoute user={user}>
              <ProducerDashboard user={user} />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:lang/producer/dashboard"
          element={
            <ProtectedRoute user={user}>
              <ProducerDashboard user={user} />
            </ProtectedRoute>
          }
        />

        <Route
          path="/producer/shows"
          element={
            <ProtectedRoute user={user}>
              <ProducerShows />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:lang/producer/shows"
          element={
            <ProtectedRoute user={user}>
              <ProducerShows />
            </ProtectedRoute>
          }
        />

        <Route
          path="/producer/shows/new"
          element={
            <ProtectedRoute user={user}>
              <ProducerShowForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:lang/producer/shows/new"
          element={
            <ProtectedRoute user={user}>
              <ProducerShowForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/producer/shows/:slug/edit"
          element={
            <ProtectedRoute user={user}>
              <ProducerShowForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:lang/producer/shows/:slug/edit"
          element={
            <ProtectedRoute user={user}>
              <ProducerShowForm />
            </ProtectedRoute>
          }
        />

        <Route
          path="/producer/shows/:slug/sessions"
          element={
            <ProtectedRoute user={user}>
              <ProducerSessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:lang/producer/shows/:slug/sessions"
          element={
            <ProtectedRoute user={user}>
              <ProducerSessions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/producer/sessions"
          element={
            <ProtectedRoute user={user}>
              <ProducerAllSessions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:lang/producer/sessions"
          element={
            <ProtectedRoute user={user}>
              <ProducerAllSessions />
            </ProtectedRoute>
          }
        />

        <Route
          path="/producer/stats"
          element={
            <ProtectedRoute user={user}>
              <ProducerStats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/:lang/producer/stats"
          element={
            <ProtectedRoute user={user}>
              <ProducerStats />
            </ProtectedRoute>
          }
        />

        {/* ── Administration ── */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminProtectedRoute user={user}>
              <AdminDashboard user={user} />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/:lang/admin/dashboard"
          element={
            <AdminProtectedRoute user={user}>
              <AdminDashboard user={user} />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion utilisateurs" />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/:lang/admin/users"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion utilisateurs" />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/reservations"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion réservations" />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/:lang/admin/reservations"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion réservations" />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/locations"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Nos lieux" />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/:lang/admin/locations"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Nos lieux" />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/producers"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion des producteurs" />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/:lang/admin/producers"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion des producteurs" />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/shows"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion des spectacles" />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/:lang/admin/shows"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion des spectacles" />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/reviews"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion des avis" />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/:lang/admin/reviews"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion des avis" />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/artists"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion des artistes" />
            </AdminProtectedRoute>
          }
        />
        <Route
          path="/:lang/admin/artists"
          element={
            <AdminProtectedRoute user={user}>
              <PlaceholderPage title="Gestion des artistes" />
            </AdminProtectedRoute>
          }
        />

        <Route path="/:lang/*" element={<LocalizedNotFoundRedirect />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Footer />
      <CookieBanner />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <LanguageUrlManager />
      <AppContent />
    </BrowserRouter>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div
      style={{
        padding: "60px 40px",
        color: "#e0e0e0",
      }}
    >
      <h1
        style={{
          fontSize: "1.6rem",
          marginBottom: "8px",
        }}
      >
        {title}
      </h1>

      <p style={{ color: "#888" }}>
        Page en cours de développement.
      </p>
    </div>
  )
}

export default App