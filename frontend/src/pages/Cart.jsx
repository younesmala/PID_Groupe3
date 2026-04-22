import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCart, updateCart, removeFromCart, clearCart } from "../services/cartService";

function Cart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [draftQuantities, setDraftQuantities] = useState({});

  const fetchCartData = () => {
    setLoading(true);
    setError(null);

    getCart()
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
        setDraftQuantities(
          Object.fromEntries(
            data.items.map((item) => [`${item.representation_id}_${item.price_id}`, item.quantity])
          )
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    queueMicrotask(fetchCartData);
  }, []);

  const handleQuantityChange = (itemKey, value) => {
    setDraftQuantities((current) => ({
      ...current,
      [itemKey]: value,
    }));
  };

  const handleUpdate = (item) => {
    const itemKey = `${item.representation_id}_${item.price_id}`;
    const nextQuantity = Number(draftQuantities[itemKey]);

    if (!Number.isInteger(nextQuantity)) {
      alert("Quantite invalide.");
      return;
    }

    if (nextQuantity < 0) {
      alert("La quantite ne peut pas etre negative.");
      return;
    }

    updateCart(item.representation_id, nextQuantity, item.price_id)
      .then(() => fetchCartData())
      .catch((err) => alert(err.message));
  };

  const handleRemove = (repId, priceId) => {
    if (!window.confirm("Retirer cet article ?")) return;
    removeFromCart(repId, priceId)
      .then(() => fetchCartData())
      .catch((err) => alert(err.message));
  };

  const handleClear = () => {
    if (!window.confirm("Vider tout le panier ?")) return;
    clearCart()
      .then(() => fetchCartData())
      .catch((err) => alert(err.message));
  };

  if (loading) return <div style={{ padding: 20 }}>Chargement...</div>;
  if (error) return <div style={{ padding: 20, color: "red" }}>Erreur : {error}</div>;

  return (
    <div style={{ maxWidth: 900, margin: "40px auto", padding: 20, fontFamily: "sans-serif" }}>
      <h1>Votre panier</h1>

      {items.length === 0 ? (
        <div>
          <p>Votre panier est vide.</p>
          <Link to="/#shows" className="btn btn-primary">Voir les spectacles</Link>
        </div>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                <th style={{ padding: "12px" }}>Spectacle</th>
                <th style={{ padding: "12px" }}>Date</th>
                <th style={{ padding: "12px" }}>Tarif</th>
                <th style={{ padding: "12px" }}>Prix unitaire</th>
                <th style={{ padding: "12px" }}>Quantite</th>
                <th style={{ padding: "12px" }}>Total</th>
                <th style={{ padding: "12px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const itemKey = `${item.representation_id}_${item.price_id}`;
                const maxSeats = item.available_seats ?? item.quantity;

                return (
                  <tr key={itemKey} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "12px" }}>{item.representation.split(" @ ")[0]}</td>
                    <td style={{ padding: "12px" }}>
                      {new Date(item.representation.split(" @ ")[1]).toLocaleString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td style={{ padding: "12px" }}>{item.price_type}</td>
                    <td style={{ padding: "12px" }}>{item.unit_price} EUR</td>
                    <td style={{ padding: "12px" }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                          type="number"
                          min="0"
                          max={Math.max(maxSeats, item.quantity)}
                          value={draftQuantities[itemKey] ?? item.quantity}
                          onChange={(e) => handleQuantityChange(itemKey, e.target.value)}
                          style={{ width: 70, padding: 4 }}
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdate(item)}
                          style={{ padding: "6px 10px", borderRadius: 4, border: "1px solid #0d6efd", background: "white", color: "#0d6efd", cursor: "pointer" }}
                        >
                          Mettre a jour
                        </button>
                      </div>
                    </td>
                    <td style={{ padding: "12px" }}>{item.total_price} EUR</td>
                    <td style={{ padding: "12px" }}>
                      <button
                        type="button"
                        onClick={() => handleRemove(item.representation_id, item.price_id)}
                        style={{ color: "white", backgroundColor: "#dc3545", border: "none", padding: "6px 12px", borderRadius: 4, cursor: "pointer" }}
                      >
                        Retirer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button
              type="button"
              onClick={handleClear}
              style={{ color: "#dc3545", backgroundColor: "transparent", border: "1px solid #dc3545", padding: "8px 16px", borderRadius: 4, cursor: "pointer" }}
            >
              Vider le panier
            </button>
            <p style={{ textAlign: "right", fontWeight: "bold", fontSize: 20, margin: 0 }}>
              Total general : {total} EUR
            </p>
          </div>

          <div style={{ marginTop: 30, display: "flex", gap: 10 }}>
            <Link to="/#shows" style={{ textDecoration: "none", color: "#6c757d", border: "1px solid #6c757d", padding: "10px 20px", borderRadius: 4 }}>
              Continuer les achats
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
