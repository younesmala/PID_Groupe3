import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import LoginModal from './LoginModal'
import { clearPublicShowsCache } from '../services/publicShowService'
import './Navbar.css'

const LANGUAGES = [
  { code: 'FR', label: 'Français', flag: '🇫🇷' },
  { code: 'NL', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'EN', label: 'English', flag: '🇬🇧' },
]

const SUPPORTED_LANGUAGES = ['fr', 'nl', 'en']

function replacePathLanguage(pathname, language) {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = (segments[0] || '').toLowerCase()

  if (SUPPORTED_LANGUAGES.includes(firstSegment)) {
    const remainingSegments = segments.slice(1).join('/')
    return remainingSegments ? `/${language}/${remainingSegments}` : `/${language}`
  }

  return pathname === '/' ? `/${language}` : `/${language}${pathname}`
}


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
  const location = useLocation()
  const navigate = useNavigate()
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
  const urlFirstSegment = (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase()
  const languageFromUrl = SUPPORTED_LANGUAGES.includes(urlFirstSegment) ? urlFirstSegment : null
  const normalizedLang = (languageFromUrl || selectedLang || 'FR').toLowerCase()

  function localizedPath(path) {
    if (path === '/') {
      return `/${normalizedLang}`
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `/${normalizedLang}${normalizedPath}`
  }

  const signupPath = localizedPath('/signup')

  const currentLang = LANGUAGES.find((l) => l.code === selectedLang) || LANGUAGES[0]

  const producerLinks = [
    { to: localizedPath('/producer/dashboard'), label: t('navbar.producer_dashboard') },
    { to: localizedPath('/producer/shows'),     label: t('navbar.producer_shows')     },
    { to: localizedPath('/producer/sessions'),  label: t('navbar.producer_sessions')  },
    { to: localizedPath('/producer/stats'),     label: t('navbar.producer_stats')     },
  ]

  const adminLinks = [
    { to: localizedPath('/admin/users'),        label: t('navbar.admin_users')        },
    { to: localizedPath('/admin/reservations'), label: t('navbar.admin_reservations') },
    { to: localizedPath('/admin/locations'),    label: t('navbar.admin_locations')    },
  ]

  useEffect(() => {
    const currentLanguage = (languageFromUrl || (i18n.language || 'fr').slice(0, 2)).toUpperCase()

    if (currentLanguage !== selectedLang) {
      setSelectedLang(currentLanguage)
    }
  }, [i18n.language, languageFromUrl, selectedLang])

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
    const nextLanguage = code.toLowerCase()
    i18n.changeLanguage(nextLanguage)

    const nextPath = replacePathLanguage(location.pathname, nextLanguage)
    navigate(`${nextPath}${location.search}${location.hash}`, { replace: true })

    clearPublicShowsCache()
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
          <Link to={localizedPath('/')}>
            <span className="logo-pid">Brussels</span>
            <span className="logo-booking">Show</span>
          </Link>
        </div>

        <div className="navbar-right">
          {/* Espace Producteur */}
          {isLoggedIn && isProducer && (
            <NavDropdown
              label={t('navbar.producer_space')}
              links={producerLinks}
              accentClass="nav-dropdown--producer"
              menuRef={producerRef}
              open={producerOpen}
              onToggle={() => setProducerOpen((o) => !o)}
            />
          )}

          {/* Administration */}
          {isLoggedIn && isAdmin && (
            <NavDropdown
              label={t('navbar.admin')}
              links={adminLinks}
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
              <span>{currentLang.code}</span>
              <span className="btn-lang-arrow">▼</span>
            </button>
            {langOpen && (
              <ul className="lang-menu">
                {LANGUAGES.map(({ code }) => (
                  <li key={code}>
                    <button
                      className={`lang-option ${selectedLang === code ? 'lang-option--active' : ''}`}
                      onClick={() => selectLang(code)}
                    >
                      <span className="lang-code">{code}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <Link to="/locations" className="btn-admin">
            📍 Nos lieux
          </Link>

          {/* Panier */}
          <Link to={localizedPath('/cart')} className="btn-cart">
            🛒 {t('panier')}
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* Auth */}
          {isLoggedIn ? (
            <>
              <Link to={localizedPath('/profile')} className="btn-outline">{t('navbar.profile')}</Link>
              {user?.username && (
                <span className="navbar-username">{user.username}</span>
              )}
              <button className="btn-outline" onClick={onLogout}>
                {t('deconnexion')}
              </button>
            </>
          ) : (
            <>
              <Link to={signupPath} className="btn-outline">{t('inscription')}</Link>
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