import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { signup, checkUsername, checkEmail } from '../services/authService'
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
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'nl', label: 'Nederlands' },
]

function Signup() {
  const { t } = useTranslation()
  const [form, setForm] = useState(initialForm)
  const [isProducer, setIsProducer] = useState(false)
  const role = isProducer ? 'PRODUCER' : 'USER'
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [asyncErrors, setAsyncErrors] = useState({})
  const [asyncChecking, setAsyncChecking] = useState({})

  function validateForm(form) {
    const errors = {}
    if (!form.username.trim()) errors.username = t('signup.err_username_required')
    if (!form.email.trim()) {
      errors.email = t('signup.err_email_required')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = t('signup.err_email_invalid')
    }
    if (!form.password) {
      errors.password = t('signup.err_password_required')
    } else if (form.password.length < 6) {
      errors.password = t('signup.err_password_length')
    } else if (!/[A-Z]/.test(form.password)) {
      errors.password = t('signup.err_password_upper')
    } else if (!/[^A-Za-z0-9]/.test(form.password)) {
      errors.password = t('signup.err_password_special')
    }
    if (!form.passwordConfirm) {
      errors.passwordConfirm = t('signup.err_confirm_required')
    } else if (form.passwordConfirm !== form.password) {
      errors.passwordConfirm = t('signup.err_confirm_mismatch')
    }
    if (!form.language) errors.language = t('signup.err_language_required')
    return errors
  }

  const errors = useMemo(() => validateForm(form), [form, t])
  const isFormValid = Object.keys(errors).length === 0 && Object.keys(asyncErrors).length === 0

  function updateField(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
    setTouched((current) => ({ ...current, [name]: true }))
  }

  async function handleBlur(event) {
    const { name, value } = event.target
    setTouched((current) => ({ ...current, [name]: true }))

    if (name === 'username' && value.trim() && !errors.username) {
      setAsyncChecking((c) => ({ ...c, username: true }))
      setAsyncErrors((c) => { const n = { ...c }; delete n.username; return n })
      try {
        const data = await checkUsername(value.trim())
        if (data.available === false) {
          setAsyncErrors((c) => ({ ...c, username: t('signup.err_username_taken') }))
        }
      } catch (_) { }
      setAsyncChecking((c) => ({ ...c, username: false }))
    }

    if (name === 'email' && value.trim() && !errors.email) {
      setAsyncChecking((c) => ({ ...c, email: true }))
      setAsyncErrors((c) => { const n = { ...c }; delete n.email; return n })
      try {
        const data = await checkEmail(value.trim())
        if (data.available === false) {
          setAsyncErrors((c) => ({ ...c, email: t('signup.err_email_taken') }))
        }
      } catch (_) { }
      setAsyncChecking((c) => ({ ...c, email: false }))
    }
  }

  function getFieldError(name) {
    if (!submitted && !touched[name]) return ''
    return errors[name] || asyncErrors[name] || ''
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
    setServerError('')
    setSuccess('')
    if (!isFormValid) return
    setLoading(true)
    try {
      await signup({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        password: form.password,
        confirm_password: form.passwordConfirm,
        language: form.language,
        role,
      })
      setSuccess(t('signup.success'))
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
      <section className="account-hero account-hero--compact">
        <div className="account-hero__content">
          <p className="account-kicker">{t('signup.kicker')}</p>
          <h1>{t('signup.title')}</h1>
          <p>{t('signup.subtitle')}</p>
        </div>
      </section>

      <section className="account-card-grid">
        <article className="account-card account-card--form">
          <div className="account-card__header">
            <h2>{t('signup.card_title')}</h2>
            <p>{t('signup.card_subtitle')}</p>
          </div>

          {serverError && <p className="account-feedback account-feedback--error">{serverError}</p>}
          {success && <p className="account-feedback account-feedback--success">{success}</p>}

          <form className="account-form" onSubmit={handleSubmit}>
            <label>
              <span>{t('signup.email')}</span>
              <input type="email" name="email" value={form.email} onChange={updateField} onBlur={handleBlur} required />
              {asyncChecking.email && <span className="account-field-checking">{t('signup.checking')}</span>}
              {getFieldError('email') && <span className="account-field-error">{getFieldError('email')}</span>}
            </label>

            <label>
              <span>{t('signup.first_name')}</span>
              <input type="text" name="first_name" value={form.first_name} onChange={updateField} onBlur={handleBlur} />
            </label>

            <label>
              <span>{t('signup.last_name')}</span>
              <input type="text" name="last_name" value={form.last_name} onChange={updateField} onBlur={handleBlur} />
            </label>

            <label>
              <span>{t('signup.username')}</span>
              <input type="text" name="username" value={form.username} onChange={updateField} onBlur={handleBlur} required />
              {asyncChecking.username && <span className="account-field-checking">{t('signup.checking')}</span>}
              {getFieldError('username') && <span className="account-field-error">{getFieldError('username')}</span>}
            </label>

            <label>
              <span>{t('signup.password')}</span>
              <input type="password" name="password" value={form.password} onChange={updateField} onBlur={handleBlur} required />
              {getFieldError('password') && <span className="account-field-error">{getFieldError('password')}</span>}
            </label>

            <label>
              <span>{t('signup.password_confirm')}</span>
              <input type="password" name="passwordConfirm" value={form.passwordConfirm} onChange={updateField} onBlur={handleBlur} required />
              {getFieldError('passwordConfirm') && <span className="account-field-error">{getFieldError('passwordConfirm')}</span>}
            </label>

            <label>
              <span>{t('signup.language')}</span>
              <select name="language" value={form.language} onChange={updateField} onBlur={handleBlur} required>
                <option value="">{t('signup.choose_language')}</option>
                {languageOptions.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              {getFieldError('language') && <span className="account-field-error">{getFieldError('language')}</span>}
            </label>

            <div className="account-password-hint">{t('signup.password_hint')}</div>

            <div className={`producer-card${isProducer ? ' producer-card--active' : ''}`} onClick={() => setIsProducer(!isProducer)}>
              <span className="producer-card-icon">🎭</span>
              <div>
                <strong>S&apos;inscrire en tant que Producteur</strong>
                <p>Gérez vos spectacles, séances et statistiques</p>
              </div>
              <span className="producer-card-check">{isProducer ? '✓' : ''}</span>
            </div>

            <button className="account-submit" type="submit" disabled={loading || !isFormValid}>
              {loading ? t('signup.loading') : t('signup.submit')}
            </button>
          </form>
        </article>

        <aside className="account-card">
          <div className="account-card__header">
            <h2>{t('signup.card_title')}</h2>
          </div>
          <Link className="account-secondary-link" to="/">
            {t('signup.back_home')}
          </Link>
        </aside>
      </section>
    </main>
  )
}

export default Signup
