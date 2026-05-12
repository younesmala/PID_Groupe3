import { Link } from 'react-router-dom'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { login } from '../services/authService'
import './LoginModal.css'

function PasswordToggleIcon({ visible }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12c.74-2.08 1.96-3.88 3.46-5.31" />
        <path d="M10.58 10.58a2 2 0 1 0 2.83 2.83" />
        <path d="M1 1l22 22" />
        <path d="M9.88 5.09A10.94 10.94 0 0 1 12 4c5 0 9.27 3.11 11 8a10.94 10.94 0 0 1-1.67 2.95" />
      </svg>
    )
  }

  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function LoginModal({ onClose, onLogin }) {
  const { t, i18n } = useTranslation()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const language = ['fr', 'en', 'nl'].includes((i18n.language || 'fr').slice(0, 2).toLowerCase())
    ? (i18n.language || 'fr').slice(0, 2).toLowerCase()
    : 'fr'
  const forgotPasswordPath = `/${language}/forgot-password`

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(username, password)
      onLogin(data)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        <h2>{t('login.title')}</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-field">
            <label>{t('login.username')}</label>
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="modal-field">
            <label>{t('login.password')}</label>
            <div className="modal-password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="modal-password-toggle"
                onClick={() => setShowPassword(current => !current)}
                aria-label={showPassword ? t('login.hide_password') : t('login.show_password')}
                title={showPassword ? t('login.hide_password') : t('login.show_password')}
              >
                <PasswordToggleIcon visible={showPassword} />
              </button>
            </div>
          </div>
          {error && <p className="modal-error">{error}</p>}
          <button type="submit" className="modal-submit" disabled={loading}>
            {loading ? t('login.loading') : t('login.submit')}
          </button>
          <Link className="modal-forgot-password" to={forgotPasswordPath} onClick={onClose}>
            {t('login.forgot_password')}
          </Link>
        </form>
      </div>
    </div>
  )
}

export default LoginModal
