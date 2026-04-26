import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { getCart } from "../services/cartService";
import "./Checkout.css";
import "./AccountPages.css";

function Checkout() {
  const { t } = useTranslation();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // On récupère les données du panier pour confirmer ce que l'utilisateur achète
    getCart()
      .then(setCart)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="checkout-page">{t("show.loading", "Chargement...")}</div>;
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
          <button className="account-submit">
            {t("checkout.next", "Continuer vers le paiement")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Checkout;