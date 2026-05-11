import { useState, useEffect } from 'react'
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

export default function AdminUsers() {
  const { t } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingUserId, setUpdatingUserId] = useState(null)

  const getRoleLabel = (role) => {
    if (role === 'USER') return t('admin_users_page.role_user')
    if (role === 'PRODUCER') return t('admin_users_page.role_producer')
    if (role === 'ADMIN') return t('admin_users_page.role_admin')
    return role
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await apiFetch('/admin/users/')
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.detail || t('admin_users_page.load_error'))
      }
      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      setUpdatingUserId(userId)
      const response = await apiFetch(`/admin/users/${userId}/status/`, {
        method: 'PATCH',
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        throw new Error(data?.detail || t('admin_users_page.status_update_error'))
      }
      const updatedUser = await response.json()
      setUsers((currentUsers) =>
        currentUsers.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user))
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (loading) return <div className="admin-users"><p>{t('admin_users_page.loading')}</p></div>
  if (error) return <div className="admin-users error-message"><p>{t('admin_users_page.error_label')}: {error}</p></div>

  return (
    <div className="admin-users">
      <h1>{t('admin_users_page.title')}</h1>
      
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>{t('admin_users_page.col_id')}</th>
              <th>{t('admin_users_page.col_full_name')}</th>
              <th>{t('admin_users_page.col_username')}</th>
              <th>{t('admin_users_page.col_email')}</th>
              <th>{t('admin_users_page.col_role')}</th>
              <th>{t('admin_users_page.col_status')}</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '-'}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge role-${user.role.toLowerCase()}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </td>
                <td>
                  <div className="status-cell">
                    <span className={`status-badge ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? `✓ ${t('admin_users_page.status_active')}` : `✗ ${t('admin_users_page.status_inactive')}`}
                    </span>
                    {user.role !== 'ADMIN' && (
                      <button
                        type="button"
                        className="status-toggle-btn"
                        onClick={() => handleToggleStatus(user.id)}
                        disabled={updatingUserId === user.id}
                      >
                        {updatingUserId === user.id
                          ? t('admin_users_page.updating')
                          : user.is_active
                            ? t('admin_users_page.deactivate')
                            : t('admin_users_page.activate')}
                      </button>
                    )}
                    {user.role === 'ADMIN' && <span className="status-toggle-placeholder" aria-hidden="true" />}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
