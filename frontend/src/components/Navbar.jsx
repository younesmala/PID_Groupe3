import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import GuestNavbar from './navbar/GuestNavbar'
import AuthenticatedNavbar from './navbar/AuthenticatedNavbar'
import LoginModal from './LoginModal'
import NavbarGuestLogo from './navbar/NavbarGuestLogo'
import { clearPublicShowsCache } from '../services/publicShowService'

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

function Navbar({ user, onLogin, onLogout, cartCount = 0 }) {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [selectedLang, setSelectedLang] = useState(
    () => localStorage.getItem('language') || 'FR'
  )

  const isLoggedIn = !!user?.username
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

  useEffect(() => {
    const currentLanguage = (languageFromUrl || (i18n.language || 'fr').slice(0, 2)).toUpperCase()

    if (currentLanguage !== selectedLang) {
      setSelectedLang(currentLanguage)
    }
  }, [i18n.language, languageFromUrl, selectedLang])

  function handleLoginSuccess(data) {
    onLogin(data)
    setShowModal(false)

    if (data?.is_staff) {
      navigate(localizedPath('/admin/dashboard'))
    }
  }

  // Visitor (non-logged-in) navbar
  if (!isLoggedIn) {
    return <GuestNavbar onLogin={handleLoginSuccess} />
  }

  // Authenticated user navbar
  return (
    <>
      <nav style={{ backgroundColor: '#00001F' }} className="sticky top-0 z-50 border-b border-white/10">
        <div className="w-full px-10 sm:px-14 lg:px-24">
          <div
            className="flex items-center justify-between h-16"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: '64px' }}
          >
            {/* Logo - Left side */}
            <div className="flex-shrink-0">
              <NavbarGuestLogo to={localizedPath('/')} />
            </div>

            {/* Authenticated nav content */}
            <AuthenticatedNavbar
              user={user}
              onLogout={onLogout}
              localizedPath={localizedPath}
              selectedLang={selectedLang}
              setSelectedLang={setSelectedLang}
              normalizedLang={normalizedLang}
              location={location}
              navigate={navigate}
              cartCount={cartCount}
              t={t}
              i18n={i18n}
            />
          </div>
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