import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getShowById } from "../services/showService";
import { getRepresentationsByShow } from "../services/representationService";
import { addToCart } from "../services/cartService";

function RepresentationForm({ rep, prices }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceId, setSelectedPriceId] = useState(prices[0]?.id ? String(prices[0].id) : "");
  const [status, setStatus] = useState(null);
  const maxQuantity = Math.max(rep.available_seats ?? 0, 0);
  const effectivePriceId = selectedPriceId || (prices[0]?.id ? String(prices[0].id) : "");

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus(null);

    try {
      await addToCart(rep.id, quantity, effectivePriceId);
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
          value={effectivePriceId}
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
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [representations, setRepresentations] = useState([]);
  const [prices, setPrices] = useState([]);
  const [selectedRepId, setSelectedRepId] = useState("");
  const [selectedPriceId, setSelectedPriceId] = useState("");
  const [reserveQuantity, setReserveQuantity] = useState(1);
  const [reserveStatus, setReserveStatus] = useState(null);
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
        const firstAvailableRep = repsData.find((rep) => (rep.available_seats ?? 0) > 0);
        setSelectedRepId(firstAvailableRep?.id ? String(firstAvailableRep.id) : "");
        setSelectedPriceId(pricesData[0]?.id ? String(pricesData[0].id) : "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  const selectedRepresentation = representations.find((rep) => String(rep.id) === selectedRepId);
  const maxReserveQuantity = Math.max(selectedRepresentation?.available_seats ?? 0, 0);
  const canReserve = !!selectedRepresentation && !!selectedPriceId && prices.length > 0 && maxReserveQuantity > 0;

  function updateReserveQuantity(nextQuantity) {
    const boundedQuantity = Math.min(Math.max(nextQuantity, 1), Math.max(maxReserveQuantity, 1));
    setReserveQuantity(boundedQuantity);
  }

  async function handleQuickReservation(e) {
    e.preventDefault();
    setReserveStatus(null);

    if (!canReserve) {
      setReserveStatus("error");
      return;
    }

    try {
      await addToCart(Number(selectedRepId), reserveQuantity, selectedPriceId);
      navigate("/cart");
    } catch {
      setReserveStatus("error");
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: "40px auto", padding: 20 }}>
      <h1>{show.title}</h1>
      <p className="text-muted">{show.slug}</p>

      <h2 id="representations" style={{ marginTop: 32 }}>Representations</h2>
      {representations.length === 0 ? (
        <p>Aucune representation disponible.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {representations.map((rep) => (
            <RepresentationCard key={rep.id} rep={rep} prices={prices} />
          ))}
        </ul>
      )}

      <div style={{ display: "flex", gap: 16, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
        <Link to="/#shows">Retour aux spectacles</Link>
        <Link to="/cart">Voir le panier</Link>
      </div>

      <form
        onSubmit={handleQuickReservation}
        style={{
          display: "flex",
          gap: 14,
          alignItems: "center",
          flexWrap: "wrap",
          marginTop: 22,
          padding: "16px 18px",
          borderRadius: 14,
          background: "linear-gradient(135deg, #fff7ed, #ffffff)",
          border: "1px solid #fed7aa",
          boxShadow: "0 14px 34px rgba(239, 68, 68, 0.12)",
        }}
      >
        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
          Date
          <select
            value={selectedRepId}
            onChange={(e) => {
              setSelectedRepId(e.target.value);
              setReserveQuantity(1);
            }}
            style={{ minWidth: 220, padding: "8px 10px", borderRadius: 8, border: "1px solid #fdba74" }}
          >
            {representations
              .filter((rep) => (rep.available_seats ?? 0) > 0)
              .map((rep) => (
                <option key={rep.id} value={rep.id}>
                  {new Date(rep.schedule).toLocaleString("fr-FR")} - {rep.available_seats} place(s)
                </option>
              ))}
          </select>
        </label>

        <label style={{ display: "grid", gap: 4, fontSize: 13 }}>
          Tarif
          <select
            value={selectedPriceId}
            onChange={(e) => setSelectedPriceId(e.target.value)}
            style={{ minWidth: 150, padding: "8px 10px", borderRadius: 8, border: "1px solid #fdba74" }}
          >
            {prices.map((price) => (
              <option key={price.id} value={price.id}>
                {price.type} - {price.price} EUR
              </option>
            ))}
          </select>
        </label>

        <div style={{ display: "grid", gap: 4, fontSize: 13 }}>
          Places
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button
              type="button"
              onClick={() => updateReserveQuantity(reserveQuantity - 1)}
              disabled={!canReserve || reserveQuantity <= 1}
              style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #fdba74", background: "white", cursor: "pointer" }}
            >
              -
            </button>
            <span style={{ minWidth: 28, textAlign: "center", fontWeight: 700 }}>{reserveQuantity}</span>
            <button
              type="button"
              onClick={() => updateReserveQuantity(reserveQuantity + 1)}
              disabled={!canReserve || reserveQuantity >= maxReserveQuantity}
              style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #fdba74", background: "white", cursor: "pointer" }}
            >
              +
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canReserve}
          style={{
            alignSelf: "end",
            border: "none",
            borderRadius: 999,
            background: canReserve ? "linear-gradient(135deg, #f97316, #ef4444)" : "#d1d5db",
            color: "white",
            cursor: canReserve ? "pointer" : "not-allowed",
            fontWeight: 800,
            minHeight: 42,
            padding: "0 24px",
          }}
        >
          Réserver
        </button>

        {reserveStatus === "error" && (
          <span style={{ color: "#b91c1c", fontSize: 13 }}>
            Impossible d'ajouter au panier pour le moment.
          </span>
        )}
      </form>
    </div>
  );
}

export default ShowDetail;
