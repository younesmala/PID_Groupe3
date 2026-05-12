import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

const LANGUAGES = ['FR', 'NL', 'EN']

const triggerButtonStyle = {
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  width: '104px',
  minHeight: '44px',
  padding: '12px 34px 12px 14px',
  borderRadius: '18px',
  border: '1px solid rgba(217, 119, 6, 0.26)',
  background: '#d9911d',
  color: '#0f172a',
  fontSize: '0.95rem',
  fontWeight: 700,
  lineHeight: 1,
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(217, 145, 29, 0.22)',
  transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
}

const menuStyle = {
  position: 'absolute',
  top: 'calc(100% + 8px)',
  right: 0,
  width: '104px',
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
  width: '100%',
  padding: '10px 14px',
  border: 'none',
  background: 'transparent',
  color: '#0f172a',
  textAlign: 'left',
  fontSize: '0.95rem',
  fontWeight: 700,
  cursor: 'pointer',
}

function NavbarLanguageSelector({ selectedLang = 'FR', onLanguageChange, buttonWidth = '104px' }) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const menuRef = useRef(null)
  const currentLang = LANGUAGES.includes(selectedLang) ? selectedLang : LANGUAGES[0]

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  return (
    <div
      ref={menuRef}
      style={{
        position: 'relative',
        display: 'inline-block',
        zIndex: isOpen ? 1000 : 'auto',
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        style={{
          ...triggerButtonStyle,
          width: buttonWidth,
          minWidth: buttonWidth,
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          background: isHovered ? '#f1b53f' : triggerButtonStyle.background,
          boxShadow: isHovered
            ? '0 12px 24px rgba(217, 145, 29, 0.32)'
            : triggerButtonStyle.boxShadow,
        }}
        aria-expanded={isOpen}
        aria-label={t('navbar.select_language')}
      >
        <span>{currentLang}</span>
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: `translateY(-50%) rotate(${isOpen ? '180deg' : '0deg'})`,
            pointerEvents: 'none',
            color: '#0f172a',
            fontSize: '0.8rem',
            fontWeight: 700,
            transition: 'transform 0.2s ease',
          }}
        >
          v
        </span>
      </button>

      {isOpen && (
        <div style={{ ...menuStyle, width: buttonWidth }}>
          {LANGUAGES.map((code, index) => {
            const isSelected = code === currentLang

            return (
              <button
                key={code}
                type="button"
                onClick={() => {
                  onLanguageChange(code)
                  setIsOpen(false)
                }}
                style={{
                  ...menuItemStyle,
                  display: 'block',
                  background: isSelected ? 'rgba(255, 255, 255, 0.18)' : 'transparent',
                  borderTop: index === 0 ? 'none' : '1px solid rgba(15, 23, 42, 0.08)',
                }}
              >
                {code}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default NavbarLanguageSelector
