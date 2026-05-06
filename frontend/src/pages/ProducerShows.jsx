import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './ProducerShows.css'

const BASE = '/api'

async function apiFetch(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { Accept: 'application/json', ...options.headers },
    ...options,
  })
  return res
}

const STATUS_LABELS = {
  approved: { label: 'Publié',    cls: 'ps-badge ps-badge--green'  },
  pending:  { label: 'En attente', cls: 'ps-badge ps-badge--orange' },
  rejected: { label: 'Rejeté',    cls: 'ps-badge ps-badge--red'    },
}

export default function ProducerShows() {
  const [shows,   setShows]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    apiFetch('/producer/shows/')
      .then(async (res) => {
        if (!res.ok) throw new Error(`Erreur ${res.status}`)
        return res.json()
      })
      .then(setShows)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete() {
    if (!confirm) return
    setDeleting(true)
    try {
      const res = await apiFetch(`/producer/shows/${confirm.slug}/`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.detail || `Erreur ${res.status}`)
      }
      setShows((prev) => prev.filter((s) => s.slug !== confirm.slug))
      setConfirm(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="ps-page">
      <header className="ps-header">
        <div>
          <h1 className="ps-title">Mes spectacles</h1>
          <p className="ps-subtitle">{shows.length} spectacle{shows.length !== 1 ? 's' : ''}</p>
        </div>
        <a href="/producer/shows/new" className="ps-btn ps-btn--primary">
          + Ajouter un spectacle
        </a>
      </header>

      {loading && <p className="ps-state">Chargement…</p>}
      {error   && <p className="ps-state ps-state--error">{error}</p>}

      {!loading && !error && shows.length === 0 && (
        <p className="ps-state">Aucun spectacle pour l'instant.</p>
      )}

      {!loading && !error && shows.length > 0 && (
        <div className="ps-table-wrap">
          <table className="ps-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Titre</th>
                <th>Statut</th>
                <th>Billets</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => (
                <tr key={show.slug}>
                  <td className="ps-td-img">
                    {show.poster_url
                      ? <img src={show.poster_url} alt={show.title} className="ps-poster" />
                      : <div className="ps-poster-placeholder">🎭</div>
                    }
                  </td>
                  <td className="ps-td-title">{show.title}</td>
                  <td>
                    {(() => {
                      const s = STATUS_LABELS[show.publication_status] ?? { label: show.publication_status, cls: 'ps-badge' }
                      return <span className={s.cls}>{s.label}</span>
                    })()}
                  </td>
                  <td className="ps-td-tickets">
                    {show.prices?.length > 0
                      ? `${show.prices.length} tarif${show.prices.length > 1 ? 's' : ''}`
                      : '—'}
                  </td>
                  <td className="ps-td-actions">
                    <button
                      className="ps-btn ps-btn--sm ps-btn--outline"
                      onClick={() => navigate(`/producer/shows/${show.slug}/sessions`)}
                    >
                      Séances
                    </button>
                    <a
                      href={`/producer/shows/${show.slug}/edit`}
                      className="ps-btn ps-btn--sm ps-btn--outline"
                    >
                      Modifier
                    </a>
                    <button
                      className="ps-btn ps-btn--sm ps-btn--danger"
                      onClick={() => setConfirm(show)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <div className="ps-modal-backdrop" onClick={() => !deleting && setConfirm(null)}>
          <div className="ps-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="ps-modal-title">Confirmer la suppression</h2>
            <p className="ps-modal-body">
              Voulez-vous vraiment supprimer <strong>{confirm.title}</strong> ?
              Cette action est irréversible.
            </p>
            <div className="ps-modal-actions">
              <button
                className="ps-btn ps-btn--outline"
                onClick={() => setConfirm(null)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                className="ps-btn ps-btn--danger"
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