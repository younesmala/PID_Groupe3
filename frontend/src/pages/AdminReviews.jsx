import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getPendingReviews, moderateReview } from '../services/reviewService'
import './AdminReviews.css'

export default function AdminReviews() {
  const { t } = useTranslation()
  const currentLang = (window.location.pathname.split('/')[1] || 'fr').toLowerCase()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState(null)

  useEffect(() => {
    loadReviews()
  }, [])

  async function loadReviews() {
    setLoading(true)
    setError('')

    try {
      const data = await getPendingReviews()
      setReviews(Array.isArray(data) ? data : [])
    } catch {
      setError(t('admin_reviews_page.load_error'))
    } finally {
      setLoading(false)
    }
  }

  const pendingReviews = useMemo(
    () => reviews.filter((review) => review?.status === 'pending'),
    [reviews],
  )

  async function handleApprove(reviewId) {
    setWorkingId(reviewId)
    setError('')

    try {
      await moderateReview(reviewId, 'approved')
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, status: 'approved' } : review,
        ),
      )
    } catch {
      setError(t('admin_reviews_page.approve_error'))
    } finally {
      setWorkingId(null)
    }
  }

  async function handleReject(reviewId) {
    setWorkingId(reviewId)
    setError('')

    try {
      await moderateReview(reviewId, 'rejected')
      setReviews((prev) =>
        prev.map((review) =>
          review.id === reviewId ? { ...review, status: 'rejected' } : review,
        ),
      )
    } catch {
      setError(t('admin_reviews_page.reject_error'))
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <main className="admin-reviews-page">
      <section className="admin-reviews-card">
        <header className="admin-reviews-header">
          <div>
            <h1>{t('admin_reviews_page.title')}</h1>
          </div>
          <button type="button" className="admin-reviews-refresh" onClick={loadReviews}>
            {t('admin_reviews_page.refresh')}
          </button>
        </header>

        {loading && <p className="admin-reviews-state">{t('admin_reviews_page.loading')}</p>}
        {error && <p className="admin-reviews-state admin-reviews-state--error">{error}</p>}

        {!loading && !error && pendingReviews.length === 0 && (
          <p className="admin-reviews-state">{t('admin_reviews_page.empty')}</p>
        )}

        {!loading && pendingReviews.length > 0 && (
          <div className="admin-reviews-table-wrap">
            <table className="admin-reviews-table">
              <thead>
                <tr>
                  <th>{t('admin_reviews_page.col_id')}</th>
                  <th>{t('admin_reviews_page.col_show')}</th>
                  <th>{t('admin_reviews_page.col_user')}</th>
                  <th>{t('admin_reviews_page.col_rating')}</th>
                  <th>{t('admin_reviews_page.col_review')}</th>
                  <th>{t('admin_reviews_page.col_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {pendingReviews.map((review) => {
                  const isWorking = workingId === review.id
                  const showId = review.show
                  const hasShowSlug = Boolean(review.show_slug)

                  return (
                    <tr key={review.id}>
                      <td>{review.id}</td>
                      <td>
                        <span className="admin-reviews-show">{review.show_title || `#${showId}`}</span>
                      </td>
                      <td>{review.username || '-'}</td>
                      <td>{review.stars} / 5</td>
                      <td className="admin-reviews-text">{review.review}</td>
                      <td>
                        <div className="admin-reviews-actions">
                          <button
                            type="button"
                            className="admin-reviews-btn admin-reviews-btn--approve"
                            disabled={isWorking}
                            onClick={() => handleApprove(review.id)}
                          >
                            {t('admin_reviews_page.approve')}
                          </button>
                          <button
                            type="button"
                            className="admin-reviews-btn admin-reviews-btn--reject"
                            disabled={isWorking}
                            onClick={() => handleReject(review.id)}
                          >
                            {t('admin_reviews_page.reject')}
                          </button>
                          {hasShowSlug ? (
                            <Link className="admin-reviews-link" to={`/${currentLang}/shows/${review.show_slug}`}>
                              {t('admin_reviews_page.view_show')}
                            </Link>
                          ) : (
                            <span className="admin-reviews-link admin-reviews-link--disabled">{t('admin_reviews_page.slug_unavailable')}</span>
                          )}
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
