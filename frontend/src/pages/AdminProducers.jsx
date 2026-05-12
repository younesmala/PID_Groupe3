import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './AdminUsers.css'

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const csrfToken = getCookie('csrftoken') || localStorage.getItem('csrf_token') || ''

  const response = await fetch(`/api${path}`, {
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(method !== 'GET' ? { 'X-CSRFToken': csrfToken } : {}),
      ...(options.headers || {}),
    },
    ...options,
  })

  return response
}

export default function AdminProducers() {
  const { t, i18n } = useTranslation()
  const [producers, setProducers] = useState([])
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

  useEffect(() => {
    loadProducers()
  }, [])

  const sortByNewestId = (items) => [...items].sort((a, b) => (b.id || 0) - (a.id || 0))

  const statusLabels = {
    pending: t('admin.producers_status_pending', { defaultValue: 'En attente' }),
    approved: t('admin.producers_status_approved', { defaultValue: 'Validé' }),
    deleted: t('admin.producers_status_deleted', { defaultValue: 'Supprimé' }),
  }

  const statusClassNames = {
    pending: 'pending',
    approved: 'active',
    deleted: 'inactive',
  }

  async function loadProducers() {
    setLoading(true)
    setError('')

    try {
      const res = await apiFetch('/admin/producers/')
      const data = await res.json().catch(() => [])

      if (!res.ok) {
        throw new Error(data?.detail || t('admin.producers_error_load'))
      }

      setProducers(sortByNewestId(Array.isArray(data) ? data : []))
    } catch (err) {
      setError(err.message || t('admin.producers_error_load'))
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(producerId) {
    setWorkingId(producerId)
    setError('')

    try {
      const res = await apiFetch(`/admin/producers/${producerId}/`, {
        method: 'PATCH',
      })
      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.detail || t('admin.producers_error_approve'))
      }

      setProducers((prev) =>
        sortByNewestId(
          prev.map((producer) =>
            producer.id === producerId ? { ...producer, status: 'approved' } : producer,
          ),
        ),
      )
    } catch (err) {
      setError(err.message || t('admin.producers_error_approve'))
    } finally {
      setWorkingId(null)
    }
  }

  async function handleDelete(producerId) {
    setWorkingId(producerId)
    setError('')

    try {
      const res = await apiFetch(`/admin/producers/${producerId}/`, {
        method: 'DELETE',
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.detail || t('admin.producers_error_delete'))
      }

      setProducers((prev) =>
        sortByNewestId(
          prev.map((producer) =>
            producer.id === producerId ? { ...producer, status: 'deleted' } : producer,
          ),
        ),
      )
    } catch (err) {
      setError(err.message || t('admin.producers_error_delete'))
    } finally {
      setWorkingId(null)
    }
  }

  function escapeCsvValue(value) {
    const text = String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
  }

  function handleExportCsv() {
    const headers = [
      t('admin.producers_col_id'),
      t('admin.producers_col_name'),
      t('admin.producers_col_email'),
      t('admin.producers_col_status'),
    ]

    const rows = producers.map((producer) => {
      const statusLabel = statusLabels[producer.status] || producer.status || '-'
      return [producer.id ?? '', producer.name || '-', producer.email || '-', statusLabel]
    })

    const csvContent = [headers, ...rows]
      .map((row) => row.map(escapeCsvValue).join(','))
      .join('\n')

    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)

    link.href = url
    link.setAttribute('download', `producers-${date}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function handleExportJson() {
    const items = producers.map((producer) => ({
      id: producer.id ?? null,
      name: producer.name || '-',
      email: producer.email || '-',
      status: producer.status || '-',
      status_label: statusLabels[producer.status] || producer.status || '-',
    }))

    const jsonContent = JSON.stringify(items, null, 2)
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)

    link.href = url
    link.setAttribute('download', `producers-${date}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function normalizeStatus(statusValue) {
    const normalized = String(statusValue || '')
      .trim()
      .toLowerCase()

    if (['pending', 'en attente'].includes(normalized)) {
      return 'pending'
    }

    if (['approved', 'valide', 'validé', 'actif', 'active'].includes(normalized)) {
      return 'approved'
    }

    if (['deleted', 'supprime', 'supprimé', 'inactive', 'inactif'].includes(normalized)) {
      return 'deleted'
    }

    return 'pending'
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
        if (char === '\r' && next === '\n') {
          i += 1
        }
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

  function mapCsvToProducers(csvRows) {
    if (!csvRows.length) {
      return []
    }

    const normalizedHeader = csvRows[0].map((h) => String(h || '').trim().toLowerCase())
    const hasHeader = normalizedHeader.some((h) =>
      ['id', 'nom', 'name', 'email', 'statut', 'status'].includes(h),
    )

    const startIndex = hasHeader ? 1 : 0

    return csvRows.slice(startIndex).map((cells, index) => {
      const idValue = Number(cells[0])
      return {
        id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
        name: String(cells[1] || '-').trim() || '-',
        email: String(cells[2] || '-').trim() || '-',
        status: normalizeStatus(cells[3]),
      }
    })
  }

  function mapJsonToProducers(items) {
    if (!Array.isArray(items)) {
      throw new Error(t('admin.producers_error_import', { defaultValue: 'Fichier invalide.' }))
    }

    return items.map((item, index) => {
      const idValue = Number(item?.id)
      return {
        id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
        name: String(item?.name || item?.nom || '-').trim() || '-',
        email: String(item?.email || '-').trim() || '-',
        status: normalizeStatus(item?.status || item?.status_label),
      }
    })
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setError('')

    try {
      const text = await file.text()
      const extension = (file.name.split('.').pop() || '').toLowerCase()
      let imported = []

      if (extension === 'csv') {
        imported = mapCsvToProducers(parseCsv(text))
      } else if (extension === 'json') {
        imported = mapJsonToProducers(JSON.parse(text))
      } else {
        throw new Error(
          t('admin.producers_error_import_format', {
            defaultValue: 'Formats acceptes: CSV, JSON.',
          }),
        )
      }

      if (!imported.length) {
        throw new Error(t('admin.producers_error_import_empty', { defaultValue: 'Aucune donnee a importer.' }))
      }

      setProducers(sortByNewestId(imported))
    } catch (err) {
      setError(err.message || t('admin.producers_error_import', { defaultValue: 'Impossible d importer ce fichier.' }))
    } finally {
      event.target.value = ''
    }
  }

  return (
    <main className="admin-users">
      <section>
        <header>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <Link to={`/${i18n.language}/admin/dashboard`} className="admin-luminous-action-btn">
              ← {t('back_to_dashboard')}
            </Link>
            <button type="button" onClick={loadProducers} className="admin-luminous-action-btn">
              {t('refresh_button')}
            </button>
          </div>
          <h1>{t('navbar.admin_producers')}</h1>
        </header>

        {loading && <p>{t('producer.loading')}</p>}
        {error && <p className="admin-producers-state admin-producers-state--error">{error}</p>}

        {!loading && !error && producers.length === 0 && (
          <p>{t('admin.producers_empty')}</p>
        )}

        {!loading && producers.length > 0 && (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>{t('admin.producers_col_id')}</th>
                  <th>{t('admin.producers_col_name')}</th>
                  <th>{t('admin.producers_col_email')}</th>
                  <th>{t('admin.producers_col_status')}</th>
                </tr>
              </thead>
              <tbody>
                {producers.map((producer) => {
                  const isWorking = workingId === producer.id
                  const isPending = producer.status === 'pending'
                  const statusLabel = statusLabels[producer.status] || producer.status || '-'
                  const statusClassName = statusClassNames[producer.status] || 'inactive'

                  return (
                    <tr key={producer.id}>
                      <td>{producer.id}</td>
                      <td>{producer.name || '-'}</td>
                      <td>{producer.email || '-'}</td>
                      <td>
                        <div className="table-actions-row table-actions-row--nowrap">
                          <span className={`status-badge ${statusClassName}`}>
                            {statusLabel}
                          </span>
                          <button
                            type="button"
                            className="status-toggle-btn"
                            disabled={isWorking || !isPending}
                            onClick={() => handleApprove(producer.id)}
                          >
                            {t('admin.producers_approve')}
                          </button>
                          <button
                            type="button"
                            className="status-toggle-btn status-toggle-btn--danger"
                            disabled={isWorking || !isPending}
                            onClick={() => handleDelete(producer.id)}
                          >
                            {t('admin.producers_delete')}
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
        {!loading && !error && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="admin-luminous-action-btn"
              onClick={() => importInputRef.current?.click()}
            >
              Importer
            </button>
            {producers.length > 0 && (
              <button type="button" className="admin-luminous-action-btn" onClick={handleExportCsv}>
                {t('export_csv', { defaultValue: 'Export CSV' })}
              </button>
            )}
            {producers.length > 0 && (
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
      </section>
    </main>
  )
}
