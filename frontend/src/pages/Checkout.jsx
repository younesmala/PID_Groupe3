import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, Link } from "react-router-dom";
import { getCart } from "../services/cartService";
import "./Checkout.css";
import "./AccountPages.css";

//⭐ Soufiane → Page avis/reviews React connectée à /api/reviews/

function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fonction utilitaire pour récupérer le token CSRF de Django dans les cookies
  const getCookie = (name) => {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      const cookies = document.cookie.split(';');
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();
        if (cookie.substring(0, name.length + 1) === (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  };

  useEffect(() => {
    // On récupère les données du panier pour confirmer ce que l'utilisateur achète
    getCart()
      .then((data) => {
        setCart(data);
        if (!data.items || data.items.length === 0) {
          setError(t("cart.empty", "Votre panier est vide."));
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async () => {
    if (submitting || !cart?.items?.length) return;
    setSubmitting(true);
    try {
      const response = await fetch('/api/checkout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'), // Requis par Django pour les POST
        },
        body: JSON.stringify({}), // Corps vide ou données de commande
        credentials: 'include', // Requis pour envoyer les cookies de session (connexion)
      });

      if (response.ok) {
        const data = await response.json();
        // On redirige vers la confirmation avec l'ID de la réservation reçu du serveur
        navigate(`/confirmation/${data.reservation_id || 'success'}`);
      } else {
        alert(t("checkout.error_msg", "Une erreur est survenue lors de la validation."));
      }
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="checkout-page">{t("show.loading", "Chargement...")}</div>;
  }

  if (error) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <p className="account-feedback account-feedback--error">{error}</p>
          <Link to="/cart" className="account-secondary-link" style={{ marginTop: "20px", display: "inline-block" }}>
            {t("cart.continue", "Retour au panier")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">
          {t("checkout.title", "Finaliser ma commande")}
        </h1>

        {/* COMPOSANT 1 : RÉSUMÉ DE LA COMMANDE */}
        <section className="checkout-card">
          <h2>
            {t("checkout.summary", "1. Résumé des articles")}
          </h2>
          
          {cart?.items?.map((item) => (
            <div key={`${item.representation_id}_${item.price_id}`} 
                 className="checkout-item">
              <span>{item.show_title} (x{item.quantity})</span>
              <span>{(item.unit_price * item.quantity).toFixed(2)} €</span>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total à régler :</span>
            <span className="price-highlight">{cart?.total} €</span>
          </div>
        </section>

        {/* Le bouton pour l'étape suivante */}
        <div className="checkout-actions">
          <button 
            className="account-submit" 
            onClick={handleSubmit}
            disabled={submitting || !cart?.items?.length}
            style={submitting ? { cursor: 'wait' } : {}}
          >
            {submitting ? t("checkout.processing", "Traitement...") : t("checkout.next", "Confirmer l'achat")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;