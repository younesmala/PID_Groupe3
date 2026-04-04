import { Link } from "react-router-dom";

function ArtistCard({ artist }) {
  return (
    <div className="card">
      <img
        src={`https://i.pravatar.cc/150?u=${artist.id}`}
        alt={`${artist.firstname} ${artist.lastname}`}
        className="card-image"
      />

      <h3>
        {artist.firstname} {artist.lastname}
      </h3>

      <div className="card-actions">
        <Link to={`/artist/${artist.id}`} className="btn primary">
          Voir
        </Link>

        <Link to={`/artist/${artist.id}/edit`} className="btn danger">
          Modifier
        </Link>
      </div>
    </div>
  );
}

export default ArtistCard;