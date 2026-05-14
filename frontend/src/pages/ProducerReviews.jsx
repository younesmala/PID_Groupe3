import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getProducerReviews, moderateProducerReview } from '../services/reviewService'
import './AdminUsers.css'

export default function ProducerReviews() {
  const { t, i18n } = useTranslation()
  const currentLang = (window.location.pathname.split('/')[1] || 'fr').toLowerCase()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState(null)

  useEffect(() => {
    loadReviews()
  }, [])

  const sortByNewestId = (items) => [...items].sort((a, b) => (b.id || 0) - (a.id || 0))

  async function loadReviews() {
    setLoading(true)
    setError('')
    try {
      const data = await getProducerReviews()
      setReviews(sortByNewestId(Array.isArray(data) ? data : []))
    } catch {
      setError(t('producer_reviews_page.load_error'))
    } finally {
      setLoading(false)
    }
  }

  const statusLabels = useMemo(
    () => ({
      pending: t('producer_reviews_page.status_pending'),
      approved: t('producer_reviews_page.status_approved'),
      rejected: t('producer_reviews_page.status_rejected'),
    }),
    [t],
  )

  const statusClassNames = {
    pending: 'pending',
    approved: 'active',
    rejected: 'inactive',
  }

  async function handleApprove(reviewId) {
    setWorkingId(reviewId)
    setError('')
    try {
      await moderateProducerReview(reviewId, 'approved')
      setReviews((prev) =>
        sortByNewestId(
          prev.map((r) => (r.id === reviewId ? { ...r, status: 'approved' } : r)),
        ),
      )
    } catch {
      setError(t('producer_reviews_page.approve_error'))
    } finally {
      setWorkingId(null)
    }
  }

  async function handleReject(reviewId) {
    setWorkingId(reviewId)
    setError('')
    try {
      await moderateProducerReview(reviewId, 'rejected')
      setReviews((prev) =>
        sortByNewestId(
          prev.map((r) => (r.id === reviewId ? { ...r, status: 'rejected' } : r)),
        ),
      )
    } catch {
      setError(t('producer_reviews_page.reject_error'))
    } finally {
      setWorkingId(null)
    }
  }

  const pendingCount = reviews.filter((r) => r.status === 'pending').length

  return (
    <main className="admin-users">
      <section>
        <header className="admin-table-header-row">
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <Link to={`/${i18n.language}/producer/dashboard`} className="admin-luminous-action-btn">
                ← {t('back_to_dashboard')}
              </Link>
              <button type="button" onClick={loadReviews} className="admin-luminous-action-btn">
                {t('refresh_button')}
              </button>
            </div>
            <h1>{t('producer_reviews_page.title')}</h1>
            {pendingCount > 0 && (
              <p style={{ color: '#d9911d', fontWeight: 600 }}>
                {t('producer_reviews_page.pending_count', { count: pendingCount })}
              </p>
            )}
          </div>
        </header>

        {loading && <p>{t('producer_reviews_page.loading')}</p>}
        {error && <p className="admin-producers-state admin-producers-state--error">{error}</p>}

        {!loading && !error && reviews.length === 0 && (
          <p>{t('producer_reviews_page.empty')}</p>
        )}

        {!loading && reviews.length > 0 && (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>{t('producer_reviews_page.col_show')}</th>
                  <th>{t('producer_reviews_page.col_user')}</th>
                  <th>{t('producer_reviews_page.col_rating')}</th>
                  <th>{t('producer_reviews_page.col_status')}</th>
                  <th>{t('producer_reviews_page.col_review')}</th>
                  <th>{t('producer_reviews_page.col_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => {
                  const isWorking = workingId === review.id
                  const isPending = review.status === 'pending'
                  const statusLabel = statusLabels[review.status] || review.status || '-'
                  const statusClassName = statusClassNames[review.status] || 'inactive'

                  return (
                    <tr key={review.id}>
                      <td>
                        {review.show_slug ? (
                          <Link to={`/${currentLang}/shows/${review.show_slug}`} style={{ color: '#d9911d', fontWeight: 600 }}>
                            {review.show_title || `#${review.show}`}
                          </Link>
                        ) : (
                          <span>{review.show_title || `#${review.show}`}</span>
                        )}
                      </td>
                      <td>{review.username || '-'}</td>
                      <td>{review.stars} / 5</td>
                      <td>
                        <span className={`status-badge ${statusClassName}`}>
                          {statusLabel}
                        </span>
                      </td>
                      <td>{review.review}</td>
                      <td>
                        <div className="table-actions-row">
                          <button
                            type="button"
                            className="status-toggle-btn"
                            disabled={isWorking || !isPending}
                            onClick={() => handleApprove(review.id)}
                          >
                            {t('producer_reviews_page.approve')}
                          </button>
                          <button
                            type="button"
                            className="status-toggle-btn status-toggle-btn--danger"
                            disabled={isWorking || !isPending}
                            onClick={() => handleReject(review.id)}
                          >
                            {t('producer_reviews_page.reject')}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
