import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { getShowByIdentifier } from "../services/showService";
import { getRepresentationsByShow } from "../services/representationService";
import { addToCart } from "../services/cartService";
import { getStoredUsername } from "../services/authService";

function getPosterSrc(posterUrl) {
  if (!posterUrl) return null;
  if (posterUrl.startsWith("http://") || posterUrl.startsWith("https://") || posterUrl.startsWith("/")) {
    return posterUrl;
  }
  return `/show-posters/${posterUrl}`;
}

function RepresentationForm({ rep, prices, isLoggedIn, onLoginRequired }) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(1);
  const [selectedPriceId, setSelectedPriceId] = useState(prices[0]?.id ? String(prices[0].id) : "");
  const [status, setStatus] = useState(null);
  const maxQuantity = Math.max(rep.available_seats ?? 0, 0);
  const effectivePriceId = selectedPriceId || (prices[0]?.id ? String(prices[0].id) : "");

  if (!isLoggedIn) {
    return (
      <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontSize: 14, color: "#666" }}>
          {rep.available_seats} {t("show.seats_remaining")}
        </span>
        <button
          type="button"
          onClick={onLoginRequired}
          style={{
            border: "none",
            borderRadius: 999,
            background: "linear-gradient(135deg, #f97316, #ef4444)",
            color: "white",
            cursor: "pointer",
            fontWeight: 800,
            minHeight: 38,
            padding: "0 18px",
          }}
        >
          Connecte-toi pour reserver
        </button>
      </div>
    );
  }

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
        {t("show.quantity")} :
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
        {t("show.price")} :
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
      <button
        type="submit"
        disabled={prices.length === 0 || maxQuantity <= 0}
        style={{
          border: "none",
          borderRadius: 999,
          background: prices.length === 0 || maxQuantity <= 0
            ? "#d1d5db"
            : "linear-gradient(135deg, #f97316, #ef4444)",
          color: "white",
          cursor: prices.length === 0 || maxQuantity <= 0 ? "not-allowed" : "pointer",
          fontWeight: 800,
          minHeight: 38,
          padding: "0 18px",
        }}
      >
        {t("show.add_to_cart")}
      </button>
      {status === "ok" && <span style={{ color: "green", fontSize: 13 }}>{t("show.added")}</span>}
      {status === "error" && <span style={{ color: "red", fontSize: 13 }}>{t("show.error")}</span>}
    </form>
  );
}

function RepresentationCard({ rep, prices, isLoggedIn, onLoginRequired }) {
  const { t } = useTranslation();
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
        {soldOut ? t("show.no_seats") : `${rep.available_seats} ${t("show.seats_remaining")}`}
      </div>
      {!soldOut && (
        <RepresentationForm
          rep={rep}
          prices={prices}
          isLoggedIn={isLoggedIn}
          onLoginRequired={onLoginRequired}
        />
      )}
      {soldOut && (
        <button type="button" className="btn btn-secondary btn-sm" disabled>
          {t("show.sold_out")}
        </button>
      )}
    </li>
  );
}

