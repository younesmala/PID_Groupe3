import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getCart,
  updateCart,
  removeFromCart,
  clearCart,
} from "../services/cartService";
import CartItem from "../components/CartItem";
import CartSummary from "../components/CartSummary";

function Cart() {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCartData = () => {
    setLoading(true);
    setError(null);

    getCart()
      .then((data) => {
        const cartItems = data.items || [];
        setItems(cartItems);
        setTotal(data.total ?? "0.00");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCartData();
  }, []);

  const handleUpdate = (item, nextQuantity) => {
    if (!Number.isInteger(nextQuantity)) {
      alert(t("cart.invalid_quantity", "Quantité invalide."));
      return;
    }

    if (nextQuantity < 0) {
      alert(t("cart.negative_quantity", "La quantité ne peut pas être négative."));
      return;
    }

    updateCart(item.representation_id, nextQuantity, item.price_id)
      .then(() => fetchCartData())
      .catch((err) => alert(err.message));
  };

  const handleRemove = (repId, priceId) => {
    if (!window.confirm(t("cart.confirm_remove", "Supprimer cet article du panier ?"))) {
      return;
    }

    removeFromCart(repId, priceId)
      .then(() => fetchCartData())
      .catch((err) => alert(err.message));
  };

  const handleClear = () => {
    if (!window.confirm(t("cart.confirm_clear", "Vider tout le panier ?"))) {
      return;
    }

    clearCart()
      .then(() => fetchCartData())
      .catch((err) => alert(err.message));
  };

  if (loading) {
    return (
      <div
        style={{
          backgroundColor: "#111113",
          color: "white",
          minHeight: "100vh",
          padding: "40px",
        }}
      >
        {t("cart.loading", "Chargement...")}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          backgroundColor: "#111113",
          color: "#ff6b6b",
          minHeight: "100vh",
          padding: "40px",
        }}
      >
        {t("cart.error_label", "Erreur")} : {error}
      </div>
    );
  }

  return (
    <div
      style={{
        backgroundColor: "#111113",
        minHeight: "100vh",
        color: "white",
        padding: "40px 20px",
      }}
    >
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "36px", marginBottom: "24px" }}>
          {t("cart.title", "Mon panier")}
        </h1>

        {items.length === 0 ? (
          <div
            style={{
              backgroundColor: "#1a1a1d",
              border: "1px solid #2a2a2e",
              borderRadius: "14px",
              padding: "30px",
            }}
          >
            <p style={{ fontSize: "20px", marginBottom: "20px" }}>
              {t("cart.empty", "Votre panier est vide.")}
            </p>
            <Link
              to="/shows"
              style={{
                display: "inline-block",
                backgroundColor: "#e05a2b",
                color: "white",
                textDecoration: "none",
                padding: "12px 18px",
                borderRadius: "8px",
                fontWeight: "700",
              }}
            >
              {t("cart.view_catalog", "Voir le catalogue")}
            </Link>
          </div>
        ) : (
          <>
            {items.map((item) => {
              const itemKey = `${item.representation_id}_${item.price_id}`;
              return (
                <CartItem
                  key={itemKey}
                  item={item}
                  onUpdate={handleUpdate}
                  onRemove={handleRemove}
                />
              );
            })}

            <CartSummary
              total={total}
              onClear={handleClear}
              hasItems={items.length > 0}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default Cart;