import { useEffect, useMemo, useRef, useState } from 'react'
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
  const importInputRef = useRef(null)

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

  function escapeCsvValue(value) {
    const text = String(value ?? '')
    return `"${text.replace(/"/g, '""')}"`
  }

  function parseCsv(text) {
    const rows = []
    let row = []
    let field = ''
    let inQuotes = false

    for (let i = 0; i < text.length; i += 1) {
      const char = text[i]
      const next = text[i + 1]

      if (char === '"') {
        if (inQuotes && next === '"') {
          field += '"'
          i += 1
        } else {
          inQuotes = !inQuotes
        }
      } else if (char === ',' && !inQuotes) {
        row.push(field)
        field = ''
      } else if ((char === '\n' || char === '\r') && !inQuotes) {
        if (char === '\r' && next === '\n') i += 1
        row.push(field)
        rows.push(row)
        row = []
        field = ''
      } else {
        field += char
      }
    }

    if (field.length > 0 || row.length > 0) {
      row.push(field)
      rows.push(row)
    }

    return rows.filter((r) => r.some((cell) => String(cell).trim() !== ''))
  }

  function normalizeStatus(value) {
    const status = String(value || '').trim().toLowerCase()
    if (['approved', 'approuve', 'approuvé'].includes(status)) return 'approved'
    if (['rejected', 'refuse', 'refusé'].includes(status)) return 'rejected'
    return 'pending'
  }

  function mapCsvToReviews(csvRows) {
    if (!csvRows.length) return []
    const header = csvRows[0].map((h) => String(h || '').trim().toLowerCase())
    const hasHeader = header.some((h) => ['id', 'show', 'user', 'rating', 'status', 'review'].includes(h))
    const dataRows = csvRows.slice(hasHeader ? 1 : 0)

    return dataRows.map((cells, index) => {
      const idValue = Number(cells[0])
      const starsValue = Number(cells[3])
      const showCell = String(cells[1] || '').trim()
      const parsedShowId = Number(showCell)

      return {
        id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
        show: Number.isFinite(parsedShowId) ? parsedShowId : null,
        show_title: showCell || '-',
        username: String(cells[2] || '-').trim() || '-',
        stars: Number.isFinite(starsValue) ? Math.max(0, Math.min(5, starsValue)) : 0,
        status: normalizeStatus(cells[4]),
        review: String(cells[5] || '-').trim() || '-',
        show_slug: '',
      }
    })
  }

  function mapJsonToReviews(items) {
    if (!Array.isArray(items)) {
      throw new Error(t('admin_reviews_page.import_invalid', { defaultValue: 'Fichier invalide.' }))
    }

    return items.map((item, index) => {
      const idValue = Number(item?.id)
      const starsValue = Number(item?.stars)
      const showId = Number(item?.show)
      return {
        id: Number.isFinite(idValue) && idValue > 0 ? idValue : Date.now() + index,
        show: Number.isFinite(showId) ? showId : null,
        show_title: String(item?.show_title || '-').trim() || '-',
        username: String(item?.username || '-').trim() || '-',
        stars: Number.isFinite(starsValue) ? Math.max(0, Math.min(5, starsValue)) : 0,
        status: normalizeStatus(item?.status),
        review: String(item?.review || '-').trim() || '-',
        show_slug: String(item?.show_slug || '').trim(),
      }
    })
  }

  function handleExportCsv() {
    const headers = [
      t('admin_reviews_page.col_id'),
      t('admin_reviews_page.col_show'),
      t('admin_reviews_page.col_user'),
      t('admin_reviews_page.col_rating'),
      t('admin_reviews_page.col_status', { defaultValue: 'Statut' }),
      t('admin_reviews_page.col_review'),
    ]

    const rows = reviews.map((review) => [
      review.id ?? '',
      review.show_title || review.show || '-',
      review.username || '-',
      review.stars ?? 0,
      statusLabels[review.status] || review.status || '-',
      review.review || '-',
    ])

    const csvContent = [headers, ...rows].map((row) => row.map(escapeCsvValue).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csvContent}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url
    link.setAttribute('download', `reviews-${date}.csv`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  function handleExportJson() {
    const payload = reviews.map((review) => ({
      id: review.id ?? null,
      show: review.show ?? null,
      show_title: review.show_title || '-',
      show_slug: review.show_slug || '',
      username: review.username || '-',
      stars: review.stars ?? 0,
      status: review.status || 'pending',
      review: review.review || '-',
    }))

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    link.href = url
    link.setAttribute('download', `reviews-${date}.json`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(event) {
    const file = event.target.files?.[0]
    if (!file) return

    setError('')

    try {
      const text = await file.text()
      const extension = (file.name.split('.').pop() || '').toLowerCase()
      let imported = []

      if (extension === 'csv') {
        imported = mapCsvToReviews(parseCsv(text))
      } else if (extension === 'json') {
        imported = mapJsonToReviews(JSON.parse(text))
      } else {
        throw new Error(t('admin_reviews_page.import_format', { defaultValue: 'Formats acceptes: CSV, JSON.' }))
      }

      if (!imported.length) {
        throw new Error(t('admin_reviews_page.import_empty', { defaultValue: 'Aucune donnee a importer.' }))
      }

      setReviews(sortByNewestId(imported))
    } catch (err) {
      setError(err.message || t('admin_reviews_page.import_error', { defaultValue: 'Impossible d importer ce fichier.' }))
    } finally {
      event.target.value = ''
    }
  }

  return (
    <main className="admin-users">
      <section>
        <header className="admin-table-header-row">
          <div>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <Link to={`/${i18n.language}/admin/dashboard`} className="admin-luminous-action-btn">
                ← {t('back_to_dashboard')}
              </Link>
              <button type="button" onClick={loadReviews} className="admin-luminous-action-btn">
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
        {!loading && (
          <div style={{ display: 'flex', gap: '10px', marginTop: '12px', flexWrap: 'wrap' }}>
            <button type="button" className="admin-luminous-action-btn" onClick={() => importInputRef.current?.click()}>
              {t('import_button', { defaultValue: 'Importer' })}
            </button>
            {reviews.length > 0 && (
              <button type="button" className="admin-luminous-action-btn" onClick={handleExportCsv}>
                {t('export_csv', { defaultValue: 'Export CSV' })}
              </button>
            )}
            {reviews.length > 0 && (
              <button type="button" className="admin-luminous-action-btn" onClick={handleExportJson}>
                {t('export_json', { defaultValue: 'Export JSON' })}
              </button>
            )}
            <input
              ref={importInputRef}
              type="file"
              accept=".csv,.json,application/json,text/csv"
              onChange={handleImportFile}
              style={{ display: 'none' }}
            />
          </div>
        )}
      </section>
    </main>
  )
}
