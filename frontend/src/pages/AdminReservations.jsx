import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './AdminUsers.css'

export default function AdminReservations() {
  const { t, i18n } = useTranslation()
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/reservations/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) throw new Error(t('admin_reservations_page.load_error'))
      const data = await response.json()
      setReservations(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="admin-users"><p>{t('admin_reservations_page.loading')}</p></div>
  if (error) return <div className="admin-users error-message"><p>{t('admin_reservations_page.error_label')}: {error}</p></div>

  return (
    <div className="admin-users">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
        <Link to={`/${i18n.language}/admin/dashboard`} style={topActionStyle}>
          ← {t('back_to_dashboard')}
        </Link>
        <button type="button" onClick={fetchReservations} style={topActionStyle}>
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
    </div>
  )
}
