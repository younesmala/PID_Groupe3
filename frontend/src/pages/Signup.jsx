import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { signup } from '../services/authService'
import './AccountPages.css'

const initialForm = {
  email: '',
  first_name: '',
  last_name: '',
  username: '',
  password: '',
  passwordConfirm: '',
  language: '',
}

const languageOptions = [
  { value: 'fr', label: 'Francais' },
  { value: 'en', label: 'Anglais' },
  { value: 'nl', label: 'Neerlandais' },
]

function validateForm(form) {
  const errors = {}

  if (!form.username.trim()) {
    errors.username = 'Le login est obligatoire.'
  }

  if (!form.email.trim()) {
    errors.email = 'L\'email est obligatoire.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Veuillez saisir une adresse email valide.'
  }

  if (!form.password) {
    errors.password = 'Le mot de passe est obligatoire.'
  } else {
    if (form.password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caracteres.'
    } else if (!/[A-Z]/.test(form.password)) {
      errors.password = 'Le mot de passe doit contenir au moins une majuscule.'
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      errors.password = 'Le mot de passe doit contenir au moins un caractere special.'
    }
  }

  if (!form.passwordConfirm) {
    errors.passwordConfirm = 'La confirmation du mot de passe est obligatoire.'
  } else if (form.passwordConfirm !== form.password) {
    errors.passwordConfirm = 'La confirmation doit etre identique au mot de passe.'
  }

  if (!form.language) {
    errors.language = 'La langue est obligatoire.'
  }

  return errors
}

function Signup() {
  const [form, setForm] = useState(initialForm)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const errors = useMemo(() => validateForm(form), [form])
  const isFormValid = Object.keys(errors).length === 0

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({
      ...current,
      [name]: value,
    }))

    setTouched((current) => ({
      ...current,
      [name]: true,
    }))
  }

  function handleBlur(event) {
    const { name } = event.target
    setTouched((current) => ({
      ...current,
      [name]: true,
    }))
  }

  function getFieldError(name) {
    if (!submitted && !touched[name]) {
      return ''
    }

    return errors[name] || ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    setServerError('')
    setSuccess('')

    if (!isFormValid) {
      return
    }

    setLoading(true)

    try {
      await signup({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        password: form.password,
        password_confirm: form.passwordConfirm,
        language: form.language,
      })
      setSuccess('Inscription terminee. Vous pouvez maintenant vous connecter des que la page de connexion est disponible.')
      setForm(initialForm)
      setTouched({})
      setSubmitted(false)
    } catch (submitError) {
      setServerError(submitError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="account-shell">
      <section className="account-hero">
        <div className="account-hero__content">
          <p className="account-kicker">Compte client</p>
          <h1>Creer votre acces Brussels Show.</h1>
          <p>
            Inscrivez-vous pour retrouver votre profil, vos reservations et vos tickets au meme endroit.
          </p>
        </div>
        <div className="account-hero__panel">
          <span>Frontend React/Vite</span>
          <strong>POST /api/auth/signup/</strong>
          <p>
            Cette page envoie les donnees au backend existant et affiche proprement les reponses d&apos;erreur ou d&apos;indisponibilite.
          </p>
        </div>
      </section>

      <section className="account-card-grid">
        <article className="account-card account-card--form">
          <div className="account-card__header">
            <h2>Inscription</h2>
            <p>Creation de compte avec validation immediate cote client.</p>
          </div>

          {serverError && <p className="account-feedback account-feedback--error">{serverError}</p>}
          {success && <p className="account-feedback account-feedback--success">{success}</p>}

          <form className="account-form" onSubmit={handleSubmit}>
            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={updateField}
                onBlur={handleBlur}
                required
              />
              {getFieldError('email') && <span className="account-field-error">{getFieldError('email')}</span>}
            </label>

            <label>
              <span>Prenom</span>
              <input
                type="text"
                name="first_name"
                value={form.first_name}
                onChange={updateField}
                onBlur={handleBlur}
              />
            </label>

            <label>
              <span>Nom</span>
              <input
                type="text"
                name="last_name"
                value={form.last_name}
                onChange={updateField}
                onBlur={handleBlur}
              />
            </label>

            <label>
              <span>Login</span>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={updateField}
                onBlur={handleBlur}
                required
              />
              {getFieldError('username') && <span className="account-field-error">{getFieldError('username')}</span>}
            </label>

            <label>
              <span>Mot de passe</span>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={updateField}
                onBlur={handleBlur}
                required
              />
              {getFieldError('password') && <span className="account-field-error">{getFieldError('password')}</span>}
            </label>

            <label>
              <span>Confirmation du mot de passe</span>
              <input
                type="password"
                name="passwordConfirm"
                value={form.passwordConfirm}
                onChange={updateField}
                onBlur={handleBlur}
                required
              />
              {getFieldError('passwordConfirm') && <span className="account-field-error">{getFieldError('passwordConfirm')}</span>}
            </label>

            <label>
              <span>Langue</span>
              <select
                name="language"
                value={form.language}
                onChange={updateField}
                onBlur={handleBlur}
                required
              >
                <option value="">Choisir une langue</option>
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {getFieldError('language') && <span className="account-field-error">{getFieldError('language')}</span>}
            </label>

            <div className="account-password-hint">
              Le mot de passe doit contenir au minimum 6 caracteres, une majuscule et un caractere special.
            </div>

            <button className="account-submit" type="submit" disabled={loading || !isFormValid}>
              {loading ? 'Envoi en cours...' : 'S\'inscrire'}
            </button>
          </form>
        </article>

        <aside className="account-card account-card--info">
          <div className="account-card__header">
            <h2>Suite du parcours</h2>
            <p>Une fois connecte, l&apos;espace profil centralise les informations utilisateur.</p>
          </div>

          <ul className="account-feature-list">
            <li>Profil utilisateur branche sur GET /api/users/me/</li>
            <li>Section Mes reservations branchee sur GET /api/my/reservations/</li>
            <li>Section Mes tickets derivee des reservations chargees</li>
          </ul>

          <Link className="account-secondary-link" to="/">
            Retour a l&apos;accueil
          </Link>
        </aside>
      </section>
    </main>
  )
}

export default Signup