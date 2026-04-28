import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LoginModal from './LoginModal'
import './Navbar.css'

const LANGUAGES = [
  { code: 'FR', label: 'Français', flag: '🇫🇷' },
  { code: 'NL', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
]

function Navbar({ isLoggedIn, username, onLogin, onLogout, cartCount = 0 }) {
  const { t, i18n } = useTranslation()
  const [showModal, setShowModal] = useState(false)
  const [langOpen, setLangOpen] = useState(false)
  const [selectedLang, setSelectedLang] = useState(
    () => localStorage.getItem('language') || 'FR'
  )
  const langRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current && !langRef.current.contains(e.target)) {
        setLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectLang(code) {
    setSelectedLang(code)
    localStorage.setItem('language', code)
    i18n.changeLanguage(code.toLowerCase())
    setLangOpen(false)
  }

  function handleLoginSuccess(name) {
    onLogin(name)
    setShowModal(false)
  }

  return (
    <>
      <nav className="navbar">
        <div className="navbar-logo">
          <Link to="/">
            <span className="logo-pid">Brussels</span>
            <span className="logo-booking">Show</span>
          </Link>
        </div>

        <div className="navbar-right">
          <div className="lang-dropdown" ref={langRef}>
            <button
              className="btn-lang"
              onClick={() => setLangOpen((o) => !o)}
              aria-expanded={langOpen}
            >
              {selectedLang} ▼
            </button>
            {langOpen && (
              <ul className="lang-menu">
                {LANGUAGES.map(({ code, label, flag }) => (
                  <li key={code}>
                    <button
                      className={`lang-option ${selectedLang === code ? 'lang-option--active' : ''}`}
                      onClick={() => selectLang(code)}
                    >
                      <span className="lang-flag">{flag}</span>
                      <span className="lang-code">{code}</span>
                      <span className="lang-label">{label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link to="/cart" className="btn-cart">
            🛒 {t('panier')}
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {isLoggedIn && (
            <Link to="/admin/dashboard" className="btn-admin">
              📊 Dashboard
            </Link>
          )}

          {isLoggedIn ? (
            <>
              <span className="navbar-username">{username}</span>
              <button className="btn-outline" onClick={onLogout}>{t('deconnexion')}</button>
            </>
          ) : (
            <>
              <Link to="/signup" className="btn-outline">{t('inscription')}</Link>
              <button className="btn-primary" onClick={() => setShowModal(true)}>{t('connexion')}</button>
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
