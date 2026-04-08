import { Link } from "react-router-dom";
import Button from "./button/button";
import { deleteArtist } from "../services/artistService";

function ArtistCard({ artist, onDelete }) {
  async function handleDelete() {
    await deleteArtist(artist.id);
    if (onDelete) onDelete(artist.id);
  }

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
        <div className="top-actions">
          <Link to={`/artist/${artist.id}`}>
            <Button label="Voir" variant="primary" />
          </Link>

          <Link to={`/artist/${artist.id}/edit`}>
            <Button label="Modifier" variant="danger" />
          </Link>
        </div>

        <Button
          label="Supprimer"
          variant="danger"
          onClick={handleDelete}
        />
      </div>
    </div>
  );
}

export default ArtistCard;
