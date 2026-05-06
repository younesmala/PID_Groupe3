import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ArtistsList from './pages/ArtistsList'
import ArtistDetail from './pages/ArtistDetail'
import ArtistEdit from './pages/ArtistEdit'
import Home from './pages/Home'
import ShowsList from './pages/ShowsList'
import ShowDetail from './pages/ShowDetail'
import Cart from './pages/Cart'
import AdminDashboard from './pages/AdminDashboard'
import AdminUsers from './pages/AdminUsers'
import AdminReservations from './pages/AdminReservations'
import Locations from './pages/Locations'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import CookieBanner from './components/CookieBanner'
import { getStoredUser, storeUser, logout, fetchCurrentUser } from './services/authService'
import Checkout from './pages/Checkout'
import Search from './pages/Search'
import Reviews from './pages/Reviews'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import { getCart } from './services/cartService'
import MyTickets from './pages/MyTickets'
import ProducerDashboard from './pages/ProducerDashboard'
import ProducerShows from './pages/ProducerShows'
import ProducerSessions from './pages/ProducerSessions'

function ProtectedRoute({ user, children }) {
  if (!user?.username) return <Navigate to="/" replace />
  return children
}

function App() {
  const [user, setUser] = useState(getStoredUser)
  const [cartCount, setCartCount] = useState(0)

  // Derived for backward-compat (Profile prop, useEffect dep)
  const username = user?.username || null
  const isLoggedIn = !!username

  async function handleLogin(loginData) {
    if (typeof loginData === 'string') {
      setUser((prev) => ({ ...prev, username: loginData }))
      return
    }

    storeUser(loginData)
    try {
      const profile = await fetchCurrentUser()
      storeUser(profile)
      setUser({
        username: profile.username || loginData.username,
        role: profile.role || null,
        is_staff: !!profile.is_staff,
      })
    } catch {
      setUser({
        username: loginData.username || null,
        role: loginData.role || null,
        is_staff: !!loginData.is_staff,
      })
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
      if (typeof nextCount === 'number') setCartCount(nextCount)
    }

    async function loadCartCount() {
      try {
        const cart = await getCart()
        if (active) setCartCount(cart.count ?? 0)
      } catch {
        if (active) setCartCount(0)
      }
    }

    loadCartCount()
    window.addEventListener('cart-updated', handleCartUpdated)
    return () => {
      active = false
      window.removeEventListener('cart-updated', handleCartUpdated)
    }
  }, [username])

  return (
    <BrowserRouter>
      <Navbar
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        cartCount={cartCount}
      />
      <Routes>
        {/* ── Public ── */}
        <Route path="/" element={<Home />} />
        <Route path="/artist/:id" element={<ArtistDetail />} />
        <Route path="/artist/:id/edit" element={<ArtistEdit />} />
        <Route path="/artists" element={<ArtistsList />} />
        <Route path="/shows" element={<ShowsList />} />
        <Route path="/show/:id" element={<ShowDetail />} />
        <Route path="/shows/:slug" element={<ShowDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/locations" element={<Locations />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/reservations" element={<AdminReservations />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile isLoggedIn={isLoggedIn} username={username} />} />
        <Route path="/search" element={<Search />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/tickets" element={<MyTickets isLoggedIn={isLoggedIn} />} />

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
          path="/producer/shows"
          element={
            <ProtectedRoute user={user}>
              <ProducerShows />
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
          path="/producer/sessions"
          element={<ProtectedRoute user={user}><PlaceholderPage title="Mes séances" /></ProtectedRoute>}
        />
        <Route
          path="/producer/stats"
          element={<ProtectedRoute user={user}><PlaceholderPage title="Mes statistiques" /></ProtectedRoute>}
        />

        {/* ── Administration ── */}
        <Route
          path="/admin/users"
          element={<ProtectedRoute user={user}><PlaceholderPage title="Gestion utilisateurs" /></ProtectedRoute>}
        />
        <Route
          path="/admin/reservations"
          element={<ProtectedRoute user={user}><PlaceholderPage title="Gestion réservations" /></ProtectedRoute>}
        />
        <Route
          path="/admin/locations"
          element={<ProtectedRoute user={user}><PlaceholderPage title="Nos lieux" /></ProtectedRoute>}
        />
      </Routes>
      <Footer />
      <CookieBanner />
    </BrowserRouter>
  )
}

function PlaceholderPage({ title }) {
  return (
    <div style={{ padding: '60px 40px', color: '#e0e0e0' }}>
      <h1 style={{ fontSize: '1.6rem', marginBottom: '8px' }}>{title}</h1>
      <p style={{ color: '#888' }}>Page en cours de développement.</p>
    </div>
  )
}

export default App