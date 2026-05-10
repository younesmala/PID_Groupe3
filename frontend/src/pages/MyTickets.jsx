import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { QRCodeSVG } from 'qrcode.react'
import { getMyReservations } from '../services/reservationService'
import './MyTickets.css'

function formatDate(value, t) {
  if (!value) return t('tickets.no_date')
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('fr-BE', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

function getTitle(r) {
  return r.show_title || r.show?.title || r.representation?.show?.title || r.title || `Billet #${r.id || '?'}`
}

function getDate(r) {
  return r.representation_date || r.booking_date || r.date || r.created_at || r.representation?.when
}

function getLocation(r, t) {
  return r.location_name || r.location?.name || r.representation?.location?.name || t('tickets.no_location')
}

function getQuantity(r) {
  return r.quantity || r.seats || r.tickets_count || 1
}

function buildQRData(reservation) {
  return JSON.stringify({
    id: reservation.id || reservation.pk,
    title: getTitle(reservation),
    date: getDate(reservation),
    quantity: getQuantity(reservation),
  })
}

function TicketCard({ reservation }) {
  const { t } = useTranslation()
  const [flipped, setFlipped] = useState(false)

  return (
    <article className="ticket-card" onClick={() => setFlipped((f) => !f)}>
      {!flipped ? (
        <div className="ticket-card__front">
          <span className="ticket-card__eyebrow">{t('tickets.digital')}</span>
          <h3>{getTitle(reservation)}</h3>
          <p className="ticket-card__date">{formatDate(getDate(reservation), t)}</p>
          <p className="ticket-card__location">{getLocation(reservation, t)}</p>
          <div className="ticket-card__footer">
            <strong>{getQuantity(reservation)} {t('tickets.places')}</strong>
            <span className="ticket-card__hint">{t('tickets.click_qr')}</span>
          </div>
        </div>
      ) : (
        <div className="ticket-card__back">
          <QRCodeSVG value={buildQRData(reservation)} size={160} bgColor="#0f1f35" fgColor="#f8fafc" />
          <p className="ticket-card__hint">{t('tickets.click_back')}</p>
        </div>
      )}
    </article>
  )
}

function MyTickets({ isLoggedIn }) {
  const { t } = useTranslation()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoggedIn) { setLoading(false); return }
    getMyReservations()
      .then((data) => setTickets(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isLoggedIn])

  if (!isLoggedIn) {
    return (
      <main className="tickets-shell">
        <h1>{t('tickets.title')}</h1>
        <p>{t('tickets.login_required')} <Link to="/signup">{t('connexion')}</Link></p>
      </main>
    )
  }

  return (
    <main className="tickets-shell">
      <h1>{t('tickets.title')}</h1>
      <p className="tickets-subtitle">{t('tickets.subtitle')}</p>

      {loading && <p className="tickets-status">{t('tickets.loading')}</p>}
      {error && <p className="tickets-status tickets-error">{error}</p>}
      {!loading && !error && tickets.length === 0 && (
        <p className="tickets-status">{t('tickets.empty')}</p>
      )}

      <div className="tickets-grid">
        {tickets.map((r, i) => (
          <TicketCard key={r.id || r.pk || i} reservation={r} />
        ))}
      </div>
    </main>
  )
}

export default MyTickets
