import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getShowById } from "../services/showService";
import { getRepresentationsByShow } from "../services/representationService";
import { addToCart } from "../services/cartService";

function RepresentationForm({ rep, prices }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceId, setSelectedPriceId] = useState(prices[0]?.id ? String(prices[0].id) : "");
  const [status, setStatus] = useState(null);
  const maxQuantity = Math.max(rep.available_seats ?? 0, 0);

  useEffect(() => {
    if (!selectedPriceId && prices[0]?.id) {
      setSelectedPriceId(String(prices[0].id));
    }
  }, [prices, selectedPriceId]);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    try {
      await addToCart(rep.id, quantity, selectedPriceId);
      setStatus("ok");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      <label style={{ fontSize: 14 }}>
        Quantite :
        <input
          type="number"
          min={1}
          max={maxQuantity || 1}
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
              {p.type} - {p.price} EUR
            </option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn btn-success btn-sm" disabled={prices.length === 0 || maxQuantity <= 0}>
        Ajouter au panier
      </button>
      {status === "ok" && <span style={{ color: "green", fontSize: 13 }}>Ajoute</span>}
      {status === "error" && <span style={{ color: "red", fontSize: 13 }}>Erreur</span>}
    </form>
  );
}

function RepresentationCard({ rep, prices }) {
  const soldOut = (rep.available_seats ?? 0) <= 0;

  return (
    <li
      style={{
        border: "1px solid #ddd",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
      }}
    >
      <div style={{ marginBottom: 8 }}>
        <strong>{new Date(rep.schedule).toLocaleString("fr-FR")}</strong>
        {rep.location && <span style={{ marginLeft: 12, color: "#666" }}>{rep.location}</span>}
      </div>
      <div style={{ marginBottom: 12, color: soldOut ? "#b02a37" : "#666" }}>
        {soldOut ? "Aucune place disponible" : `${rep.available_seats} place(s) restante(s)`}
      </div>
      {!soldOut && <RepresentationForm rep={rep} prices={prices} />}
      {soldOut && (
        <button type="button" className="btn btn-secondary btn-sm" disabled>
          Complet
        </button>
      )}
    </li>
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

      <h2 style={{ marginTop: 32 }}>Representations</h2>
      {representations.length === 0 ? (
        <p>Aucune representation disponible.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {representations.map((rep) => (
            <RepresentationCard key={rep.id} rep={rep} prices={prices} />
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <Link to="/shows">Retour aux spectacles</Link>
        <Link to="/cart">Voir le panier</Link>
      </div>
    </div>
  );
}

export default ShowDetail;
