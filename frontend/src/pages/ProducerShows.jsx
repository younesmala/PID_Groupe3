import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './ProducerShows.css'

const BASE = '/api'

async function apiFetch(path, options = {}) {
  const response = await fetch(`${BASE}${path}`, {
    credentials: 'include',
    headers: { Accept: 'application/json', ...options.headers },
    ...options,
  })
  return response
}

function getPosterSrc(posterUrl, slug) {
  if (!posterUrl && slug) return `/show-posters/${slug}.png`
  if (!posterUrl) return null
  if (posterUrl.startsWith('http://') || posterUrl.startsWith('https://') || posterUrl.startsWith('/')) {
    return posterUrl
  }
  return `/show-posters/${posterUrl}`
}

function getWorkflowStatus(show) {
  if (show.publication_status === 'rejected') return 'rejected'
  if (show.publication_status === 'approved' && show.bookable) return 'published'
  if (show.publication_status === 'approved') return 'validated'
  return 'pending'
}

export default function ProducerShows() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [confirm, setConfirm] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [workingSlug, setWorkingSlug] = useState(null)

  const statusLabels = {
    pending: { label: t('producer.status_pending', { defaultValue: 'En attente' }), cls: 'ps-badge ps-badge--orange' },
    validated: { label: t('producer.status_validated', { defaultValue: 'Valide' }), cls: 'ps-badge ps-badge--blue' },
    published: { label: t('producer.status_published', { defaultValue: 'Publie' }), cls: 'ps-badge ps-badge--green' },
    rejected: { label: t('producer.status_rejected', { defaultValue: 'Refuse' }), cls: 'ps-badge ps-badge--red' },
  }

  async function loadShows() {
    const response = await apiFetch('/producer/shows/')
    if (!response.ok) throw new Error(`Erreur ${response.status}`)
    return response.json()
  }

  useEffect(() => {
    loadShows()
      .then(setShows)
      .catch((loadError) => setError(loadError.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleDelete() {
    if (!confirm) return
    setDeleting(true)
    try {
      const response = await apiFetch(`/producer/shows/${confirm.slug}/`, { method: 'DELETE' })
      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.detail || `Erreur ${response.status}`)
      }
      setShows((current) => current.filter((item) => item.slug !== confirm.slug))
      setConfirm(null)
    } catch (deleteError) {
      setError(deleteError.message)
    } finally {
      setDeleting(false)
    }
  }

  async function handleStatusChange(show, status) {
    setWorkingSlug(show.slug)
    try {
      const response = await apiFetch(`/producer/shows/${show.slug}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      const body = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(body.detail || `Erreur ${response.status}`)
      }
      setShows((current) => current.map((item) => (item.slug === show.slug ? body : item)))
    } catch (statusError) {
      setError(statusError.message)
    } finally {
      setWorkingSlug(null)
    }
  }

  return (
    <div className="ps-page">
      <header className="ps-header">
        <div>
          <h1 className="ps-title">{t('producer.shows_title', { defaultValue: 'Mes spectacles' })}</h1>
          <p className="ps-subtitle">{shows.length} spectacle{shows.length !== 1 ? 's' : ''}</p>
        </div>
        <button type="button" className="ps-btn ps-btn--primary" onClick={() => navigate('/producer/shows/new')}>
          {t('producer.add_show', { defaultValue: 'Ajouter un spectacle' })}
        </button>
      </header>

      {loading && <p className="ps-state">{t('producer.loading', { defaultValue: 'Chargement...' })}</p>}
      {error && <p className="ps-state ps-state--error">{error}</p>}

      {!loading && !error && shows.length === 0 && (
        <p className="ps-state">{t('producer.no_shows', { defaultValue: 'Aucun spectacle pour le moment.' })}</p>
      )}

      {!loading && !error && shows.length > 0 && (
        <div className="ps-table-wrap">
          <table className="ps-table">
            <thead>
              <tr>
                <th>{t('producer.col_image', { defaultValue: 'Image' })}</th>
                <th>{t('producer.col_title', { defaultValue: 'Titre' })}</th>
                <th>{t('producer.col_status', { defaultValue: 'Statut' })}</th>
                <th>{t('producer.col_tickets', { defaultValue: 'Seances' })}</th>
                <th>{t('producer.col_actions', { defaultValue: 'Actions' })}</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => {
                const workflowStatus = getWorkflowStatus(show)
                const badge = statusLabels[workflowStatus] ?? { label: workflowStatus, cls: 'ps-badge' }
                const isWorking = workingSlug === show.slug

                return (
                  <tr key={show.slug}>
                    <td className="ps-td-img">
                      {getPosterSrc(show.poster_url, show.slug) ? (
                        <img src={getPosterSrc(show.poster_url, show.slug)} alt={show.title} className="ps-poster" />
                      ) : (
                        <div className="ps-poster-placeholder">SP</div>
                      )}
                    </td>
                    <td className="ps-td-title">{show.title}</td>
                    <td><span className={badge.cls}>{badge.label}</span></td>
                    <td className="ps-td-tickets">
                      {show.sessions_count > 0 ? `${show.sessions_count} seance${show.sessions_count > 1 ? 's' : ''}` : 'Aucune'}
                    </td>
                    <td className="ps-td-actions">
                      <button type="button" className="ps-btn ps-btn--sm ps-btn--outline" onClick={() => navigate(`/producer/shows/${show.slug}/sessions`)}>
                        {t('producer.sessions_btn', { defaultValue: 'Seances' })}
                      </button>
                      <button type="button" className="ps-btn ps-btn--sm ps-btn--outline" onClick={() => navigate(`/producer/shows/${show.slug}/edit`)}>
                        {t('producer.edit_btn', { defaultValue: 'Modifier' })}
                      </button>
                      {workflowStatus === 'validated' && (
                        <button
                          type="button"
                          className="ps-btn ps-btn--sm ps-btn--primary"
                          disabled={isWorking || !show.sessions_count}
                          onClick={() => handleStatusChange(show, 'published')}
                        >
                          {t('producer.publish_btn', { defaultValue: 'Publier' })}
                        </button>
                      )}
                      {workflowStatus === 'published' && (
                        <button
                          type="button"
                          className="ps-btn ps-btn--sm ps-btn--outline"
                          disabled={isWorking}
                          onClick={() => handleStatusChange(show, 'validated')}
                        >
                          {t('producer.unpublish_btn', { defaultValue: 'Depublier' })}
                        </button>
                      )}
                      <button
                        type="button"
                        className="ps-btn ps-btn--sm ps-btn--danger"
                        disabled={workflowStatus === 'published'}
                        onClick={() => setConfirm(show)}
                      >
                        {t('producer.delete_btn', { defaultValue: 'Supprimer' })}
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <div className="ps-modal-backdrop" onClick={() => !deleting && setConfirm(null)}>
          <div className="ps-modal" onClick={(event) => event.stopPropagation()}>
            <h2 className="ps-modal-title">{t('producer.confirm_delete_title', { defaultValue: 'Confirmer la suppression' })}</h2>
            <p className="ps-modal-body">
              {t('producer.confirm_delete_msg', { title: confirm.title, defaultValue: `Supprimer ${confirm.title} ?` })}
            </p>
            <div className="ps-modal-actions">
              <button type="button" className="ps-btn ps-btn--outline" onClick={() => setConfirm(null)} disabled={deleting}>
                {t('producer.cancel', { defaultValue: 'Annuler' })}
              </button>
              <button type="button" className="ps-btn ps-btn--danger" onClick={handleDelete} disabled={deleting}>
                {deleting ? t('producer.deleting', { defaultValue: 'Suppression...' }) : t('producer.delete_btn', { defaultValue: 'Supprimer' })}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
