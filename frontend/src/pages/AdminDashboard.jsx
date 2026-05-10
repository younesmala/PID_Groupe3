import { useState, useEffect } from 'react'
import '../pages/AdminDashboard.css'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [showStats, setShowStats] = useState(null)
  const [users, setUsers] = useState([])
  const [shows, setShows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [editingShow, setEditingShow] = useState(null)
  const [showForm, setShowForm] = useState({
    title: '',
    description: '',
    duration: '',
    bookable: true
  })

  useEffect(() => {
    if (activeTab === 'overview') {
      fetchStats()
      fetchShowStats()
    } else if (activeTab === 'users') {
      fetchUsers()
    } else if (activeTab === 'shows') {
      fetchShows()
    }
  }, [activeTab])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques')
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err.message)
      console.error(err)
    }
  }

  const fetchShowStats = async () => {
    try {
      const response = await fetch('/api/stats/shows/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) throw new Error('Erreur lors du chargement des statistiques des spectacles')
      const data = await response.json()
      setShowStats(data)
    } catch (err) {
      console.error('Erreur stats shows:', err)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs')
      const data = await response.json()
      setUsers(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const fetchShows = async () => {
    try {
      const response = await fetch('/api/shows/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) throw new Error('Erreur lors du chargement des spectacles')
      const data = await response.json()
      setShows(Array.isArray(data) ? data : data.results || [])
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateShow = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/shows/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(showForm)
      })
      if (!response.ok) throw new Error('Erreur lors de la création du spectacle')
      setShowForm({ title: '', description: '', duration: '', bookable: true })
      fetchShows()
      setActiveTab('shows')
    } catch (err) {
      setError(err.message)
    }
  }

  const handleUpdateShow = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch(`/api/shows/${editingShow.slug}/`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(showForm)
      })
      if (!response.ok) throw new Error('Erreur lors de la mise à jour du spectacle')
      setEditingShow(null)
      setShowForm({ title: '', description: '', duration: '', bookable: true })
      fetchShows()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteShow = async (showSlug) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce spectacle ?')) return
    try {
      const response = await fetch(`/api/shows/${showSlug}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) throw new Error('Erreur lors de la suppression du spectacle')
      fetchShows()
    } catch (err) {
      setError(err.message)
    }
  }

  const startEditShow = (show) => {
    setEditingShow(show)
    setShowForm({
      title: show.title,
      description: show.description || '',
      duration: show.duration || '',
      bookable: show.bookable
    })
  }

  const cancelEdit = () => {
    setEditingShow(null)
    setShowForm({ title: '', description: '', duration: '', bookable: true })
  }

  if (loading && !stats && !showStats) return <div className="admin-dashboard"><p>Chargement...</p></div>
  if (error) return <div className="admin-dashboard error-message"><p>Erreur: {error}</p></div>

  return (
    <div className="admin-dashboard">
      <h1>Tableau de bord administrateur</h1>

      <div className="admin-tabs">
        <button
          className={activeTab === 'overview' ? 'active' : ''}
          onClick={() => setActiveTab('overview')}
        >
          Vue d'ensemble
        </button>
        <button
          className={activeTab === 'shows' ? 'active' : ''}
          onClick={() => setActiveTab('shows')}
        >
          Gestion des spectacles
        </button>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Gestion des utilisateurs
        </button>
      </div>

      {activeTab === 'overview' && (
        <>
          <div className="stats-grid">
            {stats && (
              <>
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
                  <p className="stat-value">{stats.revenue ? stats.revenue.toFixed(2) : '0.00'}€</p>
                </div>
              </>
            )}
          </div>

          {showStats && (
            <div className="show-stats-section">
              <h2>Statistiques des spectacles</h2>
              <div className="show-stats-summary">
                <p>Total des spectacles: {showStats.total_shows}</p>
              </div>
              <div className="show-stats-list">
                {showStats.shows.map(show => (
                  <div key={show.show_id} className="show-stat-card">
                    <h3>{show.title}</h3>
                    <p>Représentations: {show.total_representations}</p>
                    <p>Places disponibles: {show.total_available_seats}</p>
                    <p>Statut: {show.bookable ? 'Reservable' : 'Non reservable'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === 'shows' && (
        <div className="shows-management">
          <div className="section-header">
            <h2>Gestion des spectacles</h2>
            <button
              className="btn btn-primary"
              onClick={() => setEditingShow(null)}
            >
              Nouveau spectacle
            </button>
          </div>

          <form onSubmit={editingShow ? handleUpdateShow : handleCreateShow} className="show-form">
            <div className="form-group">
              <label>Titre:</label>
              <input
                type="text"
                value={showForm.title}
                onChange={(e) => setShowForm({...showForm, title: e.target.value})}
                required
              />
            </div>

            <div className="form-group">
              <label>Description:</label>
              <textarea
                value={showForm.description}
                onChange={(e) => setShowForm({...showForm, description: e.target.value})}
                rows="4"
              />
            </div>

            <div className="form-group">
              <label>Durée (minutes):</label>
              <input
                type="number"
                value={showForm.duration}
                onChange={(e) => setShowForm({...showForm, duration: e.target.value})}
              />
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={showForm.bookable}
                  onChange={(e) => setShowForm({...showForm, bookable: e.target.checked})}
                />
                Reservable
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingShow ? 'Mettre à jour' : 'Créer'}
              </button>
              {editingShow && (
                <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                  Annuler
                </button>
              )}
            </div>
          </form>

          <div className="shows-list">
            <h3>Liste des spectacles</h3>
            {shows.map(show => (
              <div key={show.id} className="show-item">
                <div className="show-info">
                  <h4>{show.title}</h4>
                  <p>Durée: {show.duration} min</p>
                  <p>Statut: {show.bookable ? 'Reservable' : 'Non reservable'}</p>
                  <p>Slug: {show.slug}</p>
                </div>
                <div className="show-actions">
                  <button
                    className="btn btn-secondary"
                    onClick={() => startEditShow(show)}
                  >
                    Modifier
                  </button>
                  <button
                    className="btn btn-danger"
                    onClick={() => handleDeleteShow(show.slug)}
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="users-management">
          <h2>Gestion des utilisateurs</h2>
          <div className="users-list">
            {users.map(user => (
              <div key={user.id} className="user-item">
                <div className="user-info">
                  <h4>{user.username}</h4>
                  <p>Email: {user.email}</p>
                  <p>Rôles: {user.roles ? user.roles.join(', ') : 'Aucun'}</p>
                  <p>Staff: {user.is_staff ? 'Oui' : 'Non'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
