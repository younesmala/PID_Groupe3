import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { API_ROOT } from '../services/api'
import './ProducerDashboard.css'
import './AdminDashboard.css'
import './AccountPages.css'

const BASE = API_ROOT
const ADMIN_SECTIONS = [
  { path: '/admin/producers', labelKey: 'navbar.admin_producers' },
  { path: '/admin/critics', labelKey: 'navbar.admin_critics' },
  { path: '/admin/shows', labelKey: 'navbar.admin_shows' },
  { path: '/admin/users', labelKey: 'navbar.admin_users' },
  { path: '/admin/reservations', labelKey: 'navbar.admin_reservations' },
  { path: '/admin/locations', labelKey: 'navbar.admin_locations' },
]

async function fetchPendingProducers() {
  const res = await fetch(`${BASE}/admin/producers/`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Unable to load pending producers')
  return res.json()
}

async function fetchAdminStats() {
  const res = await fetch(`${BASE}/admin/stats/`, {
    credentials: 'include',
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) throw new Error('Unable to load stats')
  return res.json()
}

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const normalizedLang = (i18n.language || 'fr').slice(0, 2).toLowerCase()
  const [pendingCount, setPendingCount] = useState(0)
  const [pendingCriticsCount, setPendingCriticsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchPendingProducers()
      .then((all) => {
        setPendingCount(all.filter((p) => p.status === 'pending' && p.role === 'PRODUCER').length)
        setPendingCriticsCount(all.filter((p) => p.status === 'pending' && p.role === 'PRESS_CRITIC').length)
      })
      .catch(() => { setPendingCount(0); setPendingCriticsCount(0) })
      .finally(() => setLoading(false))

    fetchAdminStats()
      .then((data) => setStats(data))
      .catch(() => setStats(null))
  }, [])

  function localizedPath(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `/${normalizedLang}${normalizedPath}`
  }

  const pendingShowsCount = stats?.pending_shows ?? 0

  return (
    <main className="account-shell">
      {stats && (
        <div className="admin-stats-row">
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.total_users}</span>
            <span className="admin-stat-label">Utilisateurs</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.total_shows}</span>
            <span className="admin-stat-label">Spectacles</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.total_reservations}</span>
            <span className="admin-stat-label">Réservations</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.pending_reservations}</span>
            <span className="admin-stat-label">En attente paiement</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-value">{stats.revenue.toFixed(2)}€</span>
            <span className="admin-stat-label">Revenus</span>
          </div>
        </div>
      )}

      <section className="pd-cards admin-cards-container">
        {ADMIN_SECTIONS.map((section) => (
          <Link
            key={section.path}
            to={localizedPath(section.path)}
            className="pd-card admin-link"
          >
            <span className="admin-link-content">
              <span className="pd-card-label">{t(section.labelKey)}</span>
              {section.labelKey === 'navbar.admin_producers' && pendingCount > 0 && (
                <span className="admin-link-count">{pendingCount}</span>
              )}
              {section.labelKey === 'navbar.admin_critics' && pendingCriticsCount > 0 && (
                <span className="admin-link-count">{pendingCriticsCount}</span>
              )}
{section.labelKey === 'navbar.admin_shows' && pendingShowsCount > 0 && (
                <span className="admin-link-count">{pendingShowsCount}</span>
              )}
            </span>
          </Link>
        ))}
      </section>
    </main>
  )
}
