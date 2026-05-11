import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './AdminProducers.css'

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
  const { t } = useTranslation()
  const [producers, setProducers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState(null)

  useEffect(() => {
    loadPendingProducers()
  }, [])

  async function loadPendingProducers() {
    setLoading(true)
    setError('')

    try {
      const res = await apiFetch('/admin/producers/')
      const data = await res.json().catch(() => [])

      if (!res.ok) {
        throw new Error(data?.detail || t('admin.producers_error_load'))
      }

      const pendingOnly = (Array.isArray(data) ? data : []).filter(
        (producer) => producer?.status === 'pending',
      )
      setProducers(pendingOnly)
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

      setProducers((prev) => prev.filter((producer) => producer.id !== producerId))
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

      setProducers((prev) => prev.filter((producer) => producer.id !== producerId))
    } catch (err) {
      setError(err.message || t('admin.producers_error_delete'))
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <main className="admin-producers-page">
      <section className="admin-producers-card">
        <header className="admin-producers-header">
          <h1>{t('navbar.admin_producers')}</h1>
        </header>

        {loading && <p className="admin-producers-state">{t('producer.loading')}</p>}
        {error && <p className="admin-producers-state admin-producers-state--error">{error}</p>}

        {!loading && !error && producers.length === 0 && (
          <p className="admin-producers-state">{t('admin.producers_empty')}</p>
        )}

        {!loading && producers.length > 0 && (
          <div className="admin-producers-table-wrap">
            <table className="admin-producers-table">
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

                  return (
                    <tr key={producer.id}>
                      <td>{producer.id}</td>
                      <td>{producer.name || '-'}</td>
                      <td>{producer.email || '-'}</td>
                      <td>
                        <div className="admin-producers-actions">
                          <button
                            type="button"
                            className="admin-producers-btn admin-producers-btn--approve"
                            disabled={isWorking || !isPending}
                            onClick={() => handleApprove(producer.id)}
                          >
                            {t('admin.producers_approve')}
                          </button>
                          <button
                            type="button"
                            className="admin-producers-btn admin-producers-btn--delete"
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
