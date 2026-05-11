import { useEffect, useState } from 'react'
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
    throw new Error(data?.detail || 'Impossible de charger les spectacles en attente.')
  }

  const data = await response.json()
  const list = Array.isArray(data) ? data : (Array.isArray(data?.results) ? data.results : [])
  return list
}

async function acceptShow(showId) {
  const csrfToken = getCookie('csrftoken') || localStorage.getItem('csrf_token') || ''
  const response = await fetch('/api/shows/bulk-actions/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({ action: 'publish', ids: [showId] }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.detail || data?.error || 'Impossible d\'accepter ce spectacle.')
  }
}

async function deleteShow(showSlug) {
  const csrfToken = getCookie('csrftoken') || localStorage.getItem('csrf_token') || ''
  const response = await fetch(`/api/shows/${showSlug}/`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'X-CSRFToken': csrfToken,
    },
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    throw new Error(data?.detail || 'Impossible de supprimer ce spectacle.')
  }
}

export default function AdminShows() {
  const { t, i18n } = useTranslation()
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState(null)

  const lang = (i18n.language || 'fr').slice(0, 2).toLowerCase()
  const statusLabels = {
    pending: t('admin_shows_page.pending', { defaultValue: 'En attente' }),
    approved: t('admin_shows_page.approved', { defaultValue: 'Approuvé' }),
    rejected: t('admin_shows_page.rejected', { defaultValue: 'Refusé' }),
  }

  const statusClassNames = {
    pending: 'inactive',
    approved: 'active',
    rejected: 'inactive',
  }

  useEffect(() => {
    let ignore = false

    fetchShows()
      .then((data) => {
        if (!ignore) {
          setShows(data)
        }
      })
      .catch((err) => {
        if (!ignore) {
          setError(err.message || t('admin_shows_page.load_error', { defaultValue: 'Impossible de charger les spectacles.' }))
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [t])

  if (loading) {
    return (
      <div className="admin-users">
        <p>{t('admin_shows_page.loading', { defaultValue: 'Chargement des spectacles...' })}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-users error-message">
        <p>{t('admin_shows_page.error_label', { defaultValue: 'Erreur' })}: {error}</p>
      </div>
    )
  }

  async function handleAccept(showId) {
    setWorkingId(showId)
    setError('')

    try {
      await acceptShow(showId)
      setShows((prev) => prev.filter((show) => show.id !== showId))
    } catch (err) {
      setError(err.message || t('admin_shows_page.accept_error', { defaultValue: 'Impossible d\'accepter ce spectacle.' }))
    } finally {
      setWorkingId(null)
    }
  }

  async function handleDelete(show) {
    setWorkingId(show.id)
    setError('')

    try {
      await deleteShow(show.slug)
      setShows((prev) => prev.filter((item) => item.id !== show.id))
    } catch (err) {
      setError(err.message || t('admin_shows_page.delete_error', { defaultValue: 'Impossible de supprimer ce spectacle.' }))
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <div className="admin-users">
      <h1>{t('admin_shows_page.title', { defaultValue: 'Tous les spectacles' })}</h1>

      {error && (
        <p className="admin-producers-state admin-producers-state--error">
          {error}
        </p>
      )}

      {shows.length === 0 ? (
        <p>{t('admin_shows_page.empty', { defaultValue: 'Aucun spectacle pour le moment.' })}</p>
      ) : (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>{t('admin_shows_page.col_id', { defaultValue: 'ID' })}</th>
                <th>{t('admin_shows_page.col_title', { defaultValue: 'Titre' })}</th>
                <th>{t('admin_shows_page.col_artist', { defaultValue: 'Artiste' })}</th>
                <th>{t('admin_shows_page.col_status', { defaultValue: 'Statut' })}</th>
                <th>{t('admin_shows_page.col_actions', { defaultValue: 'Actions' })}</th>
              </tr>
            </thead>
            <tbody>
              {shows.map((show) => {
                const isWorking = workingId === show.id

                return (
                  <tr key={show.id}>
                    <td>{show.id}</td>
                    <td>{tField(show, 'title', lang) || show.title || '-'}</td>
                    <td>{show.artist_name || '-'}</td>
                    <td>
                      <span className={`status-badge ${statusClassNames[show.publication_status] || 'inactive'}`}>
                        {statusLabels[show.publication_status] || show.publication_status || '-'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {show.publication_status === 'pending' && (
                          <button
                            type="button"
                            className="status-toggle-btn"
                            disabled={isWorking}
                            onClick={() => handleAccept(show.id)}
                          >
                            {isWorking ? t('admin_shows_page.processing', { defaultValue: 'Traitement...' }) : t('admin_shows_page.accept', { defaultValue: 'Accepter' })}
                          </button>
                        )}
                        <button
                          type="button"
                          className="status-toggle-btn"
                          disabled={isWorking}
                          onClick={() => handleDelete(show)}
                          style={{ backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#991b1b' }}
                        >
                          {isWorking ? t('admin_shows_page.processing', { defaultValue: 'Traitement...' }) : t('admin_shows_page.delete', { defaultValue: 'Supprimer' })}
                        </button>
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