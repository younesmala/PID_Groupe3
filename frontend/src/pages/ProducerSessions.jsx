import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { API_ROOT } from '../services/api'
import './ProducerSessions.css'

const BASE = API_ROOT

async function apiFetch(path, options = {}) {
  const { headers: optHeaders = {}, ...rest } = options
  const response = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      Accept: 'application/json',
      ...optHeaders,
    },
  })
  return response
}

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

function toLocalDatetime(isoString) {
  if (!isoString) return { date: '', time: '' }
  const date = new Date(isoString)
  return {
    date: date.toLocaleDateString('fr-BE'),
    time: date.toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' }),
  }
}

function getWorkflowStatus(show) {
  if (show?.publication_status === 'rejected') return 'rejected'
  if (show?.publication_status === 'approved' && show?.bookable) return 'published'
  if (show?.publication_status === 'approved') return 'validated'
  return 'pending'
}

export default function ProducerSessions() {
  const { t } = useTranslation()
  const { slug } = useParams()
  const navigate = useNavigate()

  const [show, setShow] = useState(null)
  const [sessions, setSessions] = useState([])
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [formError, setFormError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [form, setForm] = useState({
    location_id: '',
    date: '',
    time: '',
    capacity: 60,
    price: '',
  })

  useEffect(() => {
    async function loadPage() {
      try {
        const [showResponse, sessionsResponse, locationsResponse] = await Promise.all([
          apiFetch(`/producer/shows/${slug}/`),
          apiFetch(`/producer/shows/${slug}/sessions/`),
          apiFetch('/locations/'),
        ])

        if (!showResponse.ok) {
          const body = await showResponse.json().catch(() => ({}))
          throw new Error(body.detail || 'Impossible de charger le spectacle.')
        }

        if (!sessionsResponse.ok) {
          const body = await sessionsResponse.json().catch(() => ({}))
          throw new Error(body.detail || 'Impossible de charger les seances.')
        }

        if (!locationsResponse.ok) {
          const body = await locationsResponse.json().catch(() => ({}))
          throw new Error(body.detail || 'Impossible de charger les lieux.')
        }

        const showData = await showResponse.json()
        const sessionsData = await sessionsResponse.json()
        const locationsData = await locationsResponse.json()
        const locationList = Array.isArray(locationsData) ? locationsData : (locationsData.results ?? [])

        setShow(showData)
        setSessions(Array.isArray(sessionsData) ? sessionsData : (sessionsData.results ?? []))
        setLocations(locationList)
        setForm((current) => ({
          ...current,
          location_id: current.location_id || (locationList[0]?.id ? String(locationList[0].id) : ''),
          price: showData.prices?.[0]?.amount ? String(showData.prices[0].amount) : '',
        }))
      } catch (loadError) {
        setError(loadError.message)
      } finally {
        setLoading(false)
      }
    }

    loadPage()
  }, [slug])

  function handleFormChange(event) {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setFormError(null)

    if (!show) return

    if (getWorkflowStatus(show) !== 'validated' && getWorkflowStatus(show) !== 'published') {
      setFormError('Le spectacle doit etre valide par l admin avant ajout de seances.')
      return
    }

    if (!form.date || !form.time) {
      setFormError('La date et l heure sont obligatoires.')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`${BASE}/producer/shows/${slug}/sessions/`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken') || localStorage.getItem('csrf_token') || '',
        },
        body: JSON.stringify({
          location_id: form.location_id ? Number(form.location_id) : null,
          date: form.date,
          time: form.time,
          capacity: Number(form.capacity) || 0,
          price: form.price,
        }),
      })

      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.detail || `Erreur ${response.status}`)
      }

      setSessions((current) => [...current, body].sort((a, b) => new Date(a.schedule) - new Date(b.schedule)))
      setForm((current) => ({
        ...current,
        date: '',
        time: '',
        capacity: 60,
      }))
    } catch (submitError) {
      setFormError(submitError.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm) return

    setDeleting(true)
    try {
      const response = await apiFetch(`/representations/${confirm.id}/`, { method: 'DELETE' })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.detail || `Erreur ${response.status}`)
      }
      setSessions((current) => current.filter((item) => item.id !== confirm.id))
      setConfirm(null)
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setDeleting(false)
    }
  }

  const workflowStatus = getWorkflowStatus(show)
  const canManageSessions = workflowStatus === 'validated' || workflowStatus === 'published'

  return (
    <div className="pss-page">
      <button className="pss-breadcrumb" onClick={() => navigate('/producer/shows')}>
        {t('producer.back_shows', { defaultValue: 'Mes spectacles' })}
      </button>

      <header className="pss-header">
        <div>
          <h1 className="pss-title">{t('producer.sessions_title', { defaultValue: 'Seances du spectacle' })}</h1>
          {show && <p className="pss-subtitle">{show.title}</p>}
        </div>
      </header>

      {loading && <p className="pss-state">{t('producer.loading', { defaultValue: 'Chargement...' })}</p>}
      {error && <p className="pss-state pss-state--error">{error}</p>}

      {!loading && !error && (
        <div className="pss-layout">
          <section className="pss-list-section">
            <h2 className="pss-section-title">
              {sessions.length} {t('producer.sessions_count_label', { defaultValue: 'seance(s)' })}
            </h2>

            {show && !canManageSessions && (
              <p className="pss-state">
                {workflowStatus === 'pending'
                  ? 'Le spectacle est en attente de validation admin. Les seances seront disponibles ensuite.'
                  : 'Ce spectacle ne peut pas recevoir de seances dans son etat actuel.'}
              </p>
            )}

            {sessions.length === 0 ? (
              <p className="pss-state">{t('producer.no_sessions', { defaultValue: 'Aucune seance pour le moment.' })}</p>
            ) : (
              <ul className="pss-list">
                {sessions
                  .slice()
                  .sort((a, b) => new Date(a.schedule) - new Date(b.schedule))
                  .map((session) => {
                    const { date, time } = toLocalDatetime(session.schedule)
                    const location = locations.find((item) => item.id === session.location)
                    return (
                      <li key={session.id} className="pss-item">
                        <div className="pss-item-info">
                          <span className="pss-item-date">{date} a {time}</span>
                          <span className="pss-item-loc">{location?.designation || 'Lieu a confirmer'}</span>
                          <span className="pss-item-seats">{session.available_seats} places</span>
                        </div>
                        <button className="pss-btn pss-btn--sm pss-btn--danger" onClick={() => setConfirm(session)}>
                          {t('producer.delete_btn', { defaultValue: 'Supprimer' })}
                        </button>
                      </li>
                    )
                  })}
              </ul>
            )}
          </section>

          <section className="pss-form-section">
            <h2 className="pss-section-title">{t('producer.add_session', { defaultValue: 'Ajouter une seance' })}</h2>

            {!canManageSessions && (
              <p className="pss-state">
                Le bouton Publier restera bloque tant qu il n y a pas au moins une seance valide.
              </p>
            )}

            <form className="pss-form" onSubmit={handleSubmit}>
              <label className="pss-label">
                {t('producer.location_label', { defaultValue: 'Lieu partenaire' })}
                <select name="location_id" value={form.location_id} onChange={handleFormChange} className="pss-input" disabled={!canManageSessions}>
                  <option value="">{t('producer.no_location', { defaultValue: 'Selectionner un lieu' })}</option>
                  {locations.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.designation}
                    </option>
                  ))}
                </select>
              </label>

              <label className="pss-label">
                {t('producer.date_label', { defaultValue: 'Date' })} <span className="pss-required">*</span>
                <input type="date" name="date" value={form.date} onChange={handleFormChange} className="pss-input" disabled={!canManageSessions} required />
              </label>

              <label className="pss-label">
                {t('producer.time_label', { defaultValue: 'Heure' })} <span className="pss-required">*</span>
                <input type="time" name="time" value={form.time} onChange={handleFormChange} className="pss-input" disabled={!canManageSessions} required />
              </label>

              <label className="pss-label">
                {t('producer.seats_label', { defaultValue: 'Capacite' })}
                <input type="number" min="1" name="capacity" value={form.capacity} onChange={handleFormChange} className="pss-input" disabled={!canManageSessions} required />
              </label>

              <label className="pss-label">
                {t('producer.price_label', { defaultValue: 'Prix en EUR' })}
                <input type="number" min="0" step="0.01" name="price" value={form.price} onChange={handleFormChange} className="pss-input" disabled={!canManageSessions} placeholder="12.50" />
              </label>

              {formError && <p className="pss-state pss-state--error">{formError}</p>}

              <button type="submit" className="pss-btn pss-btn--primary" disabled={submitting || !canManageSessions}>
                {submitting
                  ? t('producer.saving', { defaultValue: 'Enregistrement...' })
                  : t('producer.add_btn', { defaultValue: 'Ajouter la seance' })}
              </button>
            </form>
          </section>
        </div>
      )}

      {confirm && (
        <div className="pss-modal-backdrop" onClick={() => !deleting && setConfirm(null)}>
          <div className="pss-modal" onClick={(event) => event.stopPropagation()}>
            <h2 className="pss-modal-title">{t('producer.confirm_delete_title', { defaultValue: 'Confirmer la suppression' })}</h2>
            <p className="pss-modal-body">
              Supprimer la seance du {toLocalDatetime(confirm.schedule).date} a {toLocalDatetime(confirm.schedule).time} ?
            </p>
            <div className="pss-modal-actions">
              <button className="pss-btn pss-btn--outline" onClick={() => setConfirm(null)} disabled={deleting}>
                {t('producer.cancel', { defaultValue: 'Annuler' })}
              </button>
              <button className="pss-btn pss-btn--danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? t('producer.deleting', { defaultValue: 'Suppression...' }) : t('producer.delete_btn', { defaultValue: 'Supprimer' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
