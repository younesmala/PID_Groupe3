import React from "react";

function CartItem({ item, onUpdate, onRemove }) {
  const itemKey = `${item.representation_id}_${item.price_id}`;
  const [showName, rawDate] = item.representation.split(" @ ");
  const maxSeats = item.available_seats ?? item.quantity;

  const formattedDate = rawDate
    ? new Date(rawDate).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const decreaseQuantity = () => {
    const nextQuantity = item.quantity - 1;

    if (nextQuantity < 1) {
      onRemove(item.representation_id, item.price_id);
      return;
    }

    onUpdate(item, nextQuantity);
  };

  const increaseQuantity = () => {
    const nextQuantity = item.quantity + 1;

    if (nextQuantity > maxSeats) {
      alert("Impossible d'ajouter plus de places disponibles.");
      return;
    }

    onUpdate(item, nextQuantity);
  };

  return (
    <div
      key={itemKey}
      style={{
        backgroundColor: "#1a1a1d",
        border: "1px solid #2a2a2e",
        borderRadius: "14px",
        padding: "18px",
        marginBottom: "16px",
        color: "white",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: "20px" }}>{showName}</h3>
        <p style={{ margin: "4px 0", color: "#cfcfcf" }}>
          <strong>Date :</strong> {formattedDate}
        </p>
        <p style={{ margin: "4px 0", color: "#cfcfcf" }}>
          <strong>Tarif :</strong> {item.price_type}
        </p>
        <p style={{ margin: "4px 0", color: "#cfcfcf" }}>
          <strong>Prix unitaire :</strong> {item.unit_price} EUR
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "12px",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button
            type="button"
            onClick={decreaseQuantity}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#2a2a2e",
              color: "white",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            -
          </button>

          <div
            style={{
              minWidth: "48px",
              textAlign: "center",
              padding: "10px 12px",
              borderRadius: "8px",
              backgroundColor: "#111113",
              border: "1px solid #444",
              fontWeight: "700",
            }}
          >
            {item.quantity}
          </div>

          <button
            type="button"
            onClick={increaseQuantity}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: "#e05a2b",
              color: "white",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "700",
            }}
          >
            +
          </button>
        </div>

        <div style={{ textAlign: "right" }}>
          <p
            style={{
              margin: "0 0 10px 0",
              fontWeight: "700",
              fontSize: "18px",
            }}
          >
            Sous-total : {item.total_price ?? item.subtotal} EUR
          </p>
          <button
            type="button"
            onClick={() => onRemove(item.representation_id, item.price_id)}
            style={{
              backgroundColor: "transparent",
              color: "#ff6b6b",
              border: "1px solid #ff6b6b",
              padding: "10px 14px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

export default CartItem;