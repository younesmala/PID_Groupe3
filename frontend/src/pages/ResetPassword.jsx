import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { confirmPasswordReset } from '../services/authService'
import './AccountPages.css'

const supportedLanguages = ['fr', 'en', 'nl']

function localizedPath(language, path) {
  const normalizedLanguage = supportedLanguages.includes(language) ? language : 'fr'

  if (path === '/') {
    return `/${normalizedLanguage}`
  }

  return `/${normalizedLanguage}${path.startsWith('/') ? path : `/${path}`}`
}

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

function ResetPassword() {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const navigate = useNavigate()
  const { lang: urlLang } = useParams()
  const i18nLang = (i18n.language || 'fr').slice(0, 2).toLowerCase()
  const language = supportedLanguages.includes((urlLang || '').toLowerCase())
    ? urlLang.toLowerCase()
    : (supportedLanguages.includes(i18nLang) ? i18nLang : 'fr')
  const params = new URLSearchParams(location.search)
  const token = params.get('token') || ''
  const uid = params.get('uid') || ''
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isReady = !!token && !!uid
  const passwordsMatch = password && confirmPassword && password === confirmPassword

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (!isReady) {
      setError(t('reset_password.invalid_link'))
      return
    }

    if (password !== confirmPassword) {
      setError(t('signup.err_confirm_mismatch'))
      return
    }

    setLoading(true)

    try {
      await confirmPasswordReset({ uid, token, new_password: password })
      setSuccess(t('reset_password.success'))
      setPassword('')
      setConfirmPassword('')
      window.setTimeout(() => {
        navigate(localizedPath(language, '/login'), { replace: true })
      }, 900)
    } catch (submitError) {
      setError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="account-shell">
      <section className="account-hero account-hero--compact">
        <div className="account-hero__content">
          <p className="account-kicker">{t('reset_password.kicker')}</p>
          <h1>{t('reset_password.title')}</h1>
          <p>{t('reset_password.subtitle')}</p>
        </div>
      </section>

      <section className="account-card-grid">
        <article className="account-card account-card--form">
          <div className="account-card__header">
            <h2>{t('reset_password.title')}</h2>
            <p>{t('reset_password.subtitle')}</p>
          </div>

          {!isReady && <p className="account-feedback account-feedback--error">{t('reset_password.invalid_link')}</p>}
          {error && <p className="account-feedback account-feedback--error">{error}</p>}
          {success && <p className="account-feedback account-feedback--success">{success}</p>}

          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-form-field--full">
              <span>{t('reset_password.password')}</span>
              <div className="account-password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  disabled={!isReady || loading}
                />
                <button
                  type="button"
                  className="account-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? t('login.hide_password') : t('login.show_password')}
                  title={showPassword ? t('login.hide_password') : t('login.show_password')}
                >
                  <PasswordToggleIcon visible={showPassword} />
                </button>
              </div>
            </label>

            <label className="account-form-field--full">
              <span>{t('reset_password.confirm_password')}</span>
              <div className="account-password-field">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  required
                  disabled={!isReady || loading}
                />
                <button
                  type="button"
                  className="account-password-toggle"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={showConfirmPassword ? t('login.hide_password') : t('login.show_password')}
                  title={showConfirmPassword ? t('login.hide_password') : t('login.show_password')}
                >
                  <PasswordToggleIcon visible={showConfirmPassword} />
                </button>
              </div>
            </label>

            <button className="account-submit" type="submit" disabled={loading || !isReady || !passwordsMatch}>
              {loading ? t('reset_password.loading') : t('reset_password.submit')}
            </button>

            <div className="account-inline-actions">
              <Link className="account-secondary-link" to={localizedPath(language, '/login')}>
                {t('reset_password.back_login')}
              </Link>
            </div>
          </form>
        </article>
      </section>
    </main>
  )
}

export default ResetPassword