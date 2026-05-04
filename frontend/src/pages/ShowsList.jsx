import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getShows } from "../services/showService";

const PLACEHOLDER_COLORS = ['#1a3a2a', '#2a1a3a', '#3a2a1a', '#1a2a3a', '#3a1a2a', '#1a3a3a']

function getPosterSrc(posterUrl) {
  if (!posterUrl) return null
  if (posterUrl.startsWith('http://') || posterUrl.startsWith('https://') || posterUrl.startsWith('/')) {
    return posterUrl
  }
  const name = posterUrl.replace(/\.[^.]+$/, '.png')
  return `/show-posters/${name}`
}

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
        {shows.map((show, index) => {
          const src = getPosterSrc(show.poster_url)
          const placeholderBg = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]
          return (
          <div key={show.id} className="card">
            {src ? (
              <img src={src} alt={show.title} className="card-poster" />
            ) : (
              <div
                className="card-poster card-poster--placeholder"
                style={{ background: placeholderBg }}
                aria-hidden="true"
              />
            )}
            <h3>{show.title}</h3>
            <p className="text-muted">{show.slug}</p>
            <div className="card-actions">
              <Link to={`/shows/${show.slug}`}>
                <button className="btn btn-primary">Voir</button>
              </Link>
            </div>
          </div>
          )
        })}
      </div>
    </div>
  );
}

export default ShowsList;
