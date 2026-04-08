import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getShows } from "../services/showService";

function ShowsList() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getShows()
      .then(setShows)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="artists-page">
      <h1>Spectacles</h1>
      <div className="artists-grid">
        {shows.map((show) => (
          <div key={show.id} className="card">
            <h3>{show.title}</h3>
            <p className="text-muted">{show.slug}</p>
            <div className="card-actions">
              <Link to={`/show/${show.id}`}>
                <button className="btn btn-primary">Voir</button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ShowsList;
