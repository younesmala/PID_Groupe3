import { useState, useEffect } from 'react'
import './AdminReservations.css'

export default function AdminReservations() {
  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedReservation, setSelectedReservation] = useState(null)
  const [filters, setFilters] = useState({
    payment_status: '',
    status: ''
  })

  useEffect(() => {
    fetchReservations()
  }, [filters])

  const fetchReservations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.payment_status) params.append('payment_status', filters.payment_status)
      if (filters.status) params.append('status', filters.status)
      
      const response = await fetch(`/api/admin/reservations/?${params}`, {
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

  const handleStatusChange = async (reservationId, newStatus, field) => {
    try {
      const updateData = {}
      if (field === 'payment_status') {
        updateData.payment_status = newStatus
      } else {
        updateData.status = newStatus
      }

      const response = await fetch(`/api/admin/reservations/${reservationId}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      if (!response.ok) throw new Error('Erreur lors de la mise à jour')
      fetchReservations()
      setSelectedReservation(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteReservation = async (reservationId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette réservation?')) return
    
    try {
      const response = await fetch(`/api/admin/reservations/${reservationId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) throw new Error('Erreur lors de la suppression')
      fetchReservations()
      setSelectedReservation(null)
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="admin-reservations"><p>Chargement...</p></div>
  if (error) return <div className="admin-reservations error-message"><p>Erreur: {error}</p></div>

  return (
    <div className="admin-reservations">
      <h1>Gestion des réservations</h1>

      <div className="filters-section">
        <h3>Filtres</h3>
        <div className="filter-group">
          <label>
            Statut de paiement:
            <select
              value={filters.payment_status}
              onChange={(e) => setFilters({ ...filters, payment_status: e.target.value })}
            >
              <option value="">Tous</option>
              <option value="pending">En attente</option>
              <option value="paid">Payé</option>
              <option value="failed">Échec</option>
              <option value="refunded">Remboursé</option>
            </select>
          </label>

          <label>
            Statut de réservation:
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Tous</option>
              <option value="confirmed">Confirmée</option>
              <option value="cancelled">Annulée</option>
              <option value="pending">En attente</option>
            </select>
          </label>
        </div>
      </div>

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
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className={selectedReservation?.id === reservation.id ? 'selected' : ''}>
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
                <td>{reservation.status}</td>
                <td>
                  <button
                    onClick={() => setSelectedReservation(reservation)}
                    className="btn-details"
                  >
                    Détails
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedReservation && (
        <div className="reservation-detail-panel">
          <h2>Détails de la réservation #{selectedReservation.id}</h2>
          
          <div className="reservation-info">
            <div className="info-section">
              <h3>Utilisateur</h3>
              <p><strong>Nom:</strong> {selectedReservation.user.username}</p>
              <p><strong>Email:</strong> {selectedReservation.user.email}</p>
            </div>

            <div className="info-section">
              <h3>Spectacle</h3>
              <p><strong>Titre:</strong> {selectedReservation.representation.show.title}</p>
              <p><strong>Date/Heure:</strong> {new Date(selectedReservation.representation.when).toLocaleString()}</p>
              <p><strong>Quantité:</strong> {selectedReservation.quantity}</p>
            </div>

            <div className="info-section">
              <h3>Statuts</h3>
              <div className="status-controls">
                <label>
                  Statut de paiement:
                  <select
                    value={selectedReservation.payment_status}
                    onChange={(e) => handleStatusChange(selectedReservation.id, e.target.value, 'payment_status')}
                  >
                    <option value="pending">En attente</option>
                    <option value="paid">Payé</option>
                    <option value="failed">Échec</option>
                    <option value="refunded">Remboursé</option>
                  </select>
                </label>

                <label>
                  Statut de réservation:
                  <select
                    value={selectedReservation.status}
                    onChange={(e) => handleStatusChange(selectedReservation.id, e.target.value, 'status')}
                  >
                    <option value="confirmed">Confirmée</option>
                    <option value="cancelled">Annulée</option>
                    <option value="pending">En attente</option>
                  </select>
                </label>
              </div>
            </div>
          </div>

          <div className="action-buttons">
            <button
              onClick={() => handleDeleteReservation(selectedReservation.id)}
              className="btn btn-danger"
            >
              Supprimer
            </button>
            <button
              onClick={() => setSelectedReservation(null)}
              className="btn btn-secondary"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
