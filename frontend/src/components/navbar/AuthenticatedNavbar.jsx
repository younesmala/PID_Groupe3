import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDown, LogOut, User, ShoppingCart } from 'lucide-react'
import { clearPublicShowsCache } from '../../services/publicShowService'
import NavbarLanguageSelector from './NavbarLanguageSelector'

const SUPPORTED_LANGUAGES = ['fr', 'nl', 'en']
const UNIFORM_BUTTON_WIDTH = '148px'

const actionStyle = {
  display: 'inline-flex',
  boxSizing: 'border-box',
  flex: `0 0 ${UNIFORM_BUTTON_WIDTH}`,
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: UNIFORM_BUTTON_WIDTH,
  minWidth: UNIFORM_BUTTON_WIDTH,
  minHeight: '44px',
  padding: '12px 20px',
  borderRadius: '18px',
  border: '1px solid rgba(217, 119, 6, 0.26)',
  background: '#d9911d',
  color: '#0f172a',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 700,
  lineHeight: 1,
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(217, 145, 29, 0.22)',
  whiteSpace: 'nowrap',
}

const menuStyle = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  minWidth: '220px',
  display: 'flex',
  flexDirection: 'column',
  padding: '4px 0',
  overflow: 'hidden',
  borderRadius: '18px',
  border: '1px solid rgba(217, 119, 6, 0.26)',
  background: '#d9911d',
  boxShadow: '0 14px 28px rgba(15, 23, 42, 0.28)',
  zIndex: 1000,
}

const menuItemStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 14px',
  border: 'none',
  background: 'transparent',
  color: '#0f172a',
  textAlign: 'left',
  textDecoration: 'none',
  fontSize: '0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
}

function replacePathLanguage(pathname, language) {
  const segments = pathname.split('/').filter(Boolean)
  const firstSegment = (segments[0] || '').toLowerCase()

  if (SUPPORTED_LANGUAGES.includes(firstSegment)) {
    const remainingSegments = segments.slice(1).join('/')
    return remainingSegments ? `/${language}/${remainingSegments}` : `/${language}`
  }

  return pathname === '/' ? `/${language}` : `/${language}${pathname}`
}

