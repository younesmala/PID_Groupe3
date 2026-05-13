import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { apiUrl } from '../services/api'
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

  const response = await fetch(apiUrl(path), {
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

export default function AdminReservations() {
  const { t, i18n } = useTranslation()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const importInputRef = useRef(null)

  const topActionStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '18px',
    border: '1px solid rgba(217, 119, 6, 0.26)', background: '#d9911d',
    color: '#0f172a', textDecoration: 'none', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(217, 145, 29, 0.22)'
  }

  const getPaymentStatusClass = (status) => {
    if (status === 'paid') return 'active'
    if (status === 'pending') return 'pending'
    if (status === 'refunded') return 'refunded'
    return 'inactive'
  }

  const formatEuroAmount = (value) => {
    const amount = Number(value || 0)
    if (!Number.isFinite(amount)) return '0 EUR'

    const formatter = new Intl.NumberFormat('fr-BE', {
      minimumFractionDigits: Number.isInteger(amount) ? 0 : 2,
      maximumFractionDigits: 2
    })

    return `${formatter.format(amount)} EUR`
  }

  useEffect(() => {
    fetchReservations()
  }, [])

  const sortByMostRecent = (items) =>
    [...items].sort((a, b) => {
      const dateA = new Date(a?.booking_date || 0).getTime()
      const dateB = new Date(b?.booking_date || 0).getTime()
      if (dateA !== dateB) return dateB - dateA
      return (b?.id || 0) - (a?.id || 0)
    })

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await apiFetch('/admin/reservations/')
      if (!response.ok) throw new Error(t('admin_reservations_page.load_error'))
      const data = await response.json()
      setReservations(sortByMostRecent(Array.isArray(data) ? data : []))
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error(err)
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

  const mapCsvToReservations = (csvRows) => {
    if (!csvRows.length) return []
    const header = csvRows[0].map((h) => String(h || '').trim().toLowerCase())
    const hasHeader = header.some((h) => ['id', 'email', 'show', 'payment_status', 'statut'].includes(h))
    const dataRows = csvRows.slice(hasHeader ? 1 : 0)

    return dataRows.map((cells, index) => {
      const idValue = Number(cells[0])
      const quantityValue = Number(cells[5])
      const totalPaidValue = Number(cells[7])
      const bookingDate = cells[4] ? new Date(cells[4]) : new Date()
      return {
        id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
        user: {
          username: String(cells[1] || '-').trim() || '-',
          email: String(cells[2] || '-').trim() || '-',
        },
        representation: {
          show: {
            title: String(cells[3] || '-').trim() || '-',
          },
        },
        booking_date: Number.isNaN(bookingDate.getTime()) ? new Date().toISOString() : bookingDate.toISOString(),
        quantity: Number.isFinite(quantityValue) ? quantityValue : 1,
        payment_status: String(cells[6] || 'pending').trim().toLowerCase() || 'pending',
        total_paid: Number.isFinite(totalPaidValue) ? totalPaidValue : 0,
      }
    })
  }

  const mapJsonToReservations = (items) => {
    if (!Array.isArray(items)) {
      throw new Error(t('admin_reservations_page.import_invalid', { defaultValue: 'Fichier invalide.' }))
    }

    return items.map((item, index) => {
      const idValue = Number(item?.id)
      const quantityValue = Number(item?.quantity)
      const totalPaidValue = Number(item?.total_paid)
      const bookingDate = item?.booking_date ? new Date(item.booking_date) : new Date()
      return {
        id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
        user: {
          username: String(item?.user?.username || item?.username || '-').trim() || '-',
          email: String(item?.user?.email || item?.email || '-').trim() || '-',
        },
        representation: {
          show: {
            title: String(item?.representation?.show?.title || item?.show_title || '-').trim() || '-',
          },
        },
        booking_date: Number.isNaN(bookingDate.getTime()) ? new Date().toISOString() : bookingDate.toISOString(),
        quantity: Number.isFinite(quantityValue) ? quantityValue : 1,
        payment_status: String(item?.payment_status || 'pending').trim().toLowerCase() || 'pending',
        total_paid: Number.isFinite(totalPaidValue) ? totalPaidValue : 0,
      }
    })
  }

  const handleExportCsv = () => {
    const headers = [
      t('admin_reservations_page.col_id'),
      t('admin_reservations_page.col_user'),
      t('admin_reservations_page.col_email'),
      t('admin_reservations_page.col_show'),
      t('admin_reservations_page.col_booking_date'),
      t('admin_reservations_page.col_quantity'),
      t('admin_reservations_page.col_payment_status'),
      t('admin_reservations_page.col_total_paid'),
    ]

    const rows = reservations.map((reservation) => [
      reservation.id ?? '',
      reservation.user?.username || '-',
      reservation.user?.email || '-',
      reservation.representation?.show?.title || '-',
      reservation.booking_date ? new Date(reservation.booking_date).toLocaleString() : '-',
      reservation.quantity ?? 0,
      reservation.payment_status || '-',
      reservation.total_paid ?? 0,
    ])

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url
    link.setAttribute('download', `reservations-${date}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  const handleExportJson = () => {
    const payload = reservations.map((reservation) => ({
      id: reservation.id ?? null,
      user: {
        username: reservation.user?.username || '-',
        email: reservation.user?.email || '-',
      },
      show_title: reservation.representation?.show?.title || '-',
      booking_date: reservation.booking_date || null,
      quantity: reservation.quantity ?? 0,
      payment_status: reservation.payment_status || '-',
      total_paid: reservation.total_paid ?? 0,
    }))

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url
    link.setAttribute('download', `reservations-${date}.json`)
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
        imported = mapCsvToReservations(parseCsv(text))
      } else if (extension === 'json') {
        imported = mapJsonToReservations(JSON.parse(text))
      } else {
        throw new Error(t('admin_reservations_page.import_format', { defaultValue: 'Formats acceptes: CSV, JSON.' }))
      }

      if (!imported.length) {
        throw new Error(t('admin_reservations_page.import_empty', { defaultValue: 'Aucune donnee a importer.' }))
      }

      setReservations(sortByMostRecent(imported))
      setError(null)
    } catch (err) {
      setError(err.message || t('admin_reservations_page.import_error', { defaultValue: 'Impossible d importer ce fichier.' }))
    } finally {
      event.target.value = ''
    }
  }

  if (loading) return <div className="admin-users"><p>{t('admin_reservations_page.loading')}</p></div>
  if (error) return <div className="admin-users error-message"><p>{t('admin_reservations_page.error_label')}: {error}</p></div>

  return (
    <div className="admin-users">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Link to={`/${i18n.language}/admin/dashboard`} className="admin-luminous-action-btn">
          ← {t('back_to_dashboard')}
        </Link>
        <button type="button" onClick={fetchReservations} className="admin-luminous-action-btn">
          {t('refresh_button')}
        </button>
      </div>
      <h1>{t('admin_reservations_page.title')}</h1>

      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>{t('admin_reservations_page.col_id')}</th>
              <th>{t('admin_reservations_page.col_user')}</th>
              <th>{t('admin_reservations_page.col_email')}</th>
              <th>{t('admin_reservations_page.col_show')}</th>
              <th>{t('admin_reservations_page.col_booking_date')}</th>
              <th>{t('admin_reservations_page.col_quantity')}</th>
              <th>{t('admin_reservations_page.col_payment_status')}</th>
              <th>{t('admin_reservations_page.col_total_paid')}</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id}>
                <td>{reservation.id}</td>
                <td>{reservation.user.username}</td>
                <td>{reservation.user.email}</td>
                <td>{reservation.representation.show.title}</td>
                <td>{new Date(reservation.booking_date).toLocaleString()}</td>
                <td>{reservation.quantity}</td>
                <td>
                  <span className={`status-badge ${getPaymentStatusClass(reservation.payment_status)}`}>
                    {reservation.payment_status}
                  </span>
                </td>
                <td>{formatEuroAmount(reservation.total_paid)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
        <button type="button" className="admin-luminous-action-btn" onClick={() => importInputRef.current?.click()}>
          {t('import_button', { defaultValue: 'Importer' })}
        </button>
        {reservations.length > 0 && (
          <button type="button" className="admin-luminous-action-btn" onClick={handleExportCsv}>
            {t('export_csv', { defaultValue: 'Export CSV' })}
          </button>
        )}
        {reservations.length > 0 && (
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
