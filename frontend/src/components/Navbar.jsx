import { useState } from 'react'
import { Link } from 'react-router-dom'
import LoginModal from './LoginModal'
import './Navbar.css'

function Navbar({ isLoggedIn, username, onLogin, onLogout, cartCount = 0 }) {
  const [showModal, setShowModal] = useState(false)

  function handleLoginSuccess(name) {
    onLogin(name)
    setShowModal(false)
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">Reservations</Link>
        </div>

        <div className="navbar-links">
          <Link to="/">Home</Link>
          <Link to="/catalogue">Catalog</Link>
          <Link to="/artists">Artists</Link>
          <Link to="/shows">Shows</Link>
        </div>

        <div className="navbar-right">
          <Link to="/cart" className="cart-btn">
            🛒
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {isLoggedIn ? (
            <>
              <span className="navbar-username">{username}</span>
              <button className="btn-logout" onClick={onLogout}>Logout</button>
            </>
          ) : (
            <>
              <button className="btn-login" onClick={() => setShowModal(true)}>Login</button>
              <Link to="/signup" className="btn-signup">Sign up</Link>
            </>
          )}
        </div>
      </nav>

      {showModal && (
        <LoginModal
          onClose={() => setShowModal(false)}
          onLogin={handleLoginSuccess}
        />
      )}
    </>
  )
}

export default Navbar
