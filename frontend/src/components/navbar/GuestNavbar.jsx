import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import NavbarGuestLogo from './NavbarGuestLogo'
import NavbarLanguageSelector from './NavbarLanguageSelector'
import NavbarAuthButtons from './NavbarAuthButtons'
import LoginModal from '../LoginModal'
import { clearPublicShowsCache } from '../../services/publicShowService'

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

function GuestNavbar({ onLogin }) {
  const { i18n, t } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const [showModal, setShowModal] = useState(false)
  const [selectedLang, setSelectedLang] = useState(
    () => localStorage.getItem('language') || 'FR'
  )

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

  useEffect(() => {
    const currentLanguage = (languageFromUrl || (i18n.language || 'fr').slice(0, 2)).toUpperCase()

    if (currentLanguage !== selectedLang) {
      setSelectedLang(currentLanguage)
    }
  }, [i18n.language, languageFromUrl, selectedLang])

  useEffect(() => {
    function handleOpenLoginModal() {
      setShowModal(true)
    }

    window.addEventListener('open-login-modal', handleOpenLoginModal)

    return () => {
      window.removeEventListener('open-login-modal', handleOpenLoginModal)
    }
  }, [])

  useEffect(() => {
    if (location.pathname === localizedPath('/login')) {
      setShowModal(true)
    }
  }, [location.pathname])

  function handleLanguageChange(code) {
    setSelectedLang(code)
    localStorage.setItem('language', code)
    const nextLanguage = code.toLowerCase()
    i18n.changeLanguage(nextLanguage)

    const nextPath = replacePathLanguage(location.pathname, nextLanguage)
    navigate(`${nextPath}${location.search}${location.hash}`, { replace: true })

    clearPublicShowsCache()
  }

  function handleLoginSuccess(data) {
    onLogin(data)
    setShowModal(false)
  }

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

            {/* Right: Langue + Connexion + Inscription */}
            <div
              className="flex items-center gap-6"
              style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto', paddingRight: '16px' }}
            >
              {/* Locations - hidden */}
              <NavbarLanguageSelector
                selectedLang={selectedLang}
                onLanguageChange={handleLanguageChange}
              />
              <NavbarAuthButtons
                onLoginClick={() => setShowModal(true)}
                signupPath={signupPath}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Login Modal */}
      {showModal && (
        <LoginModal
          onClose={() => setShowModal(false)}
          onLogin={handleLoginSuccess}
        />
      )}
    </>
  )
}

export default GuestNavbar
