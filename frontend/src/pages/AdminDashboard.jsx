import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPendingReviews } from '../services/reviewService'
import './ProducerDashboard.css'
import './AdminDashboard.css'
import './AccountPages.css'

const BASE = '/api'
const ADMIN_SECTIONS = [
  { path: '/admin/producers', labelKey: 'navbar.admin_producers' },
  { path: '/admin/shows', labelKey: 'navbar.admin_shows' },
  { path: '/admin/users', labelKey: 'navbar.admin_users' },
  { path: '/admin/reservations', labelKey: 'navbar.admin_reservations' },
  { path: '/admin/reviews', labelKey: 'navbar.admin_reviews' },
  { path: '/admin/locations', labelKey: 'navbar.admin_locations' },
  { path: '/admin/artists', labelKey: 'navbar.admin_artists' },
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
  const [pendingReviewsCount, setPendingReviewsCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchPendingProducers()
      .then((producers) => {
        const pending = producers.filter((p) => p.status === 'pending').length
        setPendingCount(pending)
      })
      .catch(() => setPendingCount(0))
      .finally(() => setLoading(false))

    getPendingReviews()
      .then((reviews) => {
        setPendingReviewsCount(Array.isArray(reviews) ? reviews.length : 0)
      })
      .catch(() => setPendingReviewsCount(0))

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
              {section.labelKey === 'navbar.admin_reviews' && pendingReviewsCount > 0 && (
                <span className="admin-link-count">{pendingReviewsCount}</span>
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
