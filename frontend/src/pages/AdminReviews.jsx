import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { getAllReviews, moderateReview } from '../services/reviewService'
import './AdminUsers.css'

export default function AdminReviews() {
  const { t, i18n } = useTranslation()
  const currentLang = (window.location.pathname.split('/')[1] || 'fr').toLowerCase()
  const [reviews, setReviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [workingId, setWorkingId] = useState(null)

  const topActionStyle = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    padding: '10px 20px', borderRadius: '18px',
    border: '1px solid rgba(217, 119, 6, 0.26)', background: '#d9911d',
    color: '#0f172a', textDecoration: 'none', fontSize: '0.95rem',
    fontWeight: 700, cursor: 'pointer',
    boxShadow: '0 8px 20px rgba(217, 145, 29, 0.22)'
  }

  useEffect(() => {
    loadReviews()
  }, [])

  const sortByNewestId = (items) => [...items].sort((a, b) => (b.id || 0) - (a.id || 0))

  async function loadReviews() {
    setLoading(true)
    setError('')

    try {
      const data = await getAllReviews()
      setReviews(sortByNewestId(Array.isArray(data) ? data : []))
    } catch {
      setError(t('admin_reviews_page.load_error'))
    } finally {
      setLoading(false)
    }
  }

  const statusLabels = useMemo(
    () => ({
      pending: t('admin_reviews_page.status_pending', { defaultValue: 'En attente' }),
      approved: t('admin_reviews_page.status_approved', { defaultValue: 'Approuvé' }),
      rejected: t('admin_reviews_page.status_rejected', { defaultValue: 'Refusé' }),
    }),
    [t],
  )

  const statusClassNames = useMemo(
    () => ({
      pending: 'pending',
      approved: 'active',
      rejected: 'inactive',
    }),
    [],
  )

  async function handleApprove(reviewId) {
    setWorkingId(reviewId)
    setError('')

    try {
      await moderateReview(reviewId, 'approved')
      setReviews((prev) =>
        sortByNewestId(
          prev.map((review) =>
            review.id === reviewId ? { ...review, status: 'approved' } : review,
          ),
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
        sortByNewestId(
          prev.map((review) =>
            review.id === reviewId ? { ...review, status: 'rejected' } : review,
          ),
        ),
      )
    } catch {
      setError(t('admin_reviews_page.reject_error'))
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <main className="admin-users">
      <section>
        <header className="admin-table-header-row">
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <Link to={`/${i18n.language}/admin/dashboard`} style={topActionStyle}>
                ← {t('back_to_dashboard')}
              </Link>
              <button type="button" onClick={loadReviews} style={topActionStyle}>
                {t('refresh_button')}
              </button>
            </div>
            <h1>{t('admin_reviews_page.title')}</h1>
          </div>
        </header>

        {loading && <p>{t('admin_reviews_page.loading')}</p>}
        {error && <p className="admin-producers-state admin-producers-state--error">{error}</p>}

        {!loading && !error && reviews.length === 0 && (
          <p>{t('admin_reviews_page.empty')}</p>
        )}

        {!loading && reviews.length > 0 && (
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>{t('admin_reviews_page.col_id')}</th>
                  <th>{t('admin_reviews_page.col_show')}</th>
                  <th>{t('admin_reviews_page.col_user')}</th>
                  <th>{t('admin_reviews_page.col_rating')}</th>
                  <th>{t('admin_reviews_page.col_status', { defaultValue: 'Statut' })}</th>
                  <th>{t('admin_reviews_page.col_review')}</th>
                  <th>{t('admin_reviews_page.col_actions')}</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => {
                  const isWorking = workingId === review.id
                  const showId = review.show
                  const hasShowSlug = Boolean(review.show_slug)
                  const isPending = review.status === 'pending'
                  const statusLabel = statusLabels[review.status] || review.status || '-'
                  const statusClassName = statusClassNames[review.status] || 'inactive'

                  return (
                    <tr key={review.id}>
                      <td>{review.id}</td>
                      <td>
                        <span>{review.show_title || `#${showId}`}</span>
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
                            {t('admin_reviews_page.approve')}
                          </button>
                          <button
                            type="button"
                            className="status-toggle-btn status-toggle-btn--danger"
                            disabled={isWorking || !isPending}
                            onClick={() => handleReject(review.id)}
                          >
                            {t('admin_reviews_page.reject')}
                          </button>
                          {hasShowSlug ? (
                            <Link className="status-toggle-btn table-link-btn" to={`/${currentLang}/shows/${review.show_slug}`}>
                              {t('admin_reviews_page.view_show')}
                            </Link>
                          ) : (
                            <span className="status-toggle-btn status-toggle-placeholder-visible">{t('admin_reviews_page.slug_unavailable')}</span>
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
