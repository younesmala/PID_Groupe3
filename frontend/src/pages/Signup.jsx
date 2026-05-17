import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { signup, login, checkUsername, checkEmail } from '../services/authService'
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

function Signup({ onLogin }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [roleRequest, setRoleRequest] = useState('USER')
  const role = roleRequest
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [asyncErrors, setAsyncErrors] = useState({})
  const [asyncChecking, setAsyncChecking] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)

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

      if (role === 'USER') {
        const loginData = await login(form.username, form.password)
        if (onLogin) await onLogin(loginData)
        navigate('/')
      } else {
        setSuccess(t('signup.success_pending', { defaultValue: 'Votre demande a bien été enregistrée. Elle est en attente de validation par un administrateur.' }))
        window.scrollTo({ top: 0, behavior: 'smooth' })
        setForm(initialForm)
        setTouched({})
        setSubmitted(false)
      }
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
              <span className="account-field-error">{getFieldError('email') || '\u00A0'}</span>
            </label>

            <label>
              <span>{t('signup.first_name')}</span>
              <input type="text" name="first_name" value={form.first_name} onChange={updateField} onBlur={handleBlur} />
              <span className="account-field-error">&nbsp;</span>
            </label>

            <label>
              <span>{t('signup.last_name')}</span>
              <input type="text" name="last_name" value={form.last_name} onChange={updateField} onBlur={handleBlur} />
              <span className="account-field-error">&nbsp;</span>
            </label>

            <label>
              <span>{t('signup.username')}</span>
              <input type="text" name="username" value={form.username} onChange={updateField} onBlur={handleBlur} required />
              {asyncChecking.username && <span className="account-field-checking">{t('signup.checking')}</span>}
              <span className="account-field-error">{getFieldError('username') || '\u00A0'}</span>
            </label>

            <label className="account-form-field--full">
              <span>{t('signup.password')}</span>
              <div className="account-password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={updateField}
                  onBlur={handleBlur}
                  required
                />
                <button
                  type="button"
                  className="account-password-toggle"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                >
                  <PasswordToggleIcon visible={showPassword} />
                </button>
              </div>
              {getFieldError('password') && <span className="account-field-error">{getFieldError('password')}</span>}
            </label>

            <label className="account-form-field--full">
              <span>{t('signup.password_confirm')}</span>
              <div className="account-password-field">
                <input
                  type={showPasswordConfirm ? 'text' : 'password'}
                  name="passwordConfirm"
                  value={form.passwordConfirm}
                  onChange={updateField}
                  onBlur={handleBlur}
                  required
                />
                <button
                  type="button"
                  className="account-password-toggle"
                  onClick={() => setShowPasswordConfirm((current) => !current)}
                  aria-label={showPasswordConfirm ? 'Masquer la confirmation du mot de passe' : 'Afficher la confirmation du mot de passe'}
                  title={showPasswordConfirm ? 'Masquer' : 'Afficher'}
                >
                  <PasswordToggleIcon visible={showPasswordConfirm} />
                </button>
              </div>
              {getFieldError('passwordConfirm') && <span className="account-field-error">{getFieldError('passwordConfirm')}</span>}
            </label>

            <label className="account-form-field--full">
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

            <div className="account-request-options">
              <label className="account-request-option">
                <input
                  type="radio"
                  name="roleRequest"
                  value="PRODUCER"
                  checked={roleRequest === 'PRODUCER'}
                  onChange={() => setRoleRequest('PRODUCER')}
                />
                <span>{t('signup.request_producer')}</span>
              </label>

              <label className="account-request-option">
                <input
                  type="radio"
                  name="roleRequest"
                  value="PRESS_CRITIC"
                  checked={roleRequest === 'PRESS_CRITIC'}
                  onChange={() => setRoleRequest('PRESS_CRITIC')}
                />
                <span>{t('signup.request_press_critic')}</span>
              </label>
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
