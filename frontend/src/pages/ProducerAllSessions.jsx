import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProducerAllSessions.css'

const BASE = '/api'

async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  return res
}

function toLocalDatetime(isoString) {
  if (!isoString) return { date: '', time: '' }
  const d = new Date(isoString)
  const date = d.toLocaleDateString('fr-BE', { year: 'numeric', month: '2-digit', day: '2-digit' })
  const time = d.toTimeString().slice(0, 5)
  return { date, time }
}

export default function ProducerAllSessions() {
  const navigate = useNavigate()

  const [sessions,   setSessions]   = useState([])
  const [showMap,    setShowMap]    = useState({})
  const [locationMap, setLocationMap] = useState({})
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [confirm,    setConfirm]    = useState(null)
  const [deleting,   setDeleting]   = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [showsRes, repsRes, locsRes] = await Promise.all([
          apiFetch('/producer/shows/'),
          apiFetch('/representations/'),
          apiFetch('/locations/'),
        ])

        if (!showsRes.ok) throw new Error(`Erreur chargement spectacles (${showsRes.status})`)
        if (!repsRes.ok)  throw new Error(`Erreur chargement séances (${repsRes.status})`)
        if (!locsRes.ok)  throw new Error(`Erreur chargement lieux (${locsRes.status})`)

        const showsData = await showsRes.json()
        const repsData  = await repsRes.json()
        const locsData  = await locsRes.json()

        const shows = Array.isArray(showsData) ? showsData : (showsData.results ?? [])
        const reps  = Array.isArray(repsData)  ? repsData  : (repsData.results  ?? [])
        const locs  = Array.isArray(locsData)  ? locsData  : (locsData.results  ?? [])

        const producerShowIds = new Set(shows.map((s) => s.id))

        const sMap = {}
        shows.forEach((s) => { sMap[s.id] = s.title })

        const lMap = {}
        locs.forEach((l) => { lMap[l.id] = l.designation })

        setShowMap(sMap)
        setLocationMap(lMap)
        setSessions(
          reps
            .filter((r) => producerShowIds.has(r.show))
            .sort((a, b) => new Date(a.schedule) - new Date(b.schedule))
        )
      } catch (e) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  async function handleDelete() {
    if (!confirm) return
    setDeleting(true)
    try {
      const res = await fetch(`${BASE}/representations/${confirm.id}/`, {
        method: 'DELETE',
        credentials: 'include',
      })
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
    <div className="pas-page">
      <button className="pas-breadcrumb" onClick={() => navigate('/producer/dashboard')}>
        ← Tableau de bord
      </button>

      <header className="pas-header">
        <h1 className="pas-title">Mes séances</h1>
        {!loading && !error && (
          <p className="pas-subtitle">
            {sessions.length} séance{sessions.length !== 1 ? 's' : ''} programmée{sessions.length !== 1 ? 's' : ''}
          </p>
        )}
      </header>

      {loading && <p className="pas-state">Chargement…</p>}
      {error   && <p className="pas-state pas-state--error">{error}</p>}

      {!loading && !error && sessions.length === 0 && (
        <div className="pas-empty">
          <p>Aucune séance programmée.</p>
          <button className="pas-btn pas-btn--primary" onClick={() => navigate('/producer/shows')}>
            Gérer mes spectacles
          </button>
        </div>
      )}

      {!loading && !error && sessions.length > 0 && (
        <ul className="pas-list">
          {sessions.map((s) => {
            const { date, time } = toLocalDatetime(s.schedule)
            return (
              <li key={s.id} className="pas-card">
                <div className="pas-card-show">{showMap[s.show] ?? `Spectacle #${s.show}`}</div>
                <div className="pas-card-body">
                  <div className="pas-card-info">
                    <span className="pas-card-datetime">{date} à {time}</span>
                    <span className="pas-card-loc">{locationMap[s.location] ?? '—'}</span>
                    <span className="pas-card-seats">
                      {s.available_seats} place{s.available_seats !== 1 ? 's' : ''} disponible{s.available_seats !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <button
                    className="pas-btn pas-btn--danger pas-btn--sm"
                    onClick={() => setConfirm(s)}
                  >
                    Supprimer
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {confirm && (
        <div className="pas-modal-backdrop" onClick={() => !deleting && setConfirm(null)}>
          <div className="pas-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="pas-modal-title">Confirmer la suppression</h2>
            <p className="pas-modal-body">
              Voulez-vous supprimer la séance de{' '}
              <strong>{showMap[confirm.show] ?? `Spectacle #${confirm.show}`}</strong>{' '}
              du <strong>{toLocalDatetime(confirm.schedule).date}</strong> à{' '}
              <strong>{toLocalDatetime(confirm.schedule).time}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="pas-modal-actions">
              <button
                className="pas-btn pas-btn--outline"
                onClick={() => setConfirm(null)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                className="pas-btn pas-btn--danger"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Suppression…' : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}