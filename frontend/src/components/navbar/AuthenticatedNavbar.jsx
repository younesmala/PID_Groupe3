import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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
  const [adminOpen, setAdminOpen] = useState(false)
  const [roleHovered, setRoleHovered] = useState(false)
  const [cartHovered, setCartHovered] = useState(false)
  const [profileHovered, setProfileHovered] = useState(false)
  const [logoutHovered, setLogoutHovered] = useState(false)
  
  const producerRef = useRef(null)
  const adminRef = useRef(null)

  const normalizedRole = String(user?.role || '').toUpperCase()
  const isProducer = normalizedRole === 'PRODUCER' || normalizedRole === 'PRODUCTEUR'
  const isAdmin = !!user?.is_staff
  const userRoleLabel = isAdmin
    ? t('navbar.role_admin')
    : isProducer
      ? t('navbar.role_producer')
      : t('navbar.role_client')

  const producerLinks = [
    { to: localizedPath('/producer/dashboard'), label: t('navbar.producer_dashboard') },
    { to: localizedPath('/producer/shows'), label: t('navbar.producer_shows') },
    { to: localizedPath('/producer/sessions'), label: t('navbar.producer_sessions') },
    { to: localizedPath('/producer/stats'), label: t('navbar.producer_stats') },
  ]

  const adminLinks = [
    { to: localizedPath('/admin/users'), label: t('navbar.admin_users') },
    { to: localizedPath('/admin/reservations'), label: t('navbar.admin_reservations') },
    { to: localizedPath('/admin/locations'), label: t('navbar.admin_locations') },
  ]

  useEffect(() => {
    function handleClickOutside(e) {
      if (producerRef.current && !producerRef.current.contains(e.target)) setProducerOpen(false)
      if (adminRef.current && !adminRef.current.contains(e.target)) setAdminOpen(false)
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
        {/* Role indicator hidden for producer session */}
        {!isProducer && (
          <Link
            to={localizedPath('/profile')}
            onMouseEnter={() => setRoleHovered(true)}
            onMouseLeave={() => setRoleHovered(false)}
            style={{
              boxSizing: 'border-box',
              flex: `0 0 ${UNIFORM_BUTTON_WIDTH}`,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: UNIFORM_BUTTON_WIDTH,
              minWidth: UNIFORM_BUTTON_WIDTH,
              minHeight: '44px',
              padding: '12px 20px',
              borderRadius: '18px',
              border: '1px solid rgba(217, 119, 6, 0.26)',
              color: '#f8fafc',
              textDecoration: 'none',
              fontSize: '0.95rem',
              fontWeight: 800,
              letterSpacing: '0.04em',
              background: roleHovered ? 'rgba(217, 145, 29, 0.32)' : 'rgba(217, 145, 29, 0.18)',
              transform: roleHovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: roleHovered ? '0 10px 20px rgba(217, 145, 29, 0.22)' : 'none',
              transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
              whiteSpace: 'nowrap',
            }}
            title={t('navbar.role_indicator_title')}
          >
            {userRoleLabel.toUpperCase()}
          </Link>
        )}

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

        {/* Admin Space */}
        {isAdmin && (
          <NavDropdown
            label={t('navbar.admin')}
            links={adminLinks}
            menuRef={adminRef}
            open={adminOpen}
            onToggle={() => setAdminOpen((o) => !o)}
          />
        )}

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
