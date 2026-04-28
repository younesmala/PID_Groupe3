import { useState } from 'react'
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

function App() {
  const [username, setUsername] = useState(getStoredUsername)
  const [cartCount] = useState(0)

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
  }

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
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
      </Routes>
      <CookieBanner />
    </BrowserRouter>
  )
}

export default App
