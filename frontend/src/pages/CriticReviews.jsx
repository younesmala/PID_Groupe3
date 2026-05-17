import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getMyCriticReviews } from '../services/reviewService'
import './AdminUsers.css'

const STATUS_CLASSES = { pending: 'pending', approved: 'active', rejected: 'inactive' }

export default function CriticReviews() {
  const { t, i18n } = useTranslation()
  const currentLang = (window.location.pathname.split('/')[1] || 'fr').toLowerCase()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    getMyCriticReviews()
      .then((data) => setReviews(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const statusLabel = (s) => ({
    pending: t('producer_reviews_page.status_pending'),
    approved: t('producer_reviews_page.status_approved'),
    rejected: t('producer_reviews_page.status_rejected'),
  }[s] || s)

  return (
    <main className="admin-users">
      <section>
        <header className="admin-table-header-row">
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <Link to={`/${i18n.language}/critic/dashboard`} className="admin-luminous-action-btn">
                ← {t('back_to_dashboard')}
              </Link>
              <button
                type="button"
                className="admin-luminous-action-btn"
                onClick={() => {
                  setLoading(true)
                  getMyCriticReviews()
                    .then((data) => setReviews(Array.isArray(data) ? data : []))
                    .catch((err) => setError(err.message))
                    .finally(() => setLoading(false))
                }}
              >
                {t('refresh_button')}
              </button>
            </div>
            <h1>{t('critic_reviews_page.title', { defaultValue: 'Mes avis' })}</h1>
            <p style={{ color: '#94a3b8', marginTop: 4 }}>
              {t('critic_reviews_page.subtitle', { defaultValue: 'Historique de vos critiques presse.' })}
            </p>
          </div>
        </header>

        {loading && <p>{t('producer_reviews_page.loading')}</p>}
        {error && <p className="admin-producers-state admin-producers-state--error">{error}</p>}
        {!loading && !error && reviews.length === 0 && (
          <p>{t('critic_reviews_page.empty', { defaultValue: "Vous n'avez pas encore écrit d'avis." })}</p>
        )}

        {!loading && reviews.length > 0 && (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>{t('producer_reviews_page.col_show')}</th>
                  <th>{t('producer_reviews_page.col_rating')}</th>
                  <th>{t('producer_reviews_page.col_review')}</th>
                  <th>{t('producer_reviews_page.col_status')}</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id}>
                    <td>
                      {review.show_slug ? (
                        <Link
                          to={`/${currentLang}/shows/${review.show_slug}`}
                          style={{ color: '#d9911d', fontWeight: 600 }}
                        >
                          {review.show_title || `#${review.show}`}
                        </Link>
                      ) : (
                        <span>{review.show_title || `#${review.show}`}</span>
                      )}
                    </td>
                    <td>{'★'.repeat(review.stars)}{'☆'.repeat(5 - review.stars)}</td>
                    <td style={{ maxWidth: 360 }}>{review.review}</td>
                    <td>
                      <span className={`status-badge ${STATUS_CLASSES[review.status] || 'inactive'}`}>
                        {statusLabel(review.status)}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap', color: '#94a3b8' }}>
                      {new Date(review.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
