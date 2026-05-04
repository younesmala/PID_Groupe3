import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ArtistsList from './pages/ArtistsList'
import ArtistDetail from './pages/ArtistDetail'
import ArtistEdit from './pages/ArtistEdit'
import Home from './pages/Home'
import ShowsList from './pages/ShowsList'
import ShowDetail from './pages/ShowDetail'
import Cart from './pages/Cart'
import AdminDashboard from './pages/AdminDashboard'
import Navbar from './components/Navbar'
import CookieBanner from './components/CookieBanner'
import { getStoredUsername, logout } from './services/authService'
import Checkout from './pages/Checkout'
import Search from './pages/Search'
import Reviews from './pages/Reviews'
import Signup from './pages/Signup'
import Profile from './pages/Profile'
import { getCart } from './services/cartService'

function App() {
  const [username, setUsername] = useState(getStoredUsername)
  const [cartCount, setCartCount] = useState(0)

  const isLoggedIn = !!username

  function handleLogin(user) {
    if (typeof user === 'string') {
      setUsername(user)
      return
    }

    setUsername(user?.username || null)
  }

  async function handleLogout() {
    try {
      await logout()
    } catch {
      // Keep logout resilient if the backend session already expired.
    }
    setUsername(null)
    setCartCount(0)
  }

  useEffect(() => {
    let active = true

    function handleCartUpdated(event) {
      if (!active) {
        return
      }

      const nextCount = event.detail?.cartCount
      if (typeof nextCount === 'number') {
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
    window.addEventListener('cart-updated', handleCartUpdated)

    return () => {
      active = false
      window.removeEventListener('cart-updated', handleCartUpdated)
    }
  }, [username])

  return (
    <BrowserRouter>
      <Navbar
        isLoggedIn={isLoggedIn}
        username={username}
        onLogin={handleLogin}
        onLogout={handleLogout}
        cartCount={cartCount}
      />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/artist/:id" element={<ArtistDetail />} />
        <Route path="/artist/:id/edit" element={<ArtistEdit />} />
        <Route path="/shows" element={<ShowsList />} />
        <Route path="/show/:id" element={<ShowDetail />} />
        <Route path="/shows/:slug" element={<ShowDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile isLoggedIn={isLoggedIn} username={username} />} />
        <Route path="/search" element={<Search />} />
        <Route path="/reviews" element={<Reviews />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  )
}

export default App
