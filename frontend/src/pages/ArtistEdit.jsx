import { useParams } from "react-router-dom";
import { artists } from "../data/artists";
import { useState } from "react";

function ArtistEdit() {
  const { id } = useParams();
  const artist = artists.find((a) => a.id === Number(id));
  const [firstname, setFirstname] = useState(artist ? artist.firstname : "");
  const [lastname, setLastname] = useState(artist ? artist.lastname : "");

  if (!artist) return <div>Artiste introuvable</div>;

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20 }}>
      <h1>Modifier l'artiste</h1>
      <form>
        <div style={{ marginBottom: 12 }}>
          <label>Prénom : </label>
          <input
            value={firstname}
            onChange={(e) => setFirstname(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 12 }}>
          <label>Nom : </label>
          <input
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />
        </div>
        <button type="button" disabled>
          Enregistrer (mock)
        </button>
      </form>
    </div>
  );
}

export default ArtistEdit;
