import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { requestPasswordReset } from '../services/authService'
import './AccountPages.css'

const supportedLanguages = ['fr', 'en', 'nl']

function localizedPath(language, path) {
  const normalizedLanguage = supportedLanguages.includes(language) ? language : 'fr'

  if (path === '/') {
    return `/${normalizedLanguage}`
  }

  return `/${normalizedLanguage}${path.startsWith('/') ? path : `/${path}`}`
}

function ForgotPassword() {
  const { t, i18n } = useTranslation()
  const { lang: urlLang } = useParams()
  const i18nLang = (i18n.language || 'fr').slice(0, 2).toLowerCase()
  const language = supportedLanguages.includes((urlLang || '').toLowerCase())
    ? urlLang.toLowerCase()
    : (supportedLanguages.includes(i18nLang) ? i18nLang : 'fr')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await requestPasswordReset(email, language)
      setSuccess(t('forgot_password.success'))
      setEmail('')
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
          <p className="account-kicker">{t('forgot_password.kicker')}</p>
          <h1>{t('forgot_password.title')}</h1>
          <p>{t('forgot_password.subtitle')}</p>
        </div>
      </section>

      <section className="account-card-grid">
        <article className="account-card account-card--form">
          <div className="account-card__header">
            <h2>{t('forgot_password.title')}</h2>
            <p>{t('forgot_password.subtitle')}</p>
          </div>

          {error && <p className="account-feedback account-feedback--error">{error}</p>}
          {success && <p className="account-feedback account-feedback--success">{success}</p>}

          <form className="account-form" onSubmit={handleSubmit}>
            <label className="account-form-field--full">
              <span>{t('forgot_password.email')}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoFocus
              />
            </label>

            <button className="account-submit" type="submit" disabled={loading}>
              {loading ? t('forgot_password.loading') : t('forgot_password.submit')}
            </button>

            <div className="account-inline-actions">
              <Link className="account-secondary-link" to={localizedPath(language, '/login')}>
                {t('forgot_password.back_login')}
              </Link>
            </div>
          </form>
        </article>
      </section>
    </main>
  )
}

export default ForgotPassword