function ShowDetail() {
  const { t } = useTranslation();
  const { id, slug } = useParams();
  const navigate = useNavigate();
  const isLoggedIn = !!getStoredUsername();
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
    const identifier = slug || id;

    if (!identifier) {
      setError("Show introuvable");
      setLoading(false);
      return;
    }

    Promise.all([
      getShowByIdentifier(identifier),
      fetch("/api/prices/").then((r) => r.json()),
    ])
      .then(async ([showData, pricesData]) => {
        const repsData = await getRepresentationsByShow(showData.id);

        setShow(showData);
        setRepresentations(repsData);
        setPrices(pricesData);

        const firstAvailableRep = repsData.find(
          (rep) => (rep.available_seats ?? 0) > 0
        );

        setSelectedRepId(firstAvailableRep?.id ? String(firstAvailableRep.id) : "");
        setSelectedPriceId(pricesData[0]?.id ? String(pricesData[0].id) : "");
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, slug]);

  if (loading) return <div>{t("show.loading")}</div>;
  if (error) return <div>{t("show.error_label")} : {error}</div>;

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

  function handleLoginRedirect() {
    window.dispatchEvent(new Event("open-login-modal"));
  }

  const pageBackground = {
    minHeight: "calc(100vh - 80px)",
    background:
      "radial-gradient(circle at 15% 10%, rgba(245, 158, 11, 0.18), transparent 28rem), radial-gradient(circle at 85% 12%, rgba(14, 165, 233, 0.16), transparent 26rem), linear-gradient(135deg, #06070c 0%, #10131f 46%, #06070c 100%)",
    color: "#f8fafc",
    padding: "40px 20px 72px",
  };

  const contentWrap = {
    maxWidth: 700,
    margin: "0 auto",
  };

  const subtleText = {
    color: "#94a3b8",
  };

  const linkStyle = {
    color: "#fde68a",
    textDecoration: "none",
    fontWeight: 600,
  };

  return (
    <div style={pageBackground}>
      <div style={contentWrap}>
        {getPosterSrc(show.poster_url) && (
          <img
            src={getPosterSrc(show.poster_url)}
            alt={show.title}
            style={{
              width: "100%",
              height: 420,
              objectFit: "contain",
              background: "#0f172a",
              borderRadius: 18,
              marginBottom: 24,
              boxShadow: "0 18px 42px rgba(0, 0, 0, 0.35)",
            }}
          />
        )}
        <h1 style={{ marginBottom: 10 }}>{show.title}</h1>
        <p style={{ ...subtleText, margin: 0 }}>{show.slug}</p>
        {show.artist_name && (
          <p style={{ marginTop: 8, color: "#fda4af", fontWeight: 700 }}>
            Artiste : {show.artist_name}
          </p>
        )}
        <p
          style={{
            marginTop: 18,
            marginBottom: 24,
            padding: "18px 20px",
            borderRadius: 16,
            background: "rgba(15, 23, 42, 0.74)",
            border: "1px solid rgba(251, 191, 36, 0.35)",
            color: "#e2e8f0",
            lineHeight: 1.75,
            boxShadow: "0 12px 28px rgba(0, 0, 0, 0.22)",
          }}
        >
          {show.description || "Description a venir."}
        </p>

        <h2 id="representations" style={{ marginTop: 32 }}>{t("show.representations")}</h2>
        {representations.length === 0 ? (
          <p style={subtleText}>{t("show.no_representations")}</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {representations.map((rep) => (
              <RepresentationCard
                key={rep.id}
                rep={rep}
                prices={prices}
                isLoggedIn={isLoggedIn}
                onLoginRequired={handleLoginRedirect}
              />
            ))}
          </ul>
        )}

        <div style={{ display: "flex", gap: 16, marginTop: 8, alignItems: "center", flexWrap: "wrap" }}>
          <Link to="/#shows" style={linkStyle}>{t("show.back")}</Link>
          <Link to="/cart" style={linkStyle}>{t("show.view_cart")}</Link>
          <Link to="/reviews" style={linkStyle}>{t("show.view_reviews")}</Link>
        </div>

        {representations.length > 0 && (
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
              background: "rgba(15, 23, 42, 0.78)",
              border: "1px solid rgba(251, 191, 36, 0.35)",
              boxShadow: "0 14px 34px rgba(0, 0, 0, 0.25)",
            }}
          >
            <label style={{ display: "grid", gap: 4, fontSize: 13, color: "#e2e8f0" }}>
              {t("show.date")}
              <select
                value={selectedRepId}
                onChange={(e) => {
                  setSelectedRepId(e.target.value);
                  setReserveQuantity(1);
                }}
                style={{ minWidth: 260, padding: "8px 10px", borderRadius: 8, border: "1px solid #fdba74" }}
              >
                {representations
                  .filter((rep) => (rep.available_seats ?? 0) > 0)
                  .map((rep) => (
                    <option key={rep.id} value={rep.id}>
                      {new Date(rep.schedule).toLocaleString("fr-FR")} - {rep.available_seats} place(s) dispo
                    </option>
                  ))}
              </select>
            </label>

            {isLoggedIn ? (
              <>
                <label style={{ display: "grid", gap: 4, fontSize: 13, color: "#e2e8f0" }}>
                  {t("show.price")}
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

                <div style={{ display: "grid", gap: 4, fontSize: 13, color: "#e2e8f0" }}>
                  {t("show.seats")}
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => updateReserveQuantity(reserveQuantity - 1)}
                      disabled={!canReserve || reserveQuantity <= 1}
                      style={{ width: 34, height: 34, borderRadius: 8, border: "1px solid #fdba74", background: "white", cursor: "pointer" }}
                    >
                      -
                    </button>
                    <span style={{ minWidth: 28, textAlign: "center", fontWeight: 700, color: "#f8fafc" }}>{reserveQuantity}</span>
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
                  {t("show.book")}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleLoginRedirect}
                style={{
                  alignSelf: "end",
                  border: "none",
                  borderRadius: 999,
                  background: "linear-gradient(135deg, #f97316, #ef4444)",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 800,
                  minHeight: 42,
                  padding: "0 24px",
                }}
              >
                Connecte-toi pour reserver
              </button>
            )}

            {reserveStatus === "error" && isLoggedIn && (
              <span style={{ color: "#fca5a5", fontSize: 13 }}>
                {t("show.cart_error")}
              </span>
            )}
          </form>
        )}
      </div>
    </div>
  );
}

export default ShowDetail;
