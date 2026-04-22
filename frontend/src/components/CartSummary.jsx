import React from "react";
import { Link, useNavigate } from "react-router-dom";

function CartSummary({ total, onClear, hasItems }) {
  const navigate = useNavigate();

  return (
    <div
      style={{
        backgroundColor: "#1a1a1d",
        border: "1px solid #2a2a2e",
        borderRadius: "14px",
        padding: "20px",
        color: "white",
        marginTop: "24px",
      }}
    >
      <h2 style={{ marginTop: 0 }}>Résumé du panier</h2>

      <p style={{ fontSize: "24px", fontWeight: "700", marginBottom: "20px" }}>
        Total général : {total} EUR
      </p>

      <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
        <Link
          to="/shows"
          style={{
            textDecoration: "none",
            color: "white",
            border: "1px solid #666",
            padding: "12px 18px",
            borderRadius: "8px",
          }}
        >
          Continuer les achats
        </Link>

        <button
          type="button"
          onClick={onClear}
          disabled={!hasItems}
          style={{
            backgroundColor: "transparent",
            color: "#ff6b6b",
            border: "1px solid #ff6b6b",
            padding: "12px 18px",
            borderRadius: "8px",
            cursor: "pointer",
          }}
        >
          Vider le panier
        </button>

        <button
          type="button"
          onClick={() => navigate("/checkout")}
          disabled={!hasItems}
          style={{
            backgroundColor: "#e05a2b",
            color: "white",
            border: "none",
            padding: "12px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "700",
          }}
        >
          Commander
        </button>
      </div>
    </div>
  );
}

export default CartSummary;