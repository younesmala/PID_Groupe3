import { useEffect, useState } from 'react'
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

  return (
    <main className="admin-users">
      <section>
        <header>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
            <Link to={`/${i18n.language}/admin/dashboard`} style={topActionStyle}>
              ← {t('back_to_dashboard')}
            </Link>
            <button type="button" onClick={loadProducers} style={topActionStyle}>
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
      </section>
    </main>
  )
}
