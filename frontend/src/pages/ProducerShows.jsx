import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
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

export default function ProducerShows() {
  const { t } = useTranslation()
  const [shows,   setShows]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()

  const statusLabels = {
    approved: { label: t('producer.status_approved'), cls: 'ps-badge ps-badge--green'  },
    pending:  { label: t('producer.status_pending'),  cls: 'ps-badge ps-badge--orange' },
    rejected: { label: t('producer.status_rejected'), cls: 'ps-badge ps-badge--red'    },
  }

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
          <h1 className="ps-title">{t('producer.shows_title')}</h1>
          <p className="ps-subtitle">{shows.length} {shows.length !== 1 ? t('spectacles') : t('spectacles')}</p>
        </div>
        <a href="/producer/shows/new" className="ps-btn ps-btn--primary">
          {t('producer.add_show')}
        </a>
      </header>

      {loading && <p className="ps-state">{t('producer.loading')}</p>}
      {error   && <p className="ps-state ps-state--error">{error}</p>}

      {!loading && !error && shows.length === 0 && (
        <p className="ps-state">{t('producer.no_shows')}</p>
      )}

      {!loading && !error && shows.length > 0 && (
        <div className="ps-table-wrap">
          <table className="ps-table">
            <thead>
              <tr>
                <th>{t('producer.col_image')}</th>
                <th>{t('producer.col_title')}</th>
                <th>{t('producer.col_status')}</th>
                <th>{t('producer.col_tickets')}</th>
                <th>{t('producer.col_actions')}</th>
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
                      const s = statusLabels[show.publication_status] ?? { label: show.publication_status, cls: 'ps-badge' }
                      return <span className={s.cls}>{s.label}</span>
                    })()}
                  </td>
                  <td className="ps-td-tickets">
                    {show.prices?.length > 0
                      ? `${show.prices.length} ${show.prices.length > 1 ? t('producer.tarif_many') : t('producer.tarif_one')}`
                      : '—'}
                  </td>
                  <td className="ps-td-actions">
                    <button
                      className="ps-btn ps-btn--sm ps-btn--outline"
                      onClick={() => navigate(`/producer/shows/${show.slug}/sessions`)}
                    >
                      {t('producer.sessions_btn')}
                    </button>
                    <a
                      href={`/producer/shows/${show.slug}/edit`}
                      className="ps-btn ps-btn--sm ps-btn--outline"
                    >
                      {t('producer.edit_btn')}
                    </a>
                    <button
                      className="ps-btn ps-btn--sm ps-btn--danger"
                      onClick={() => setConfirm(show)}
                    >
                      {t('producer.delete_btn')}
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
            <h2 className="ps-modal-title">{t('producer.confirm_delete_title')}</h2>
            <p className="ps-modal-body">
              {t('producer.confirm_delete_msg', { title: confirm.title })}
            </p>
            <div className="ps-modal-actions">
              <button
                className="ps-btn ps-btn--outline"
                onClick={() => setConfirm(null)}
                disabled={deleting}
              >
                {t('producer.cancel')}
              </button>
              <button
                className="ps-btn ps-btn--danger"
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
