import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPublicShows, getPublicLocations } from "../services/showService";

function StarRating({ rating }) {
  if (!rating) return <span className="shows-no-rating">Non noté</span>;
  const full = Math.floor(rating);
  const empty = 5 - Math.ceil(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return (
    <span className="shows-stars">
      {"★".repeat(full)}
      {half ? "½" : ""}
      {"☆".repeat(empty)}
      <span className="shows-rating-value"> {rating}/5</span>
    </span>
  );
}

function ShowCard({ show }) {
  const nextDate = show.next_schedule
    ? new Date(show.next_schedule).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="show-card">
      <div className="show-card-image">
        {show.poster_url ? (
          <img src={show.poster_url} alt={show.title} />
        ) : (
          <div className="show-card-placeholder">🎭</div>
        )}
      </div>
      <div className="show-card-body">
        <h3 className="show-card-title">{show.title}</h3>
        <div className="show-card-rating">
          <StarRating rating={show.rating} />
        </div>
        {show.next_location_name && (
          <p className="show-card-meta">📍 {show.next_location_name}</p>
        )}
        {nextDate ? (
          <p className="show-card-meta">📅 {nextDate}</p>
        ) : (
          <p className="show-card-meta text-muted">Aucune représentation prévue</p>
        )}
        <div className="show-card-actions">
          <Link to={`/show/${show.id}`}>
            <button className="btn primary">Détails</button>
          </Link>
          <Link to={`/show/${show.id}`}>
            <button className="btn btn-reserve">Réserver</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "Tous" },
  { key: "today", label: "Aujourd'hui" },
  { key: "upcoming", label: "Prochainement" },
];

function ShowsList() {
  const [shows, setShows] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    getPublicLocations().then((data) => setLocations(data.locations || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = {};
    if (activeFilter !== "all") params.filter = activeFilter;
    if (selectedLocation) params.location = selectedLocation;
    if (selectedDate) params.date = selectedDate;

    getPublicShows(params)
      .then(setShows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [activeFilter, selectedLocation, selectedDate]);

  return (
    <div className="shows-page">
      <h1>Spectacles</h1>

      <div className="shows-filters">
        <div className="filter-tabs">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              className={`filter-tab${activeFilter === key ? " active" : ""}`}
              onClick={() => setActiveFilter(key)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="filter-selects">
          <select
            className="filter-select"
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
          >
            <option value="">Tous les lieux</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <div className="filter-date-wrap">
            <input
              type="date"
              className="filter-select"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            {selectedDate && (
              <button
                className="filter-clear"
                onClick={() => setSelectedDate("")}
                title="Effacer la date"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {loading && <div className="shows-status">Chargement...</div>}
      {error && <div className="shows-status shows-error">Erreur : {error}</div>}
      {!loading && !error && shows.length === 0 && (
        <div className="shows-status">Aucun spectacle trouvé.</div>
      )}

      {!loading && !error && shows.length > 0 && (
        <div className="shows-grid">
          {shows.map((show) => (
            <ShowCard key={show.id} show={show} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ShowsList;
