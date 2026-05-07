import { useState, useEffect } from 'react'
import './AdminUsers.css'

export default function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState(null)
  const [newRole, setNewRole] = useState('')

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/users/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      })
      if (!response.ok) throw new Error('Erreur lors du chargement des utilisateurs')
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

  const handleAddRole = async (userId, role) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      })
      if (!response.ok) throw new Error('Erreur lors de l\'ajout du rôle')
      setNewRole('')
      fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  const handleRemoveRole = async (userId, role) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/roles/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role })
      })
      if (!response.ok) throw new Error('Erreur lors de la suppression du rôle')
      fetchUsers()
    } catch (err) {
      setError(err.message)
    }
  }

  if (loading) return <div className="admin-users"><p>Chargement...</p></div>
  if (error) return <div className="admin-users error-message"><p>Erreur: {error}</p></div>

  return (
    <div className="admin-users">
      <h1>Gestion des utilisateurs</h1>
      
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom d'utilisateur</th>
              <th>Email</th>
              <th>Nom</th>
              <th>Rôles</th>
              <th>Actif</th>
              <th>Inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={selectedUser?.id === user.id ? 'selected' : ''}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.first_name} {user.last_name}</td>
                <td>
                  <div className="roles-list">
                    {user.roles.length > 0 ? (
                      user.roles.map((role) => (
                        <span key={role} className="role-tag">
                          {role}
                          <button
                            onClick={() => handleRemoveRole(user.id, role)}
                            className="remove-role-btn"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <span className="no-roles">Aucun rôle</span>
                    )}
                  </div>
                </td>
                <td>{user.is_active ? '✓' : '✗'}</td>
                <td>{new Date(user.date_joined).toLocaleDateString()}</td>
                <td>
                  <button
                    onClick={() => setSelectedUser(user)}
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

      {selectedUser && (
        <div className="user-detail-panel">
          <h2>Détails utilisateur: {selectedUser.username}</h2>
          <div className="user-info">
            <p><strong>Email:</strong> {selectedUser.email}</p>
            <p><strong>Nom:</strong> {selectedUser.first_name} {selectedUser.last_name}</p>
            <p><strong>Staff:</strong> {selectedUser.is_staff ? 'Oui' : 'Non'}</p>
            <p><strong>Actif:</strong> {selectedUser.is_active ? 'Oui' : 'Non'}</p>
          </div>

          <div className="add-role-section">
            <h3>Ajouter un rôle</h3>
            <div className="role-input-group">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
              >
                <option value="">Sélectionner un rôle</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MEMBER">MEMBER</option>
                <option value="PRODUCER">PRODUCER</option>
              </select>
              <button
                onClick={() => {
                  if (newRole) handleAddRole(selectedUser.id, newRole)
                }}
                className="btn btn-primary"
              >
                Ajouter
              </button>
            </div>
          </div>

          <button
            onClick={() => setSelectedUser(null)}
            className="btn btn-secondary"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  )
}
