import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link } from "react-router-dom"
import { getCart } from "../services/cartService"
import { checkout } from "../services/reservationService"
import "./Checkout.css"
import "./AccountPages.css"

function Checkout() {
  const { t } = useTranslation()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)

  useEffect(() => {
    getCart()
      .then((data) => {
        setCart(data)
        if (!data.items || data.items.length === 0) {
          setError(t("cart.empty", "Votre panier est vide."))
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [t])

  async function handleSubmit() {
    if (submitting || !cart?.items?.length) return

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const data = await checkout()
      setSuccess(data)
      setCart({ items: [], total: "0.00" })
      window.dispatchEvent(
        new CustomEvent("cart-updated", {
          detail: { cartCount: 0 },
        })
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="checkout-page">{t("show.loading", "Chargement...")}</div>
  }

  if (success) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <h1 className="checkout-title">
            {t("checkout.confirmed", "Commande confirmée")}
          </h1>

          <p className="account-feedback account-feedback--success">
            {t(
              "checkout.success_msg",
              "Vos réservations ont été créées avec succès."
            )}
          </p>

          {success.reservation_ids?.length > 0 && (
            <section className="checkout-card">
              <h2>{t("checkout.reservation_numbers", "Numéros de réservation")}</h2>
              <ul>
                {success.reservation_ids.map((id) => (
                  <li key={id}>Réservation #{id}</li>
                ))}
              </ul>
            </section>
          )}

          <Link
            to="/profile"
            className="account-secondary-link"
            style={{ marginTop: "20px", display: "inline-block" }}
          >
            {t("profile.title", "Voir mon profil")}
          </Link>
        </div>
      </div>
    )
  }

  if (error && !cart?.items?.length) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <p className="account-feedback account-feedback--error">{error}</p>
          <Link
            to="/cart"
            className="account-secondary-link"
            style={{ marginTop: "20px", display: "inline-block" }}
          >
            {t("cart.continue", "Retour au panier")}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="checkout-page">
      <div className="checkout-container">
        <h1 className="checkout-title">
          {t("checkout.title", "Finaliser ma commande")}
        </h1>

        {error && (
          <p className="account-feedback account-feedback--error">{error}</p>
        )}

        <section className="checkout-card">
          <h2>{t("checkout.summary", "1. Résumé des articles")}</h2>

          {cart?.items?.map((item) => (
            <div
              key={`${item.representation_id}_${item.price_id}`}
              className="checkout-item"
            >
              <span>
                {item.show_title ||
                  item.representation?.split(" @ ")[0] ||
                  t("show.title", "Spectacle")}{" "}
                (x{item.quantity})
              </span>
              <span>
                {Number(item.subtotal ?? item.total_price ?? item.unit_price * item.quantity).toFixed(2)} €
              </span>
            </div>
          ))}

          <div className="checkout-total">
            <span>{t("checkout.total", "Total à régler")} :</span>
            <span className="price-highlight">{cart?.total} €</span>
          </div>
        </section>

        <div className="checkout-actions">
          <button
            className="account-submit"
            onClick={handleSubmit}
            disabled={submitting || !cart?.items?.length}
            style={submitting ? { cursor: "wait" } : {}}
          >
            {submitting
              ? t("checkout.processing", "Traitement...")
              : t("checkout.next", "Confirmer l'achat")}
          </button>

          <Link
            to="/cart"
            className="account-secondary-link"
            style={{ marginTop: "16px", display: "inline-block" }}
          >
            {t("cart.continue", "Retour au panier")}
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Checkout
