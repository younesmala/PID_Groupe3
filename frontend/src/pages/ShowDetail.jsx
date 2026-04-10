import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getShowById } from "../services/showService";
import { getRepresentationsByShow } from "../services/representationService";
import { addToCart } from "../services/cartService";

function RepresentationForm({ rep, prices }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceId, setSelectedPriceId] = useState(prices[0]?.id ?? "");
  const [status, setStatus] = useState(null); // 'ok' | 'error' | null

  const selectedPrice = prices.find((p) => p.id === Number(selectedPriceId));

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);
    try {
      await addToCart(rep.id, quantity, selectedPrice?.type ?? "");
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <label style={{ fontSize: 14 }}>
        Quantité :
        <input
          type="number"
          min={1}
          max={10}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          style={{ width: 60, marginLeft: 4 }}
        />
      </label>
      <label style={{ fontSize: 14 }}>
        Tarif :
        <select
          value={selectedPriceId}
          onChange={(e) => setSelectedPriceId(e.target.value)}
          style={{ marginLeft: 4 }}
        >
          {prices.map((p) => (
            <option key={p.id} value={p.id}>
              {p.type} — {p.price} €
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-success btn-sm" disabled={prices.length === 0}>
        Ajouter au panier
      </button>
      {status === "ok" && <span style={{ color: "green", fontSize: 13 }}>✓ Ajouté</span>}
      {status === "error" && <span style={{ color: "red", fontSize: 13 }}>Erreur</span>}
    </form>
  );
}

function ShowDetail() {
  const { id } = useParams();
  const [show, setShow] = useState(null);
  const [representations, setRepresentations] = useState([]);
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      getShowById(id),
      getRepresentationsByShow(id),
      fetch("/api/prices/").then((r) => r.json()),
    ])
      .then(([showData, repsData, pricesData]) => {
        setShow(showData);
        setRepresentations(repsData);
        setPrices(pricesData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h1>{show.title}</h1>
      <p className="text-muted">{show.slug}</p>

      <h2 style={{ marginTop: 32 }}>Représentations</h2>
      {representations.length === 0 ? (
        <p>Aucune représentation disponible.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {representations.map((rep) => (
            <li
              key={rep.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 16,
                marginBottom: 12,
              }}
            >
              <div style={{ marginBottom: 8 }}>
                <strong>{new Date(rep.schedule).toLocaleString("fr-FR")}</strong>
                {rep.location && (
                  <span style={{ marginLeft: 12, color: "#666" }}>{rep.location}</span>
                )}
              </div>
              <RepresentationForm rep={rep} prices={prices} />
            </li>
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <Link to="/shows">← Retour aux spectacles</Link>
        <Link to="/cart">🛒 Voir le panier</Link>
      </div>
    </div>
  );
}

export default ShowDetail;
