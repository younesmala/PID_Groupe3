import { useState, useEffect } from 'react'
import './AdminReservations.css'

export default function AdminReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
      if (!response.ok) throw new Error('Erreur lors du chargement des réservations')
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

  if (loading) return <div className="admin-reservations"><p>Chargement...</p></div>
  if (error) return <div className="admin-reservations error-message"><p>Erreur: {error}</p></div>

  return (
    <div className="admin-reservations">
      <h1>Gestion des réservations</h1>

      <div className="reservations-table-wrapper">
        <table className="reservations-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Utilisateur</th>
              <th>Email</th>
              <th>Spectacle</th>
              <th>Date réservation</th>
              <th>Quantité</th>
              <th>Statut paiement</th>
              <th>Somme payée</th>
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
                  <span className={`payment-status ${reservation.payment_status}`}>
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
