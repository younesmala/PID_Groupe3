import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getCurrentUser, updateProfile } from '../services/userService'
import { getMyReservations } from '../services/reservationService'
import './AccountPages.css'

function Avatar({ firstName, lastName, username }) {
  const initials = firstName && lastName
    ? `${firstName[0]}${lastName[0]}`.toUpperCase()
    : firstName
      ? firstName[0].toUpperCase()
      : (username || '?')[0].toUpperCase()
  return <div className="account-avatar">{initials}</div>
}

function readValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function formatDate(value, locale) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat(locale || 'fr-BE', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function formatStatus(value) {
  if (!value) return ''
  return String(value)
}

function extractReservationTitle(reservation) {
  return readValue(
    reservation.show_title,
    reservation.show?.title,
    reservation.representation?.show?.title,
    reservation.representation_title,
    reservation.title,
    `Reservation #${readValue(reservation.id, reservation.pk, '...')}`,
  )
}

function extractReservationDate(reservation) {
  return readValue(
    reservation.representation_date,
    reservation.booking_date,
    reservation.date,
    reservation.created_at,
    reservation.created,
    reservation.representation?.when,
  )
}

function extractReservationLocation(reservation) {
  return readValue(
    reservation.location_name,
    reservation.location?.name,
    reservation.location?.slug,
    reservation.representation?.location?.name,
    reservation.representation?.location?.slug,
    reservation.venue,
    reservation.place,
  )
}

function extractReservationStatus(reservation) {
  return readValue(reservation.status, reservation.payment_status, reservation.state)
}

function extractReservationQuantity(reservation) {
  return readValue(
    reservation.quantity,
    reservation.seats,
    reservation.tickets_count,
    reservation.lines?.reduce((total, line) => total + (line.quantity || 0), 0),
    reservation.items?.reduce((total, item) => total + (item.quantity || 0), 0),
    1,
  )
}

function isConfirmedOrPaid(status) {
  if (!status) return false
  const normalized = String(status).toLowerCase()
  return (
    normalized.includes('confirm') ||
    normalized.includes('paid') ||
    normalized.includes('paye') ||
    normalized.includes('valide') ||
    normalized.includes('success')
  )
}

function buildTicketReservations(reservations) {
  const reservationsWithStatus = reservations.filter((r) => extractReservationStatus(r))
  if (reservationsWithStatus.length > 0) {
    return reservationsWithStatus.filter((r) => isConfirmedOrPaid(extractReservationStatus(r)))
  }
  return reservations
}

const languageOptions = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'nl', label: 'Nederlands' },
]

