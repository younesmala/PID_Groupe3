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

async function rejectShow(showId) {
  const csrfToken = getCookie('csrftoken') || localStorage.getItem('csrf_token') || ''
  const response = await fetch('/api/shows/bulk-actions/', {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({ action: 'reject', ids: [showId] }),
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
  const importInputRef = useRef(null)

  const topActionStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '18px',
    border: '1px solid rgba(217, 119, 6, 0.26)', background: '#d9911d',
    color: '#0f172a', textDecoration: 'none', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(217, 145, 29, 0.22)'
  }

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

  const sortByNewestId = (items) => [...items].sort((a, b) => (b.id || 0) - (a.id || 0))

  useEffect(() => {
    let ignore = false

    fetchShows()
      .then((data) => {
        if (!ignore) {
          setShows(sortByNewestId(Array.isArray(data) ? data : []))
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
      setShows((prev) =>
        sortByNewestId(
          prev.map((show) =>
            show.id === showId
              ? { ...show, publication_status: 'approved' }
              : show,
          ),
        ),
      )
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
      await rejectShow(show.id)
      setShows((prev) =>
        sortByNewestId(
          prev.map((item) =>
            item.id === show.id
              ? { ...item, publication_status: 'rejected' }
              : item,
          ),
        ),
      )
    } catch (err) {
      setError(err.message || t('admin_shows_page.delete_error', { defaultValue: 'Impossible de supprimer ce spectacle.' }))
    } finally {
      setWorkingId(null)
    }
  }

  async function refreshShows() {
    setError('')
    setLoading(true)

    try {
      const data = await fetchShows()
      setShows(sortByNewestId(Array.isArray(data) ? data : []))
    } catch (err) {
      setError(err.message || t('admin_shows_page.load_error', { defaultValue: 'Impossible de charger les spectacles.' }))
    } finally {
      setLoading(false)
    }
  }

  function escapeCsvValue(value) {
    const text = String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
  }

  function parseCsv(text) {
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

    return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''))
  }

  function normalizeStatus(value) {
    const status = String(value || '').trim().toLowerCase()
    if (['approved', 'approuve', 'approuvé', 'publie', 'publié'].includes(status)) return 'approved'
    if (['rejected', 'refuse', 'refusé'].includes(status)) return 'rejected'
    return 'pending'
  }

  function mapCsvToShows(csvRows) {
    if (!csvRows.length) return []
    const header = csvRows[0].map((h) => String(h || '').trim().toLowerCase())
    const hasHeader = header.some((h) => ['id', 'titre', 'title', 'status', 'statut'].includes(h))
    const dataRows = csvRows.slice(hasHeader ? 1 : 0)

    return dataRows.map((cells, index) => {
      const idValue = Number(cells[0])
      return {
        id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
        title: String(cells[1] || '-').trim() || '-',
        artist_name: String(cells[2] || '-').trim() || '-',
        publication_status: normalizeStatus(cells[3]),
      }
    })
  }

  function mapJsonToShows(items) {
    if (!Array.isArray(items)) {
      throw new Error(t('admin_shows_page.import_invalid', { defaultValue: 'Fichier invalide.' }))
    }

    return items.map((item, index) => {
      const idValue = Number(item?.id)
      return {
        id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
        title: String(item?.title || '-').trim() || '-',
        artist_name: String(item?.artist_name || '-').trim() || '-',
        publication_status: normalizeStatus(item?.publication_status || item?.status),
      }
    })
  }

  function handleExportCsv() {
    const headers = [
      t('admin_shows_page.col_id', { defaultValue: 'ID' }),
      t('admin_shows_page.col_title', { defaultValue: 'Titre' }),
      t('admin_shows_page.col_artist', { defaultValue: 'Producteurs' }),
      t('admin_shows_page.col_status', { defaultValue: 'Statut' }),
    ]

    const rows = shows.map((show) => [
      show.id ?? '',
      tField(show, 'title', lang) || show.title || '-',
      show.artist_name || '-',
      statusLabels[show.publication_status] || show.publication_status || '-',
    ])

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
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
      title: tField(show, 'title', lang) || show.title || '-',
      artist_name: show.artist_name || '-',
      publication_status: show.publication_status || 'pending',
    }))

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' })
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

    setError('')

    try {
      const text = await file.text()
      const extension = (file.name.split('.').pop() || '').toLowerCase()
      let imported = []

      if (extension === 'csv') {
        imported = mapCsvToShows(parseCsv(text))
      } else if (extension === 'json') {
        imported = mapJsonToShows(JSON.parse(text))
      } else {
        throw new Error(t('admin_shows_page.import_format', { defaultValue: 'Formats acceptes: CSV, JSON.' }))
      }

      if (!imported.length) {
        throw new Error(t('admin_shows_page.import_empty', { defaultValue: 'Aucune donnee a importer.' }))
      }

      setShows(sortByNewestId(imported))
    } catch (err) {
      setError(err.message || t('admin_shows_page.import_error', { defaultValue: 'Impossible d importer ce fichier.' }))
    } finally {
      event.target.value = ''
    }
  }

  return (
    <div className="admin-users">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Link to={`/${i18n.language}/admin/dashboard`} className="admin-luminous-action-btn">
          ← {t('back_to_dashboard')}
        </Link>
        <button type="button" onClick={refreshShows} className="admin-luminous-action-btn">
          {t('refresh_button')}
        </button>
      </div>
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
                <th>{t('admin_shows_page.col_artist', { defaultValue: 'Producteurs' })}</th>
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