function NavDropdown({ label, links, menuRef, open, onToggle }) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={onToggle}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          ...actionStyle,
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          background: isHovered ? '#f1b53f' : actionStyle.background,
          boxShadow: isHovered
            ? '0 12px 24px rgba(217, 145, 29, 0.32)'
            : actionStyle.boxShadow,
          transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        }}
        aria-expanded={open}
      >
        {label}
        <ChevronDown size={16} style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s ease' }} />
      </button>
      {open && (
        <div style={menuStyle}>
          {links.map(({ to, label: text }, index) => (
            <Link
              key={to}
              to={to}
              style={{
                ...menuItemStyle,
                borderTop: index === 0 ? 'none' : '1px solid rgba(15, 23, 42, 0.08)',
              }}
              onClick={onToggle}
            >
              {text}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

function AuthenticatedNavbar({ user, onLogout, localizedPath, selectedLang, setSelectedLang, normalizedLang, location, navigate, cartCount, t, i18n }) {
  const [producerOpen, setProducerOpen] = useState(false)
  const [criticOpen, setCriticOpen] = useState(false)
  const [adminHovered, setAdminHovered] = useState(false)
  const [cartHovered, setCartHovered] = useState(false)
  const [profileHovered, setProfileHovered] = useState(false)
  const [logoutHovered, setLogoutHovered] = useState(false)

  const producerRef = useRef(null)
  const criticRef = useRef(null)

  const normalizedRole = String(user?.role || '').toUpperCase()
  const isProducer = normalizedRole === 'PRODUCER' || normalizedRole === 'PRODUCTEUR'
  // Affiche l'espace critique pour tous les rôles critiques connus
  const isCritic = [
    'CRITIC',
    'CRITIQUE',
    'PRESS_CRITIC',
    'PRESSE_CRITIQUE',
  ].includes(normalizedRole)
  const isAdmin = !!user?.is_staff

  const producerLinks = [
    { to: localizedPath('/producer/dashboard'), label: t('navbar.producer_dashboard') },
    { to: localizedPath('/producer/shows'), label: t('navbar.producer_shows') },
    { to: localizedPath('/artists'), label: t('navbar.producer_artists') },
    { to: localizedPath('/producer/sessions'), label: t('navbar.producer_sessions') },
    { to: localizedPath('/producer/reviews'), label: t('navbar.producer_reviews') },
  ]

  const criticLinks = [
    { to: localizedPath('/critic/reviews'), label: t('navbar.critic_reviews') },
  ]

  useEffect(() => {
    function handleClickOutside(e) {
      if (producerRef.current && !producerRef.current.contains(e.target)) setProducerOpen(false)
      if (criticRef.current && !criticRef.current.contains(e.target)) setCriticOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectLang(code) {
    setSelectedLang(code)
    localStorage.setItem('language', code)
    const nextLanguage = code.toLowerCase()
    i18n.changeLanguage(nextLanguage)

    const nextPath = replacePathLanguage(location.pathname, nextLanguage)
    navigate(`${nextPath}${location.search}${location.hash}`, { replace: true })

    clearPublicShowsCache()
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto', paddingRight: '16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Producer Space */}
        {isProducer && (
          <NavDropdown
            label={t('navbar.producer_space')}
            links={producerLinks}
            menuRef={producerRef}
            open={producerOpen}
            onToggle={() => setProducerOpen((o) => !o)}
          />
        )}
        {/* Critic Space Dropdown */}
        {isCritic && (
          <NavDropdown
            label={t('navbar.critic_space')}
            links={criticLinks}
            menuRef={criticRef}
            open={criticOpen}
            onToggle={() => setCriticOpen((o) => !o)}
          />
        )}

        {/* Admin Space */}
        {isAdmin && (
          <Link
            to={localizedPath('/admin/dashboard')}
            onMouseEnter={() => setAdminHovered(true)}
            onMouseLeave={() => setAdminHovered(false)}
            style={{
              ...actionStyle,
              transform: adminHovered ? 'translateY(-2px)' : 'translateY(0)',
              background: adminHovered ? '#f1b53f' : actionStyle.background,
              boxShadow: adminHovered
                ? '0 12px 24px rgba(217, 145, 29, 0.32)'
                : actionStyle.boxShadow,
              transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
            }}
          >
            <span>{t('navbar.admin')}</span>
          </Link>
        )}

        {/* Locations - hidden */}

        {/* Language Selector */}
        <NavbarLanguageSelector
          selectedLang={selectedLang}
          onLanguageChange={selectLang}
          buttonWidth={UNIFORM_BUTTON_WIDTH}
        />

        {/* Cart */}
        <Link
          to={localizedPath('/cart')}
          onMouseEnter={() => setCartHovered(true)}
          onMouseLeave={() => setCartHovered(false)}
          style={{
            ...actionStyle,
            position: 'relative',
            transform: cartHovered ? 'translateY(-2px)' : 'translateY(0)',
            background: cartHovered ? '#f1b53f' : actionStyle.background,
            boxShadow: cartHovered
              ? '0 12px 24px rgba(217, 145, 29, 0.32)'
              : actionStyle.boxShadow,
            transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <ShoppingCart size={18} />
          <span>{t('panier')}</span>
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              background: '#ef4444',
              color: '#ffffff',
              fontSize: '0.7rem',
              fontWeight: 700,
              borderRadius: '9999px',
              minWidth: '18px',
              height: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {cartCount}
            </span>
          )}
        </Link>

        {/* Profile & Logout */}
        <Link
          to={localizedPath('/profile')}
          onMouseEnter={() => setProfileHovered(true)}
          onMouseLeave={() => setProfileHovered(false)}
          style={{
            ...actionStyle,
            transform: profileHovered ? 'translateY(-2px)' : 'translateY(0)',
            background: profileHovered ? '#f1b53f' : actionStyle.background,
            boxShadow: profileHovered
              ? '0 12px 24px rgba(217, 145, 29, 0.32)'
              : actionStyle.boxShadow,
            transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <User size={18} />
          <span>{user?.username || t('navbar.profile')}</span>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          onMouseEnter={() => setLogoutHovered(true)}
          onMouseLeave={() => setLogoutHovered(false)}
          style={{
            ...actionStyle,
            transform: logoutHovered ? 'translateY(-2px)' : 'translateY(0)',
            background: logoutHovered ? '#f1b53f' : actionStyle.background,
            boxShadow: logoutHovered
              ? '0 12px 24px rgba(217, 145, 29, 0.32)'
              : actionStyle.boxShadow,
            transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
          }}
        >
          <LogOut size={18} />
          <span>{t('deconnexion')}</span>
        </button>
      </div>
    </div>
  )
}

export default AuthenticatedNavbar
