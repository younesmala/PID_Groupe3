import { useState, useEffect } from 'react'
import '../pages/AdminDashboard.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques')
      const data = await response.json()
      setStats(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="admin-dashboard"><p>Chargement...</p></div>
  if (error) return <div className="admin-dashboard error-message"><p>Erreur: {error}</p></div>
  if (!stats) return <div className="admin-dashboard"><p>Aucune donnée disponible</p></div>

  return (
    <div className="admin-dashboard">
      <h1>Tableau de bord administrateur</h1>
      
      <div className="stats-grid">
        <div className="stat-card total-users">
          <h3>Utilisateurs</h3>
          <p className="stat-value">{stats.total_users}</p>
        </div>
        
        <div className="stat-card total-shows">
          <h3>Spectacles</h3>
          <p className="stat-value">{stats.total_shows}</p>
        </div>

        <div className="stat-card total-reservations">
          <h3>Réservations</h3>
          <p className="stat-value">{stats.total_reservations}</p>
        </div>

        <div className="stat-card pending-reservations">
          <h3>En attente de paiement</h3>
          <p className="stat-value">{stats.pending_reservations}</p>
        </div>

        <div className="stat-card revenue">
          <h3>Revenus</h3>
          <p className="stat-value">{stats.revenue.toFixed(2)}€</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <h2>Actions rapides</h2>
        <div className="action-buttons">
          <a href="/admin/users" className="btn btn-primary">Gérer les utilisateurs</a>
          <a href="/admin/reservations" className="btn btn-primary">Gérer les réservations</a>
          <a href="/locations" className="btn btn-primary">Voir les lieux</a>
        </div>
      </div>
    </div>
  )
}
