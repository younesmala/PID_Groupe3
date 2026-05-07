import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { getMyReservations } from '../services/reservationService'
import './MyTickets.css'

function formatDate(value) {
  if (!value) return 'Date non disponible'
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

function getLocation(r) {
  return r.location_name || r.location?.name || r.representation?.location?.name || 'Lieu non disponible'
}

function getQuantity(r) {
  return r.quantity || r.seats || r.tickets_count || 1
}

function buildQRData(reservation) {
  return JSON.stringify({
    id: reservation.id || reservation.pk,
    title: getTitle(reservation),
    date: getDate(reservation),
    location: getLocation(reservation),
    quantity: getQuantity(reservation),
  })
}

function TicketCard({ reservation }) {
  const [flipped, setFlipped] = useState(false)

  return (
    <article className="ticket-card" onClick={() => setFlipped((f) => !f)}>
      {!flipped ? (
        <div className="ticket-card__front">
          <span className="ticket-card__eyebrow">Billet numerique</span>
          <h3>{getTitle(reservation)}</h3>
          <p className="ticket-card__date">{formatDate(getDate(reservation))}</p>
          <p className="ticket-card__location">{getLocation(reservation)}</p>
          <div className="ticket-card__footer">
            <strong>{getQuantity(reservation)} place(s)</strong>
            <span className="ticket-card__hint">Cliquez pour le QR code</span>
          </div>
        </div>
      ) : (
        <div className="ticket-card__back">
          <QRCodeSVG value={buildQRData(reservation)} size={160} bgColor="#0f1f35" fgColor="#f8fafc" />
          <p className="ticket-card__hint">Cliquez pour revenir</p>
        </div>
      )}
    </article>
  )
}

function MyTickets({ isLoggedIn }) {
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
        <h1>Mes Billets</h1>
        <p>Vous devez être <Link to="/signup">connecté</Link> pour voir vos billets.</p>
      </main>
    )
  }

  return (
    <main className="tickets-shell">
      <h1>Mes Billets</h1>
      <p className="tickets-subtitle">Cliquez sur un billet pour afficher son QR code.</p>

      {loading && <p className="tickets-status">Chargement...</p>}
      {error && <p className="tickets-status tickets-error">{error}</p>}
      {!loading && !error && tickets.length === 0 && (
        <p className="tickets-status">Aucun billet disponible pour le moment.</p>
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
