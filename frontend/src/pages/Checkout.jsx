import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { Link, useNavigate } from "react-router-dom"
import { getCart } from "../services/cartService"
import { checkout } from "../services/reservationService"
import "./Checkout.css"
import "./AccountPages.css"

const emptyPaymentDetails = {
  cardName: "",
  cardNumber: "",
  cardExpiry: "",
  cardCvc: "",
  bancontactName: "",
  klarnaEmail: "",
  klarnaPhone: "",
}

function formatCardNumber(value) {
  return value
    .replace(/\D/g, "")
    .slice(0, 16)
    .replace(/(.{4})/g, "$1 ")
    .trim()
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function formatPhoneNumber(value) {
  return value.replace(/[^\d+]/g, "").slice(0, 15)
}

function Checkout() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [ticketType, setTicketType] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")
  const [paymentDetails, setPaymentDetails] = useState(emptyPaymentDetails)
  const [showBancontactMessage, setShowBancontactMessage] = useState(false)

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

  function updatePaymentDetail(field, value) {
    setPaymentDetails((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handlePaymentMethodChange(value) {
    setPaymentMethod(value)
    setError(null)
    setShowBancontactMessage(false)
  }

  function validatePaymentDetails() {
    if (paymentMethod === "card") {
      if (
        !paymentDetails.cardName.trim() ||
        !paymentDetails.cardNumber.trim() ||
        !paymentDetails.cardExpiry.trim() ||
        !paymentDetails.cardCvc.trim()
      ) {
        return "Veuillez compléter les informations de carte bancaire."
      }

      if (paymentDetails.cardNumber.replace(/\s/g, "").length < 12) {
        return "Le numéro de carte bancaire semble invalide."
      }

      if (paymentDetails.cardCvc.trim().length < 3) {
        return "Le code CVC semble invalide."
      }
    }

    if (paymentMethod === "bancontact") {
      if (!paymentDetails.bancontactName.trim()) {
        return "Veuillez indiquer le nom du titulaire Bancontact."
      }
    }

    if (paymentMethod === "klarna") {
      if (!paymentDetails.klarnaEmail.trim() || !paymentDetails.klarnaPhone.trim()) {
        return "Veuillez compléter l'email et le téléphone pour Klarna."
      }

      if (!isValidEmail(paymentDetails.klarnaEmail)) {
        return "L'adresse email Klarna semble invalide."
      }

      const phoneDigits = paymentDetails.klarnaPhone.replace(/\D/g, "")

      if (phoneDigits.length < 8) {
        return "Le numéro de téléphone Klarna semble invalide."
      }
    }

    return null
  }

  async function handleSubmit() {
    if (submitting || !cart?.items?.length) return

    const validationError = validatePaymentDetails()

    if (validationError) {
      setError(validationError)
      return
    }

    setSubmitting(true)
    setError(null)

    if (paymentMethod === "bancontact") {
      setShowBancontactMessage(true)
      await new Promise((resolve) => setTimeout(resolve, 1200))
    }

    try {
      const data = await checkout({
        ticket_type: ticketType,
        payment_method: paymentMethod,
        payment_provider: "stripe",
      })

      window.dispatchEvent(
        new CustomEvent("cart-updated", {
          detail: { cartCount: 0 },
        })
      )

      const firstReservationId = data.reservation_ids?.[0] || "success"

      navigate(`/confirmation/${firstReservationId}`, {
        state: {
          reservationIds: data.reservation_ids || [],
          ticketType,
          paymentMethod,
        },
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="checkout-page">
        {t("show.loading", "Chargement...")}
      </div>
    )
  }

  if (error && !cart?.items?.length) {
    return (
      <div className="checkout-page">
        <div className="checkout-container">
          <p className="account-feedback account-feedback--error">{error}</p>

          <Link to="/cart" className="account-secondary-link">
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
          <h2>1. Résumé des articles</h2>

          {cart?.items?.map((item) => (
            <div
              key={`${item.representation_id}_${item.price_id}`}
              className="checkout-item"
            >
              <span>
                {item.show_title ||
                  item.representation?.split(" @ ")[0] ||
                  "Spectacle"}{" "}
                (x{item.quantity})
              </span>

              <span>
                {Number(
                  item.subtotal ??
                    item.total_price ??
                    item.unit_price * item.quantity
                ).toFixed(2)}{" "}
                €
              </span>
            </div>
          ))}

          <div className="checkout-total">
            <span>Total à régler :</span>
            <span className="price-highlight">{cart?.total} €</span>
          </div>
        </section>

        <section className="checkout-card">
          <h2>2. Type de billet</h2>

          <label>
            <input
              type="radio"
              value="standard"
              checked={ticketType === "standard"}
              onChange={(e) => setTicketType(e.target.value)}
            />{" "}
            Standard
          </label>

          <br />

          <label>
            <input
              type="radio"
              value="vip"
              checked={ticketType === "vip"}
              onChange={(e) => setTicketType(e.target.value)}
            />{" "}
            VIP
          </label>
        </section>

        <section className="checkout-card">
          <h2>3. Paiement</h2>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <input
              type="radio"
              value="card"
              checked={paymentMethod === "card"}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
            />

            <span>Carte bancaire</span>

            <img
              src="/paiement-logos/visa.svg"
              alt="Visa"
              style={{
                height: "64px",
                objectFit: "contain",
              }}
            />

            <img
              src="/paiement-logos/mastercard.svg"
              alt="Mastercard"
              style={{
                height: "64px",
                objectFit: "contain",
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "10px",
            }}
          >
            <input
              type="radio"
              value="bancontact"
              checked={paymentMethod === "bancontact"}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
            />

            <span>Bancontact</span>

            <img
              src="/paiement-logos/bancontact.svg"
              alt="Bancontact"
              style={{
                height: "64px",
                objectFit: "contain",
              }}
            />
          </label>

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginBottom: "24px",
            }}
          >
            <input
              type="radio"
              value="klarna"
              checked={paymentMethod === "klarna"}
              onChange={(e) => handlePaymentMethodChange(e.target.value)}
            />

            <span>Klarna</span>

            <img
              src="/paiement-logos/klarna.svg"
              alt="Klarna"
              style={{
                height: "64px",
                objectFit: "contain",
              }}
            />
          </label>

          {paymentMethod === "card" && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Nom du titulaire de la carte
                </label>

                <input
                  type="text"
                  value={paymentDetails.cardName}
                  onChange={(e) =>
                    updatePaymentDetail("cardName", e.target.value)
                  }
                  style={{
                    width: "400px",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Numéro de la carte
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={19}
                  value={paymentDetails.cardNumber}
                  onChange={(e) =>
                    updatePaymentDetail(
                      "cardNumber",
                      formatCardNumber(e.target.value)
                    )
                  }
                  style={{
                    width: "400px",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "64px",
                }}
              >
                <div style={{ width: "140px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "600",
                    }}
                  >
                    MM/AA
                  </label>

                  <input
                    type="text"
                    maxLength={5}
                    value={paymentDetails.cardExpiry}
                    onChange={(e) =>
                      updatePaymentDetail("cardExpiry", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ width: "140px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "6px",
                      fontWeight: "600",
                    }}
                  >
                    CVC
                  </label>

                  <input
                    type="text"
                    maxLength={4}
                    value={paymentDetails.cardCvc}
                    onChange={(e) =>
                      updatePaymentDetail("cardCvc", e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {paymentMethod === "bancontact" && (
            <div style={{ marginTop: "20px" }}>
              <div style={{ marginBottom: "18px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Nom du titulaire Bancontact
                </label>

                <input
                  type="text"
                  value={paymentDetails.bancontactName}
                  onChange={(e) =>
                    updatePaymentDetail("bancontactName", e.target.value)
                  }
                  style={{
                    width: "400px",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                />
              </div>

              {showBancontactMessage && (
                <p
                  style={{
                    marginTop: "12px",
                    color: "#bdbdbd",
                    fontSize: "14px",
                  }}
                >
                  Vous serez redirigé vers Bancontact pour confirmer le
                  paiement.
                </p>
              )}
            </div>
          )}

          {paymentMethod === "klarna" && (
            <div style={{ marginTop: "20px", display: "grid", gap: "18px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Adresse email Klarna
                </label>

                <input
                  type="email"
                  value={paymentDetails.klarnaEmail}
                  onChange={(e) =>
                    updatePaymentDetail("klarnaEmail", e.target.value)
                  }
                  style={{
                    width: "400px",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "6px",
                    fontWeight: "600",
                  }}
                >
                  Numéro de téléphone
                </label>

                <input
                  type="tel"
                  value={paymentDetails.klarnaPhone}
                  onChange={(e) =>
                    updatePaymentDetail(
                      "klarnaPhone",
                      formatPhoneNumber(e.target.value)
                    )
                  }
                  style={{
                    width: "400px",
                    padding: "10px",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>
          )}
        </section>

        <div
          className="checkout-actions"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            marginTop: "30px",
          }}
        >
          <button
            className="account-submit"
            onClick={handleSubmit}
            disabled={submitting || !cart?.items?.length}
            style={{
              minWidth: "180px",
              height: "56px",
              borderRadius: "999px",
            }}
          >
            {submitting ? "Traitement..." : "Payer"}
          </button>

          <Link
            to="/cart"
            className="account-secondary-link"
            style={{
              minWidth: "180px",
              height: "56px",
              borderRadius: "999px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              textDecoration: "none",
              marginTop: "0",
            }}
          >
            Retour au panier
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Checkout