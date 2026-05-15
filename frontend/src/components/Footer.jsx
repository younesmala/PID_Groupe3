import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Footer.css'

function NewsletterForm() {
  const { t } = useTranslation()
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setStatus(null)
    try {
      const csrfToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('csrftoken='))
        ?.split('=')[1]
      const res = await fetch('/api/newsletter/subscribe/', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken || '',
        },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('success')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="footer-newsletter">
      <h3>{t('footer.newsletter')}</h3>
      <p>{t('footer.newsletter_desc')}</p>
      {status === 'success' && (
        <p className="footer-newsletter__success">{t('footer.success')}</p>
      )}
      {status === 'error' && (
        <p className="footer-newsletter__error">{t('footer.error')}</p>
      )}
      {status !== 'success' && (
        <form className="footer-newsletter__form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder={t('footer.email_placeholder')}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? '...' : t('footer.subscribe')}
          </button>
        </form>
      )}
    </div>
  )
}

function Footer() {
  const location = useLocation()
  const { t, i18n } = useTranslation()
  const urlFirstSegment = (location.pathname.split('/').filter(Boolean)[0] || '').toLowerCase()
  const isSupportedLanguage = ['fr', 'nl', 'en'].includes(urlFirstSegment)
  const currentLanguage = isSupportedLanguage
    ? urlFirstSegment
    : (i18n.language || 'fr').slice(0, 2).toLowerCase()

  function localizedPath(path) {
    if (path === '/') {
      return `/${currentLanguage}`
    }

    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `/${currentLanguage}${normalizedPath}`
  }

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">Brussels<span>Show</span></span>
          <p>{t('footer.tagline')}</p>
        </div>

        <div className="footer-links">
          <h3>{t('footer.navigation')}</h3>
          <ul>
            <li><Link to={localizedPath('/')}>{t('accueil')}</Link></li>
            <li><Link to={localizedPath('/shows')}>{t('spectacles')}</Link></li>
            <li><Link to={localizedPath('/cart')}>{t('panier')}</Link></li>
            <li><Link to={localizedPath('/profile')}>{t('footer.profile')}</Link></li>
          </ul>
        </div>

        <NewsletterForm />
      </div>

      <div className="footer-bottom">
        <p>© 2026 BrusselsShow — Groupe 3 ICC Bruxelles</p>
      </div>
    </footer>
  )
}

export default Footer