function Profile({ isLoggedIn, username }) {
  const { t, i18n } = useTranslation()
  const locale = i18n.language === 'nl' ? 'nl-BE' : i18n.language === 'en' ? 'en-GB' : 'fr-BE'

  const [profile, setProfile] = useState(() => (username ? { username } : null))
  const [reservations, setReservations] = useState([])
  const [profileError, setProfileError] = useState('')
  const [reservationsError, setReservationsError] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingReservations, setLoadingReservations] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [editForm, setEditForm] = useState({})
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')

  useEffect(() => {
    let active = true
    async function loadProfile() {
      setLoadingProfile(true)
      setProfileError('')
      try {
        const data = await getCurrentUser()
        if (active) setProfile(data)
      } catch (error) {
        if (active) {
          setProfile(username ? { username } : null)
          setProfileError(error.message)
        }
      } finally {
        if (active) setLoadingProfile(false)
      }
    }
    if (isLoggedIn) loadProfile()
    else setLoadingProfile(false)
    return () => { active = false }
  }, [isLoggedIn])

  useEffect(() => {
    let active = true
    async function loadReservations() {
      setLoadingReservations(true)
      setReservationsError('')
      try {
        const data = await getMyReservations()
        if (active) setReservations(data)
      } catch (error) {
        if (active) {
          setReservations([])
          setReservationsError(error.message)
        }
      } finally {
        if (active) setLoadingReservations(false)
      }
    }
    if (isLoggedIn) loadReservations()
    else setLoadingReservations(false)
    return () => { active = false }
  }, [isLoggedIn])

  const ticketReservations = useMemo(() => buildTicketReservations(reservations), [reservations])

  function openEdit() {
    setEditForm({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      email: profile?.email || '',
      language: profile?.language || '',
    })
    setEditError('')
    setEditSuccess('')
    setEditMode(true)
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    setEditLoading(true)
    setEditError('')
    setEditSuccess('')
    try {
      const updated = await updateProfile(editForm)
      setProfile((prev) => ({ ...prev, ...updated }))
      setEditSuccess(t('profile.success'))
      setEditMode(false)
    } catch (err) {
      setEditError(err.message)
    } finally {
      setEditLoading(false)
    }
  }

  if (!isLoggedIn) {
    return (
      <main className="account-shell">
        <section className="account-hero account-hero--compact">
          <div className="account-hero__content">
            <p className="account-kicker">{t('profile.kicker')}</p>
            <h1>{t('profile.not_logged_title')}</h1>
            <p>{t('profile.not_logged_subtitle')}</p>
            <div className="account-inline-actions">
              <Link className="account-secondary-link" to="/signup">{t('profile.create_account')}</Link>
              <Link className="account-secondary-link" to="/">{t('profile.back_home')}</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="account-shell">
      <section className="account-hero">
        <div className="account-hero__content">
          <Avatar firstName={profile?.first_name} lastName={profile?.last_name} username={profile?.username || username} />
          <p className="account-kicker">{t('profile.kicker')}</p>
          <h1>
            {loadingProfile
              ? t('profile.greeting_loading')
              : t('profile.greeting', { name: readValue(profile?.first_name, profile?.username, username, 'utilisateur') })}
          </h1>
          <p>{t('profile.subtitle')}</p>
        </div>

        <div className="account-hero__panel">
          <span>{t('profile.stats_title')}</span>
          <div className="account-stat">
            <strong>{loadingReservations ? '—' : reservations.length}</strong>
            <p>{t('profile.reservations_count')}</p>
          </div>
          <div className="account-stat">
            <strong>{loadingReservations ? '—' : ticketReservations.length}</strong>
            <p>{t('profile.tickets_count')}</p>
          </div>
          <Link className="account-secondary-link account-secondary-link--panel" to="/tickets">
            {t('profile.see_tickets')} →
          </Link>
        </div>
      </section>

      <section className="account-card-grid account-card-grid--profile">
        <article className="account-card">
          <div className="account-card__header">
            <h2>{t('profile.user_card_title')}</h2>
            <p>{t('profile.user_card_subtitle')}</p>
          </div>

          {profileError && <p className="account-feedback account-feedback--error">{profileError}</p>}
          {editSuccess && <p className="account-feedback account-feedback--success">{editSuccess}</p>}

          {!editMode ? (
            <>
              <dl className="profile-definition-list">
                <div>
                  <dt>{t('profile.login_label')}</dt>
                  <dd>{readValue(profile?.username, username, t('profile.not_available'))}</dd>
                </div>
                <div>
                  <dt>{t('profile.email_label')}</dt>
                  <dd>{readValue(profile?.email, t('profile.not_available'))}</dd>
                </div>
                <div>
                  <dt>{t('profile.firstname_label')}</dt>
                  <dd>{readValue(profile?.first_name, profile?.firstname, t('profile.not_available'))}</dd>
                </div>
                <div>
                  <dt>{t('profile.lastname_label')}</dt>
                  <dd>{readValue(profile?.last_name, profile?.lastname, t('profile.not_available'))}</dd>
                </div>
                <div>
                  <dt>{t('profile.language_label')}</dt>
                  <dd>{
                    profile?.language === 'fr' ? 'Français' :
                    profile?.language === 'nl' ? 'Néerlandais' :
                    profile?.language === 'en' ? 'English' :
                    t('profile.not_available')
                  }</dd>
                </div>
              </dl>
              <button className="account-submit" style={{ marginTop: '1rem' }} onClick={openEdit}>
                {t('profile.edit_btn')}
              </button>
            </>
          ) : (
            <form className="account-form" onSubmit={handleEditSubmit}>
              {editError && <p className="account-feedback account-feedback--error">{editError}</p>}
              <label>
                <span>{t('profile.firstname_label')}</span>
                <input type="text" value={editForm.first_name} onChange={(e) => setEditForm((f) => ({ ...f, first_name: e.target.value }))} />
              </label>
              <label>
                <span>{t('profile.lastname_label')}</span>
                <input type="text" value={editForm.last_name} onChange={(e) => setEditForm((f) => ({ ...f, last_name: e.target.value }))} />
              </label>
              <label>
                <span>{t('profile.email_label')}</span>
                <input type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} required />
              </label>
              <label>
                <span>{t('profile.language_label')}</span>
                <select value={editForm.language} onChange={(e) => setEditForm((f) => ({ ...f, language: e.target.value }))}>
                  <option value="">{t('signup.choose_language')}</option>
                  {languageOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </label>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <button className="account-submit" type="submit" disabled={editLoading}>
                  {editLoading ? t('profile.saving') : t('profile.save_btn')}
                </button>
                <button className="account-submit" type="button" onClick={() => setEditMode(false)} style={{ background: '#555' }}>
                  {t('profile.cancel_btn')}
                </button>
              </div>
            </form>
          )}
        </article>

        <article className="account-card">
          <div className="account-card__header">
            <h2>{t('profile.reservations_title')}</h2>
            <p>{t('profile.reservations_subtitle')}</p>
          </div>

          {reservationsError && <p className="account-feedback account-feedback--error">{reservationsError}</p>}

          {loadingReservations ? (
            <p className="account-empty-state">{t('profile.reservations_loading')}</p>
          ) : reservations.length === 0 ? (
            <p className="account-empty-state">{t('profile.reservations_empty')}</p>
          ) : (
            <div className="account-list">
              {reservations.map((reservation, index) => (
                <article key={readValue(reservation.id, reservation.pk, index)} className="account-list__item">
                  <div>
                    <h3>{extractReservationTitle(reservation)}</h3>
                    <p>{t('profile.date_label')}: {formatDate(extractReservationDate(reservation), locale)}</p>
                    <p>{t('profile.location_label')}: {readValue(extractReservationLocation(reservation), t('profile.not_available'))}</p>
                  </div>
                  <div className="account-list__meta">
                    <span>{formatStatus(readValue(extractReservationStatus(reservation), ''))}</span>
                    <strong>{extractReservationQuantity(reservation)} ticket(s)</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="account-card account-card--full">
          <div className="account-card__header">
            <h2>{t('profile.tickets_title')}</h2>
            <p>{t('profile.tickets_subtitle')}</p>
          </div>

          {loadingReservations ? (
            <p className="account-empty-state">{t('profile.tickets_loading')}</p>
          ) : ticketReservations.length === 0 ? (
            <p className="account-empty-state">{t('profile.tickets_empty')}</p>
          ) : (
            <div className="ticket-grid">
              {ticketReservations.map((reservation, index) => (
                <article key={readValue(reservation.id, reservation.pk, index)} className="ticket-card">
                  <span className="ticket-card__eyebrow">{t('tickets.digital')}</span>
                  <h3>{extractReservationTitle(reservation)}</h3>
                  <p>{formatDate(extractReservationDate(reservation), locale)}</p>
                  <div className="ticket-card__footer">
                    <strong>{extractReservationQuantity(reservation)} ticket(s)</strong>
                    <span>{formatStatus(readValue(extractReservationStatus(reservation), ''))}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}

export default Profile
