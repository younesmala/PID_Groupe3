import { useEffect, useState } from "react"
import { Link, useParams, useLocation } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { QRCodeSVG } from "qrcode.react"
import { getMyReservations } from "../services/reservationService"
import { getTitle, getDate, getQuantity, formatDate, buildSingleTicketQRData } from "../utils/ticketUtils"
import "./Confirmation.css"
import "./AccountPages.css"

function Confirmation() {
  const { t } = useTranslation()
  const { reservationId } = useParams()
  const { state } = useLocation()
  const reservationIds = state?.reservationIds || [reservationId]

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getMyReservations()
      .then((all) => {
        const ids = reservationIds.map(Number)
        setReservations(all.filter((r) => ids.includes(r.id || r.pk)))
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const tickets = reservations.flatMap((r) => {
    const qty = getQuantity(r)
    return Array.from({ length: qty }, (_, i) => ({ reservation: r, index: i + 1, total: qty }))
  })

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <h1 className="confirmation-title">
          {t("confirmation.title", "Paiement réussi")}
        </h1>

        <section className="confirmation-card">
          <div className="confirmation-icon">✓</div>
          <h2>{t("confirmation.thank_you", "Merci pour votre achat !")}</h2>
          <p>Votre commande a été enregistrée avec succès.</p>
          <div className="dev-notice">
            <p>
              Votre réservation <strong>#{reservationId}</strong> a bien été enregistrée.
            </p>
            <p>
              Vos billets sont également disponibles dans{" "}
              <strong>"Mes billets"</strong>.
            </p>
          </div>
        </section>

        {!loading && tickets.length > 0 && (
          <section className="confirmation-tickets">
            <h2 className="confirmation-tickets__title">
              Vos billets ({tickets.length})
            </h2>
            <div className="confirmation-tickets__grid">
              {tickets.map(({ reservation, index, total }) => (
                <div key={`${reservation.id}-${index}`} className="confirmation-ticket">
                  <div className="confirmation-ticket__info">
                    <p className="confirmation-ticket__show">{getTitle(reservation)}</p>
                    <p className="confirmation-ticket__date">{formatDate(getDate(reservation), t)}</p>
                    <p className="confirmation-ticket__num">Billet {index}/{total}</p>
                  </div>
                  <QRCodeSVG
                    value={buildSingleTicketQRData(reservation, index, total)}
                    size={140}
                    bgColor="#1a1a1d"
                    fgColor="#f8fafc"
                  />
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="confirmation-actions">
          <Link to="/" className="account-secondary-link">
            {t("confirmation.back_home", "Retour à l'accueil")}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Confirmation
