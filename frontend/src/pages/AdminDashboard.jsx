import { useState, useEffect } from 'react'
import '../pages/AdminDashboard.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [selectedShow, setSelectedShow] = useState(null)
  const [showDetail, setShowDetail] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/stats/shows/', {
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

  const fetchShowDetail = async (showId) => {
    try {
      const response = await fetch(`/api/stats/shows/${showId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) throw new Error('Erreur lors du chargement des détails')
      const data = await response.json()
      setShowDetail(data)
    } catch (err) {
      console.error(err)
    }
  }

  const handleShowClick = (show) => {
    setSelectedShow(show.show_id)
    fetchShowDetail(show.show_id)
  }

  if (loading) return <div className="admin-dashboard"><p>Chargement...</p></div>
  if (error) return <div className="admin-dashboard error-message"><p>Erreur: {error}</p></div>
  if (!stats) return <div className="admin-dashboard"><p>Aucune donnée disponible</p></div>

  return (
    <div className="admin-dashboard">
      <h1>Tableau de bord administrateur</h1>
      
      <div className="stats-header">
        <div className="stat-card total-shows">
          <h3>Total des spectacles</h3>
          <p className="stat-value">{stats.total_shows}</p>
        </div>
      </div>

      <div className="dashboard-content">
        {/* Liste des spectacles */}
        <div className="shows-section">
          <h2>Spectacles</h2>
          <div className="shows-grid">
            {stats.shows && stats.shows.map((show) => (
              <div
                key={show.show_id}
                className={`show-card ${selectedShow === show.show_id ? 'active' : ''}`}
                onClick={() => handleShowClick(show)}
              >
                <h4>{show.title}</h4>
                <div className="show-info">
                  <p><strong>Statut:</strong> {show.bookable ? '✓ Réservable' : '✗ Non réservable'}</p>
                  <p><strong>Représentations:</strong> {show.total_representations}</p>
                  <p><strong>Places disponibles:</strong> {show.total_available_seats}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Détails du spectacle sélectionné */}
        {showDetail && (
          <div className="show-detail-section">
            <h2>Détails: {showDetail.title}</h2>
            <div className="detail-header">
              <p><strong>Total représentations:</strong> {showDetail.total_representations}</p>
              <p><strong>Statut:</strong> {showDetail.bookable ? '✓ Réservable' : '✗ Non réservable'}</p>
            </div>

            <h3>Représentations</h3>
            <div className="representations-table">
              <table>
                <thead>
                  <tr>
                    <th>Date/Heure</th>
                    <th>Lieu</th>
                    <th>Places disponibles</th>
                  </tr>
                </thead>
                <tbody>
                  {showDetail.representations && showDetail.representations.map((rep) => (
                    <tr key={rep.representation_id}>
                      <td>{rep.schedule}</td>
                      <td>{rep.location || 'N/A'}</td>
                      <td className={rep.available_seats === 0 ? 'no-seats' : ''}>
                        {rep.available_seats}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
