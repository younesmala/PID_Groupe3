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

const PRODUCER_LINKS = [
  { to: '/producer/dashboard', label: 'Tableau de bord' },
  { to: '/producer/shows',     label: 'Mes spectacles'  },
  { to: '/producer/sessions',  label: 'Mes séances'     },
  { to: '/producer/stats',     label: 'Mes statistiques'},
]

const ADMIN_LINKS = [
  { to: '/admin/users',        label: 'Gestion utilisateurs'  },
  { to: '/admin/reservations', label: 'Gestion réservations'  },
  { to: '/admin/locations',    label: 'Nos lieux'              },
]

function NavDropdown({ label, links, accentClass, menuRef, open, onToggle }) {
  return (
    <div className={`nav-dropdown ${accentClass}`} ref={menuRef}>
      <button
        className="nav-dropdown-trigger"
        onClick={onToggle}
        aria-expanded={open}
      >
        {label} ▾
      </button>
      {open && (
        <ul className="nav-dropdown-menu">
          {links.map(({ to, label: text }) => (
            <li key={to}>
              <Link to={to} className="nav-dropdown-item" onClick={onToggle}>
                {text}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function Navbar({ user, onLogin, onLogout, cartCount = 0 }) {
  const { t, i18n } = useTranslation()
  const [showModal,    setShowModal]    = useState(false)
  const [langOpen,     setLangOpen]     = useState(false)
  const [producerOpen, setProducerOpen] = useState(false)
  const [adminOpen,    setAdminOpen]    = useState(false)
  const [selectedLang, setSelectedLang] = useState(
    () => localStorage.getItem('language') || 'FR'
  )

  const langRef     = useRef(null)
  const producerRef = useRef(null)
  const adminRef    = useRef(null)

  const isLoggedIn  = !!user?.username
  const isProducer  = user?.role === 'PRODUCER'
  const isAdmin     = !!user?.is_staff

  const currentLang = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(e) {
      if (langRef.current     && !langRef.current.contains(e.target))     setLangOpen(false)
      if (producerRef.current && !producerRef.current.contains(e.target)) setProducerOpen(false)
      if (adminRef.current    && !adminRef.current.contains(e.target))    setAdminOpen(false)
    }

    function handleOpenLoginModal() {
      setShowModal(true)
    }

    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('open-login-modal', handleOpenLoginModal)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      window.removeEventListener('open-login-modal', handleOpenLoginModal)
    }
  }, [])

  function selectLang(code) {
    setSelectedLang(code)
    localStorage.setItem('language', code)
    i18n.changeLanguage(code.toLowerCase())
    setLangOpen(false)
  }

  function handleLoginSuccess(data) {
    onLogin(data)
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
          {/* Espace Producteur */}
          {isLoggedIn && isProducer && (
            <NavDropdown
              label="Espace Producteur"
              links={PRODUCER_LINKS}
              accentClass="nav-dropdown--producer"
              menuRef={producerRef}
              open={producerOpen}
              onToggle={() => setProducerOpen((o) => !o)}
            />
          )}

          {/* Administration */}
          {isLoggedIn && isAdmin && (
            <NavDropdown
              label="Administration"
              links={ADMIN_LINKS}
              accentClass="nav-dropdown--admin"
              menuRef={adminRef}
              open={adminOpen}
              onToggle={() => setAdminOpen((o) => !o)}
            />
          )}

          {/* Langue */}
          <div className="lang-dropdown" ref={langRef}>
            <button
              className="btn-lang"
              onClick={() => setLangOpen((o) => !o)}
              aria-expanded={langOpen}
            >
              <span className="lang-flag">{currentLang.flag}</span>
              <span>{currentLang.code}</span>
              <span className="btn-lang-arrow">▼</span>
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

          {/* Panier */}
          <Link to="/cart" className="btn-cart">
            🛒 {t('panier')}
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Auth */}
          {isLoggedIn ? (
            <>
              <Link to="/profile" className="btn-outline">Mon profil</Link>
              {user?.username && (
                <span className="navbar-username">{user.username}</span>
              )}
              <button className="btn-outline" onClick={onLogout}>
                {t('deconnexion')}
              </button>
            </>
          ) : (
            <>
              <Link to="/signup" className="btn-outline">{t('inscription')}</Link>
              <button className="btn-primary" onClick={() => setShowModal(true)}>
                {t('connexion')}
              </button>
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