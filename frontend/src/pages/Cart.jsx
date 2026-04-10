import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCart } from "../services/cartService";

function Cart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState("0.00");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCart()
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", padding: 20 }}>
      <h1>Votre panier</h1>

      {items.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <>
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd", textAlign: "left" }}>
                <th style={{ padding: "8px 12px" }}>Spectacle</th>
                <th style={{ padding: "8px 12px" }}>Date</th>
                <th style={{ padding: "8px 12px" }}>Tarif</th>
                <th style={{ padding: "8px 12px" }}>Prix unitaire</th>
                <th style={{ padding: "8px 12px" }}>Quantité</th>
                <th style={{ padding: "8px 12px" }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={index} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px 12px" }}>{item.representation.split(' @ ')[0]}</td>
                  <td style={{ padding: "8px 12px" }}>
                    {new Date(item.representation.split(' @ ')[1]).toLocaleString('fr-FR')}
                  </td>
                  <td style={{ padding: "8px 12px" }}>{item.price_type}</td>
                  <td style={{ padding: "8px 12px" }}>{item.unit_price} €</td>
                  <td style={{ padding: "8px 12px" }}>{item.quantity}</td>
                  <td style={{ padding: "8px 12px" }}>
                    {(item.unit_price * item.quantity).toFixed(2)} €
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ textAlign: "right", fontWeight: "bold", fontSize: 18 }}>
            Total général : {total} €
          </p>
        </>
      )}

      <Link to="/shows">← Retour aux spectacles</Link>
    </div>
  );
}

export default Cart;
