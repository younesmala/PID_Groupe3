import { useState } from 'react'
import { Link } from 'react-router-dom'
import './Footer.css'

function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setStatus(null)
    try {
      const res = await fetch('/api/newsletter/subscribe/', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
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
      <h3>Newsletter</h3>
      <p>Recevez nos actualites et evenements en avant-premiere.</p>
      {status === 'success' && (
        <p className="footer-newsletter__success">Merci ! Vous etes inscrit.</p>
      )}
      {status === 'error' && (
        <p className="footer-newsletter__error">Une erreur est survenue. Reessayez plus tard.</p>
      )}
      {status !== 'success' && (
        <form className="footer-newsletter__form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Votre adresse email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? '...' : "S'inscrire"}
          </button>
        </form>
      )}
    </div>
  )
}

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <span className="footer-logo">Brussels<span>Show</span></span>
          <p>La reference des spectacles a Bruxelles.</p>
        </div>

        <div className="footer-links">
          <h3>Navigation</h3>
          <ul>
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/shows">Spectacles</Link></li>
            <li><Link to="/cart">Panier</Link></li>
            <li><Link to="/profile">Mon profil</Link></li>
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
