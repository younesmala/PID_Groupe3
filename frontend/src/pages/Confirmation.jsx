import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import "./Confirmation.css";
import "./AccountPages.css";

function Confirmation() {
  const { t } = useTranslation();
  const { reservationId } = useParams();

  const handleDownloadTicket = () => {
    alert("Le téléchargement du ticket sera disponible une fois l'API connectée.");
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        <h1 className="confirmation-title">
          {t("confirmation.title", "Commande Confirmée")}
        </h1>

        <section className="confirmation-card">
          <div className="confirmation-icon">✓</div>
          <h2>{t("confirmation.thank_you", "Merci pour votre achat !")}</h2>
          <p>Votre commande a été enregistrée avec succès.</p>
          
          <div className="dev-notice">
            <p><strong>🛠️ Statut : En cours de développement</strong></p>
            <p>
              Bientôt, vous pourrez voir votre <strong>QR Code</strong> ici pour la réservation 
              <code> #{reservationId}</code>.
            </p>
            <p>
              Appel API prévu : <code>/api/reservations/{reservationId}/ticket/</code>
            </p>
            <button onClick={handleDownloadTicket} className="account-submit" style={{ marginTop: '20px', width: '100%' }}>
              Télécharger mon ticket (Bientôt)
            </button>
          </div>
        </section>

        <div className="confirmation-actions">
          <Link to="/" className="account-secondary-link">
            {t("confirmation.back_home", "Retour à l'accueil")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Confirmation;