import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './ProducerDashboard.css'
import './AdminDashboard.css'
import './AccountPages.css'

const ADMIN_SECTIONS = [
  { path: '/admin/producers', labelKey: 'navbar.admin_producers' },
  { path: '/admin/shows', labelKey: 'navbar.admin_shows' },
  { path: '/admin/users', labelKey: 'navbar.admin_users' },
  { path: '/admin/reservations', labelKey: 'navbar.admin_reservations' },
  { path: '/admin/reviews', labelKey: 'navbar.admin_reviews' },
  { path: '/admin/locations', labelKey: 'navbar.admin_locations' },
  { path: '/admin/artists', labelKey: 'navbar.admin_artists' },
]

export default function AdminDashboard() {
  const { t, i18n } = useTranslation()
  const normalizedLang = (i18n.language || 'fr').slice(0, 2).toLowerCase()

  function localizedPath(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    return `/${normalizedLang}${normalizedPath}`
  }

  return (
    <main className="account-shell">
      <section className="pd-cards admin-cards-container">
        {ADMIN_SECTIONS.map((section) => (
          <Link
            key={section.path}
            to={localizedPath(section.path)}
            className="pd-card admin-link"
          >
            <span className="pd-card-label">{t(section.labelKey)}</span>
          </Link>
        ))}
      </section>
    </main>
  )
}
