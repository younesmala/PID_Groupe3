import { useEffect, useRef, useState } from 'react'
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
  const collected = []
  let nextUrl = '/api/shows/?ordering=-created_at'

  while (nextUrl) {
    const response = await fetch(nextUrl, {
      credentials: 'include',
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({}))
      throw new Error(data?.detail || 'Impossible de charger les spectacles.')
    }

    const data = await response.json()

    if (Array.isArray(data)) {
      collected.push(...data)
      nextUrl = null
    } else {
      collected.push(...(Array.isArray(data?.results) ? data.results : []))
      nextUrl = data?.next || null
    }
  }

  return collected
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
  const importInputRef = useRef(null)

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

  const escapeCsvValue = (value) => {
    const text = String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
  }

  const parseCsv = (text) => {
    const rows = []
    let row = []
    let field = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i]
      const next = text[i + 1]

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        row.push(field)
        field = ''
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i += 1
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else {
        field += char
      }
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field)
      rows.push(row)
    }

    return rows.filter((cells) => cells.some((cell) => String(cell).trim() !== ''))
  }

  const normalizeImportedStatus = (value) => {
    const statusValue = String(value || '').trim().toLowerCase()

    if (['published', 'publie', 'publié'].includes(statusValue)) {
      return { publication_status: 'approved', bookable: true }
    }

    if (['validated', 'valide', 'validé', 'approved'].includes(statusValue)) {
      return { publication_status: 'approved', bookable: false }
    }

    if (['rejected', 'refuse', 'refusé'].includes(statusValue)) {
      return { publication_status: 'rejected', bookable: false }
    }

    return { publication_status: 'pending', bookable: false }
  }

  function handleExportCsv() {
    const headers = [
      t('admin_shows_page.col_id', { defaultValue: 'ID' }),
      t('admin_shows_page.col_title', { defaultValue: 'Titre' }),
      t('admin_shows_page.col_artist', { defaultValue: 'Producteur / artiste' }),
      t('admin_shows_page.col_status', { defaultValue: 'Statut' }),
    ]

    const rows = shows.map((show) => {
      const workflowStatus = getWorkflowStatus(show)
      const label =
        workflowStatus === 'pending'
          ? t('producer.status_pending', { defaultValue: 'En attente' })
          : workflowStatus === 'validated'
            ? t('producer.status_validated', { defaultValue: 'Valide' })
            : workflowStatus === 'published'
              ? t('producer.status_published', { defaultValue: 'Publie' })
              : t('producer.status_rejected', { defaultValue: 'Refuse' })

      return [
        show.id ?? '',
        tField(show, 'title', lang) || show.title || '-',
        show.artist_name || '-',
        label,
      ]
    })

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], {
      type: 'text/csv;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url
    link.setAttribute('download', `shows-${date}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function handleExportJson() {
    const payload = shows.map((show) => ({
      id: show.id ?? null,
      title: tField(show, 'title', lang) || show.title || '',
      artist_name: show.artist_name || '',
      publication_status: show.publication_status || 'pending',
      bookable: Boolean(show.bookable),
    }))

    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: 'application/json;charset=utf-8;',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url
    link.setAttribute('download', `shows-${date}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const extension = (file.name.split('.').pop() || '').toLowerCase()
      let imported = []

      if (extension === 'json') {
        const items = JSON.parse(text)
        if (!Array.isArray(items)) {
          throw new Error('Fichier invalide.')
        }

        imported = items.map((item, index) => {
          const statusInfo = normalizeImportedStatus(item?.publication_status || item?.status)
          const idValue = Number(item?.id)
          return {
            id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
            title: String(item?.title || '').trim(),
            artist_name: String(item?.artist_name || '').trim(),
            ...statusInfo,
          }
        })
      } else if (extension === 'csv') {
        const rows = parseCsv(text)
        const dataRows = rows.slice(1)
        imported = dataRows.map((cells, index) => {
          const statusInfo = normalizeImportedStatus(cells[3])
          const idValue = Number(cells[0])
          return {
            id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
            title: String(cells[1] || '').trim(),
            artist_name: String(cells[2] || '').trim(),
            ...statusInfo,
          }
        })
      } else {
        throw new Error('Formats acceptes: CSV, JSON.')
      }

      if (!imported.length) {
        throw new Error('Aucune donnee a importer.')
      }

      setShows(sortByNewestId(imported))
      setError('')
    } catch (importError) {
      setError(importError.message || 'Impossible d importer ce fichier.')
    } finally {
      event.target.value = ''
    }
  }

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
                const badgeClass =
                  workflowStatus === 'validated' || workflowStatus === 'published'
                    ? 'active'
                    : 'inactive'
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
                            {isWorking
                              ? t('admin_shows_page.processing', { defaultValue: 'Traitement...' })
                              : 'Valider'}
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
                            {isWorking
                              ? t('admin_shows_page.processing', { defaultValue: 'Traitement...' })
                              : 'Refuser'}
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
      {!loading && (
        <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
          <button type="button" className="admin-luminous-action-btn" onClick={() => importInputRef.current?.click()}>
            {t('import_button', { defaultValue: 'Importer' })}
          </button>
          {shows.length > 0 && (
            <button type="button" className="admin-luminous-action-btn" onClick={handleExportCsv}>
              {t('export_csv', { defaultValue: 'Export CSV' })}
            </button>
          )}
          {shows.length > 0 && (
            <button type="button" className="admin-luminous-action-btn" onClick={handleExportJson}>
              {t('export_json', { defaultValue: 'Export JSON' })}
            </button>
          )}
          <input
            ref={importInputRef}
            type="file"
            accept=".csv,.json,application/json,text/csv"
            onChange={handleImportFile}
            style={{ display: 'none' }}
          />
        </div>
      )}
    </div>
  )
}
