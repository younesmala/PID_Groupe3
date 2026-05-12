import { Link } from 'react-router-dom'
import { LogIn, UserPlus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const primaryButtonStyle = {
  display: 'inline-flex',
  boxSizing: 'border-box',
  flex: '0 0 148px',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  width: '148px',
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
  transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
}

function NavbarAuthButtons({ onLoginClick, signupPath }) {
  const { t } = useTranslation()
  const [loginHovered, setLoginHovered] = useState(false)
  const [signupHovered, setSignupHovered] = useState(false)

  return (
    <div className="flex items-center gap-3" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button
        type="button"
        onClick={onLoginClick}
        onMouseEnter={() => setLoginHovered(true)}
        onMouseLeave={() => setLoginHovered(false)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        style={{
          ...primaryButtonStyle,
          transform: loginHovered ? 'translateY(-2px)' : 'translateY(0)',
          background: loginHovered ? '#f1b53f' : primaryButtonStyle.background,
          boxShadow: loginHovered
            ? '0 12px 24px rgba(217, 145, 29, 0.32)'
            : primaryButtonStyle.boxShadow,
          transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        }}
        aria-label={t('connexion')}
      >
        <LogIn size={16} />
        <span>{t('connexion')}</span>
      </button>

      <Link
        to={signupPath}
        onMouseEnter={() => setSignupHovered(true)}
        onMouseLeave={() => setSignupHovered(false)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-200 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
        style={{
          ...primaryButtonStyle,
          transform: signupHovered ? 'translateY(-2px)' : 'translateY(0)',
          background: signupHovered ? '#f1b53f' : primaryButtonStyle.background,
          boxShadow: signupHovered
            ? '0 12px 24px rgba(217, 145, 29, 0.32)'
            : primaryButtonStyle.boxShadow,
          transition: 'transform 0.2s ease, background-color 0.2s ease, box-shadow 0.2s ease',
        }}
        aria-label={t('inscription')}
      >
        <UserPlus size={16} />
        <span>{t('inscription')}</span>
      </Link>
    </div>
  )
}

export default NavbarAuthButtons
