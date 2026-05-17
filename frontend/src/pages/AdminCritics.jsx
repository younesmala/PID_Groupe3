import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminApiFetch, parseAdminResponse } from '../services/adminApi'
import './AdminUsers.css'

export default function AdminCritics() {
  const { t, i18n } = useTranslation()
  const [critics, setCritics] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState(null)
  const importInputRef = useRef(null)

  useEffect(() => {
    loadCritics()
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

  async function loadCritics() {
    setLoading(true)
    setError('')
    try {
      const res = await adminApiFetch('/admin/producers/')
      const data = await parseAdminResponse(res, t('admin.critics_error_load', { defaultValue: 'Impossible de charger les critiques.' }))
      const all = Array.isArray(data) ? data : []
      setCritics(sortByNewestId(all.filter((p) => p.role === 'PRESS_CRITIC')))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleApprove(criticId) {
    setWorkingId(criticId)
    setError('')
    try {
      await parseAdminResponse(
        await adminApiFetch(`/admin/producers/${criticId}/`, { method: 'PATCH' }),
        t('admin.producers_error_approve')
      )
      setCritics((prev) =>
        sortByNewestId(prev.map((c) => (c.id === criticId ? { ...c, status: 'approved' } : c)))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setWorkingId(null)
    }
  }

  async function handleDelete(criticId) {
    setWorkingId(criticId)
    setError('')
    try {
      await parseAdminResponse(
        await adminApiFetch(`/admin/producers/${criticId}/`, { method: 'DELETE' }),
        t('admin.producers_error_delete')
      )
      setCritics((prev) =>
        sortByNewestId(prev.map((c) => (c.id === criticId ? { ...c, status: 'deleted' } : c)))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setWorkingId(null)
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
            <button type="button" onClick={loadCritics} className="admin-luminous-action-btn">
              {t('refresh_button')}
            </button>
          </div>
          <h1>{t('navbar.admin_critics', { defaultValue: 'Critiques presse' })}</h1>
        </header>

        {loading && <p>{t('producer.loading')}</p>}
        {error && <p className="admin-producers-state admin-producers-state--error">{error}</p>}

        {!loading && !error && critics.length === 0 && (
          <p>{t('admin.critics_empty', { defaultValue: 'Aucune demande de critique presse.' })}</p>
        )}

        {!loading && critics.length > 0 && (
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
                {critics.map((critic) => {
                  const isWorking = workingId === critic.id
                  const isPending = critic.status === 'pending'
                  const statusLabel = statusLabels[critic.status] || critic.status || '-'
                  const statusClassName = statusClassNames[critic.status] || 'inactive'

                  return (
                    <tr key={critic.id}>
                      <td>{critic.id}</td>
                      <td>{critic.name || '-'}</td>
                      <td>{critic.email || '-'}</td>
                      <td>
                        <div className="table-actions-row table-actions-row--nowrap">
                          <span className={`status-badge ${statusClassName}`}>
                            {statusLabel}
                          </span>
                          <button
                            type="button"
                            className="status-toggle-btn"
                            disabled={isWorking || !isPending}
                            onClick={() => handleApprove(critic.id)}
                          >
                            {t('admin.producers_approve')}
                          </button>
                          <button
                            type="button"
                            className="status-toggle-btn status-toggle-btn--danger"
                            disabled={isWorking || !isPending}
                            onClick={() => handleDelete(critic.id)}
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
