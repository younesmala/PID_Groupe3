import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { adminApiFetch, parseAdminResponse } from '../services/adminApi'
import './AdminUsers.css'

export default function AdminUsers() {
  const { t, i18n } = useTranslation()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [updatingUserId, setUpdatingUserId] = useState(null)
  const importInputRef = useRef(null)

  const topActionStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '18px',
    border: '1px solid rgba(217, 119, 6, 0.26)', background: '#d9911d',
    color: '#0f172a', textDecoration: 'none', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(217, 145, 29, 0.22)'
  }

  const getRoleLabel = (role) => {
    if (role === 'USER') return t('admin_users_page.role_user')
    if (role === 'PRODUCER') return t('admin_users_page.role_producer')
    if (role === 'ADMIN') return t('admin_users_page.role_admin')
    return role
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const sortByNewestId = (items) => [...items].sort((a, b) => (b.id || 0) - (a.id || 0))

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await adminApiFetch('/admin/users/')
      const data = await parseAdminResponse(response, t('admin_users_page.load_error'))
      setUsers(sortByNewestId(Array.isArray(data) ? data : []))
    } catch (err) {
      setError(err.message)
      console.error('[AdminUsers] Failed to load users:', err)
    } finally {
      setLoading(false)
    }
  }

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

    return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''))
  }

  const normalizeRole = (value) => {
    const role = String(value || '').trim().toUpperCase()
    if (['ADMIN', 'ADMINISTRATEUR'].includes(role)) return 'ADMIN'
    if (['PRODUCER', 'PRODUCTEUR'].includes(role)) return 'PRODUCER'
    return 'USER'
  }

  const normalizeIsActive = (value) => {
    const status = String(value || '').trim().toLowerCase()
    return ['1', 'true', 'active', 'actif', 'actif(ve)', 'yes', 'oui'].includes(status)
  }

  const mapCsvToUsers = (csvRows) => {
    if (!csvRows.length) return []
    const header = csvRows[0].map((h) => String(h || '').trim().toLowerCase())
    const hasHeader = header.some((h) => ['id', 'username', 'email', 'role', 'status', 'statut'].includes(h))
    const dataRows = csvRows.slice(hasHeader ? 1 : 0)

    return dataRows.map((cells, index) => {
      const fullName = String(cells[1] || '').trim()
      const [firstName = '', ...rest] = fullName.split(' ')
      const lastName = rest.join(' ').trim()
      const idValue = Number(cells[0])

      return {
        id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
        first_name: firstName,
        last_name: lastName,
        username: String(cells[2] || `user_${Date.now()}_${index}`).trim(),
        email: String(cells[3] || '-').trim(),
        role: normalizeRole(cells[4]),
        is_active: normalizeIsActive(cells[5]),
      }
    })
  }

  const mapJsonToUsers = (items) => {
    if (!Array.isArray(items)) {
      throw new Error(t('admin_users_page.import_invalid', { defaultValue: 'Fichier invalide.' }))
    }

    return items.map((item, index) => {
      const idValue = Number(item?.id)
      return {
        id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
        first_name: String(item?.first_name || '').trim(),
        last_name: String(item?.last_name || '').trim(),
        username: String(item?.username || `user_${Date.now()}_${index}`).trim(),
        email: String(item?.email || '-').trim(),
        role: normalizeRole(item?.role),
        is_active: Boolean(item?.is_active),
      }
    })
  }

  const handleExportCsv = () => {
    const rows = users.map((user) => [
      user.id ?? '',
      user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : '-',
      user.username || '-',
      user.email || '-',
      user.role || 'USER',
      user.is_active ? t('admin_users_page.status_active') : t('admin_users_page.status_inactive'),
    ])

    const headers = [
      t('admin_users_page.col_id'),
      t('admin_users_page.col_full_name'),
      t('admin_users_page.col_username'),
      t('admin_users_page.col_email'),
      t('admin_users_page.col_role'),
      t('admin_users_page.col_status'),
    ]

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url
    link.setAttribute('download', `users-${date}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleExportJson = () => {
    const payload = users.map((user) => ({
      id: user.id ?? null,
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'USER',
      is_active: Boolean(user.is_active),
    }))

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url
    link.setAttribute('download', `users-${date}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleImportFile = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const extension = (file.name.split('.').pop() || '').toLowerCase()
      let imported = []

      if (extension === 'csv') {
        imported = mapCsvToUsers(parseCsv(text))
      } else if (extension === 'json') {
        imported = mapJsonToUsers(JSON.parse(text))
      } else {
        throw new Error(t('admin_users_page.import_format', { defaultValue: 'Formats acceptes: CSV, JSON.' }))
      }

      if (!imported.length) {
        throw new Error(t('admin_users_page.import_empty', { defaultValue: 'Aucune donnee a importer.' }))
      }

      setUsers(sortByNewestId(imported))
      setError(null)
    } catch (err) {
      setError(err.message || t('admin_users_page.import_error', { defaultValue: 'Impossible d importer ce fichier.' }))
    } finally {
      event.target.value = ''
    }
  }

  const handleToggleStatus = async (userId) => {
    try {
      setUpdatingUserId(userId)
      const response = await adminApiFetch(`/admin/users/${userId}/status/`, {
        method: 'PATCH',
      })
      const updatedUser = await parseAdminResponse(response, t('admin_users_page.status_update_error'))
      setUsers((currentUsers) =>
        sortByNewestId(
          currentUsers.map((user) => (user.id === updatedUser.id ? { ...user, ...updatedUser } : user))
        )
      )
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('[AdminUsers] Failed to toggle user status:', err)
    } finally {
      setUpdatingUserId(null)
    }
  }

  if (loading) return <div className="admin-users"><p>{t('admin_users_page.loading')}</p></div>
  if (error) return <div className="admin-users error-message"><p>{t('admin_users_page.error_label')}: {error}</p></div>

  return (
    <div className="admin-users">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Link to={`/${i18n.language}/admin/dashboard`} className="admin-luminous-action-btn">
          ← {t('back_to_dashboard')}
        </Link>
        <button type="button" onClick={fetchUsers} className="admin-luminous-action-btn">
          {t('refresh_button')}
        </button>
      </div>
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
      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
        <button type="button" className="admin-luminous-action-btn" onClick={() => importInputRef.current?.click()}>
          {t('import_button', { defaultValue: 'Importer' })}
        </button>
        {users.length > 0 && (
          <button type="button" className="admin-luminous-action-btn" onClick={handleExportCsv}>
            {t('export_csv', { defaultValue: 'Export CSV' })}
          </button>
        )}
        {users.length > 0 && (
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
    </div>
  )
}
