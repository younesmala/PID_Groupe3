import { useParams } from "react-router-dom";
import { artists } from "../data/artists";

function ArtistDetail() {
  const { id } = useParams();
  const artist = artists.find((a) => a.id === Number(id));

  if (!artist) return <div>Artiste introuvable</div>;

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20 }}>
      <h1>Détail de l'artiste</h1>
      <p>Prénom : {artist.firstname}</p>
      <p>Nom : {artist.lastname}</p>
    </div>
  );
}

export default ArtistDetail;
