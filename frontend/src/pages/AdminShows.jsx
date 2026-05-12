import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { tField } from '../utils/locale'
import './AdminUsers.css'

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

async function fetchShows() {
  const response = await fetch('/api/shows/', {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.detail || 'Impossible de charger les spectacles.')
  }

  const data = await response.json()
  return Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : [])
}

async function updateShowStatus(showId, status) {
  const csrfToken = getCookie('csrftoken') || localStorage.getItem('csrf_token') || ''
  const response = await fetch(`/api/admin/shows/${showId}/`, {
    method: 'PATCH',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({ status }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    throw new Error(data?.detail || data?.error || `Erreur ${response.status}`)
  }
  return data
}

function getWorkflowStatus(show) {
  if (show.publication_status === 'rejected') return 'rejected'
  if (show.publication_status === 'approved' && show.bookable) return 'published'
  if (show.publication_status === 'approved') return 'validated'
  return 'pending'
}

export default function AdminShows() {
  const { t, i18n } = useTranslation()
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState(null)

  const topActionStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    borderRadius: '18px',
    border: '1px solid rgba(217, 119, 6, 0.26)',
    background: '#d9911d',
    color: '#0f172a',
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(217, 145, 29, 0.22)',
  }

  const lang = (i18n.language || 'fr').slice(0, 2).toLowerCase()
  const sortByNewestId = (items) => [...items].sort((a, b) => (b.id || 0) - (a.id || 0))

  useEffect(() => {
    let ignore = false

    fetchShows()
      .then((data) => {
        if (!ignore) setShows(sortByNewestId(data))
      })
      .catch((loadError) => {
        if (!ignore) setError(loadError.message || 'Impossible de charger les spectacles.')
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [])

  async function handleStatus(showId, status) {
    setWorkingId(showId)
    setError('')
    try {
      const updatedShow = await updateShowStatus(showId, status)
      setShows((current) => sortByNewestId(current.map((item) => (item.id === showId ? updatedShow : item))))
    } catch (statusError) {
      setError(statusError.message)
    } finally {
      setWorkingId(null)
    }
  }

  async function refreshShows() {
    setLoading(true)
    setError('')
    try {
      setShows(sortByNewestId(await fetchShows()))
    } catch (refreshError) {
      setError(refreshError.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="admin-users">
        <p>{t('admin_shows_page.loading', { defaultValue: 'Chargement des spectacles...' })}</p>
      </div>
    )
  }

  return (
    <div className="admin-users">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Link to={`/${i18n.language}/admin/dashboard`} style={topActionStyle}>
          Retour dashboard
        </Link>
        <button type="button" onClick={refreshShows} style={topActionStyle}>
          {t('refresh_button', { defaultValue: 'Rafraichir' })}
        </button>
      </div>

      <h1>{t('admin_shows_page.title', { defaultValue: 'Validation des spectacles' })}</h1>

      {error && <p className="admin-producers-state admin-producers-state--error">{error}</p>}

      {shows.length === 0 ? (
        <p>{t('admin_shows_page.empty', { defaultValue: 'Aucun spectacle pour le moment.' })}</p>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t('admin_shows_page.col_id', { defaultValue: 'ID' })}</th>
                <th>{t('admin_shows_page.col_title', { defaultValue: 'Titre' })}</th>
                <th>{t('admin_shows_page.col_artist', { defaultValue: 'Producteur / artiste' })}</th>
                <th>{t('admin_shows_page.col_status', { defaultValue: 'Statut' })}</th>
                <th>{t('admin_shows_page.col_actions', { defaultValue: 'Actions' })}</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => {
                const workflowStatus = getWorkflowStatus(show)
                const isWorking = workingId === show.id
                const badgeClass = workflowStatus === 'validated' || workflowStatus === 'published' ? 'active' : 'inactive'
                const badgeLabel =
                  workflowStatus === 'pending'
                    ? t('producer.status_pending', { defaultValue: 'En attente' })
                    : workflowStatus === 'validated'
                      ? t('producer.status_validated', { defaultValue: 'Valide' })
                      : workflowStatus === 'published'
                        ? t('producer.status_published', { defaultValue: 'Publie' })
                        : t('producer.status_rejected', { defaultValue: 'Refuse' })

                return (
                  <tr key={show.id}>
                    <td>{show.id}</td>
                    <td>{tField(show, 'title', lang) || show.title || '-'}</td>
                    <td>{show.artist_name || '-'}</td>
                    <td>
                      <span className={`status-badge ${badgeClass}`}>{badgeLabel}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {workflowStatus === 'pending' && (
                          <button
                            type="button"
                            className="status-toggle-btn"
                            disabled={isWorking}
                            onClick={() => handleStatus(show.id, 'validated')}
                          >
                            {isWorking ? t('admin_shows_page.processing', { defaultValue: 'Traitement...' }) : 'Valider'}
                          </button>
                        )}
                        {(workflowStatus === 'pending' || workflowStatus === 'validated') && (
                          <button
                            type="button"
                            className="status-toggle-btn"
                            disabled={isWorking}
                            onClick={() => handleStatus(show.id, 'rejected')}
                            style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}
                          >
                            {isWorking ? t('admin_shows_page.processing', { defaultValue: 'Traitement...' }) : 'Refuser'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
