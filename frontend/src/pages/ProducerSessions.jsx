import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './ProducerSessions.css'

const BASE = '/api'

async function apiFetch(path, options = {}) {
  const { headers: optHeaders = {}, ...rest } = options
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    ...rest,
    headers: {
      Accept: 'application/json',
      ...optHeaders,
    },
  })
  return res
}

function toLocalDatetime(isoString) {
  if (!isoString) return { date: '', time: '' }
  const d = new Date(isoString)
  const date = d.toISOString().slice(0, 10)
  const time = d.toTimeString().slice(0, 5)
  return { date, time }
}

export default function ProducerSessions() {
  const { t } = useTranslation()
  const { slug }       = useParams()
  const navigate       = useNavigate()

  const [show,      setShow]      = useState(null)
  const [sessions,  setSessions]  = useState([])
  const [locations, setLocations] = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)

  const [form, setForm] = useState({
    location: '',
    date: '',
    time: '',
    available_seats: 100,
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError,  setFormError]  = useState(null)

  const [confirm,  setConfirm]  = useState(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const showRes = await apiFetch(`/shows/${slug}/`)
        if (!showRes.ok) throw new Error(`Spectacle introuvable (${showRes.status})`)
        const showData = await showRes.json()
        setShow(showData)

        const sessRes = await apiFetch(`/representations/?show=${showData.id}`)
        if (!sessRes.ok) throw new Error(`Erreur chargement seances (${sessRes.status})`)
        const sessData = await sessRes.json()
        setSessions(Array.isArray(sessData) ? sessData : (sessData.results ?? []))

        const locRes = await apiFetch('/locations/')
        if (!locRes.ok) throw new Error(`Erreur chargement lieux (${locRes.status})`)
        const locData = await locRes.json()
        const locs = Array.isArray(locData) ? locData : (locData.results ?? [])
        setLocations(locs)
        if (locs.length > 0) setForm((f) => ({ ...f, location: locs[0].id }))
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [slug])

  function handleFormChange(e) {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError(null)
    if (!form.date || !form.time) {
      setFormError('La date et l\'heure sont obligatoires.')
      return
    }
    setSubmitting(true)
    try {
      const schedule = `${form.date}T${form.time}:00Z`
      const payload = {
        show:            show.id,
        schedule,
        location:        form.location ? Number(form.location) : null,
        available_seats: Number(form.available_seats) || 100,
      }
      const res = await fetch(`${BASE}/representations/`, {
        method:      'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        const msg = Object.values(body).flat().join(' ') || `Erreur ${res.status}`
        throw new Error(msg)
      }
      const created = await res.json()
      setSessions((prev) => [...prev, created])
      setForm((f) => ({ ...f, date: '', time: '', available_seats: 100 }))
    } catch (e) {
      setFormError(e.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!confirm) return
    setDeleting(true)
    try {
      const res = await apiFetch(`/representations/${confirm.id}/`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Erreur ${res.status}`)
      }
      setSessions((prev) => prev.filter((s) => s.id !== confirm.id))
      setConfirm(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="pss-page">
      <button className="pss-breadcrumb" onClick={() => navigate('/producer/shows')}>
        {t('producer.back_shows')}
      </button>

      <header className="pss-header">
        <div>
          <h1 className="pss-title">{t('producer.sessions_title')}</h1>
          {show && <p className="pss-subtitle">{show.title}</p>}
        </div>
      </header>

      {loading && <p className="pss-state">{t('producer.loading')}</p>}
      {error   && <p className="pss-state pss-state--error">{error}</p>}

      {!loading && !error && (
        <div className="pss-layout">
          <section className="pss-list-section">
            <h2 className="pss-section-title">
              {sessions.length} {t('producer.sessions_title').toLowerCase()}
            </h2>

            {sessions.length === 0 ? (
              <p className="pss-state">{t('producer.no_sessions')}</p>
            ) : (
              <ul className="pss-list">
                {sessions
                  .slice()
                  .sort((a, b) => new Date(a.schedule) - new Date(b.schedule))
                  .map((s) => {
                    const { date, time } = toLocalDatetime(s.schedule)
                    const loc = locations.find((l) => l.id === s.location)
                    return (
                      <li key={s.id} className="pss-item">
                        <div className="pss-item-info">
                          <span className="pss-item-date">
                            {date} {t('producer.at')} {time}
                          </span>
                          <span className="pss-item-loc">
                            {loc?.designation ?? '—'}
                          </span>
                          <span className="pss-item-seats">
                            {s.available_seats} {t('show.seats_remaining')}
                          </span>
                        </div>
                        <button
                          className="pss-btn pss-btn--sm pss-btn--danger"
                          onClick={() => setConfirm(s)}
                        >
                          {t('producer.delete_btn')}
                        </button>
                      </li>
                    )
                  })}
              </ul>
            )}
          </section>

          <section className="pss-form-section">
            <h2 className="pss-section-title">{t('producer.add_session')}</h2>
            <form className="pss-form" onSubmit={handleSubmit}>
              <label className="pss-label">
                {t('producer.location_label')}
                <select
                  name="location"
                  value={form.location}
                  onChange={handleFormChange}
                  className="pss-input"
                >
                  <option value="">{t('producer.no_location')}</option>
                  {locations.map((l) => (
                    <option key={l.id} value={l.id}>{l.designation}</option>
                  ))}
                </select>
              </label>

              <label className="pss-label">
                {t('producer.date_label')} <span className="pss-required">*</span>
                <input
                  type="date"
                  name="date"
                  value={form.date}
                  onChange={handleFormChange}
                  className="pss-input"
                  required
                />
              </label>

              <label className="pss-label">
                {t('producer.time_label')} <span className="pss-required">*</span>
                <input
                  type="time"
                  name="time"
                  value={form.time}
                  onChange={handleFormChange}
                  className="pss-input"
                  required
                />
              </label>

              <label className="pss-label">
                {t('producer.seats_label')}
                <input
                  type="number"
                  name="available_seats"
                  value={form.available_seats}
                  onChange={handleFormChange}
                  className="pss-input"
                  min={1}
                  required
                />
              </label>

              {formError && (
                <p className="pss-state pss-state--error">{formError}</p>
              )}

              <button
                type="submit"
                className="pss-btn pss-btn--primary"
                disabled={submitting}
              >
                {submitting ? t('producer.saving') : t('producer.add_btn')}
              </button>
            </form>
          </section>
        </div>
      )}

      {confirm && (
        <div className="pss-modal-backdrop" onClick={() => !deleting && setConfirm(null)}>
          <div className="pss-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="pss-modal-title">{t('producer.confirm_delete_title')}</h2>
            <p className="pss-modal-body">
              {t('producer.confirm_session_msg', {
                date: toLocalDatetime(confirm.schedule).date,
                time: toLocalDatetime(confirm.schedule).time,
              })}
            </p>
            <div className="pss-modal-actions">
              <button
                className="pss-btn pss-btn--outline"
                onClick={() => setConfirm(null)}
                disabled={deleting}
              >
                {t('producer.cancel')}
              </button>
              <button
                className="pss-btn pss-btn--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? t('producer.deleting') : t('producer.delete_btn')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
