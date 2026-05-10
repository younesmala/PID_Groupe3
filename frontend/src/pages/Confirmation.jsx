import { useTranslation } from "react-i18next"
import { Link, useParams } from "react-router-dom"
import "./Confirmation.css"
import "./AccountPages.css"

function Confirmation() {
  const { t } = useTranslation()
  const { reservationId } = useParams()

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <h1 className="confirmation-title">
          {t("confirmation.title", "Paiement réussi")}
        </h1>

        <section className="confirmation-card">
          <div className="confirmation-icon">✓</div>

          <h2>
            {t("confirmation.thank_you", "Merci pour votre achat !")}
          </h2>

          <p>Votre commande a été enregistrée avec succès.</p>

          <div className="dev-notice">
            <p>
              Votre réservation <strong>#{reservationId}</strong> a bien été
              enregistrée.
            </p>

            <p>
              Votre billet sera bientôt disponible dans l’espace{" "}
              <strong>“Mes billets”</strong>.
            </p>
          </div>
        </section>

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