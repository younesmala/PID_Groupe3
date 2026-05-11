import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import NavbarLanguageSelector from './NavbarLanguageSelector'
import NavbarAuthButtons from './NavbarAuthButtons'

function NavbarMobileMenu({ selectedLang, onLanguageChange, onLoginClick, signupPath }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleLanguageChange = (code) => {
    onLanguageChange(code)
    setIsOpen(false)
  }

  return (
    <div className="md:hidden" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-300 hover:text-white transition-colors duration-200"
        aria-expanded={isOpen}
        aria-label={t('navbar.toggle_menu')}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full w-80 bg-gray-900 border-t-2 border-orange-500 shadow-2xl p-6 space-y-6 z-50">
          <div className="space-y-3">
            <label className="text-xs font-light text-gray-500 uppercase tracking-widest block">{t('navbar.language')}</label>
            <div>
              <NavbarLanguageSelector selectedLang={selectedLang} onLanguageChange={handleLanguageChange} />
            </div>
          </div>

          <div className="border-t border-gray-700 pt-6">
            <label className="text-xs font-light text-gray-500 uppercase tracking-widest block mb-4">{t('navbar.authentication')}</label>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => {
                  onLoginClick()
                  setIsOpen(false)
                }}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-[0_10px_24px_rgba(245,158,11,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              >
                {t('connexion')}
              </button>
              <Link
                to={signupPath}
                onClick={() => setIsOpen(false)}
                className="inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-amber-300/20 bg-amber-400 px-6 py-3 text-sm font-semibold text-slate-950 no-underline shadow-[0_10px_24px_rgba(245,158,11,0.28)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-amber-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
              >
                {t('inscription')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default NavbarMobileMenu
