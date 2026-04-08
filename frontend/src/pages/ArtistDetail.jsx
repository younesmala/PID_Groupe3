import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getArtistById } from "../services/artistService";

function ArtistDetail() {
  const { id } = useParams();
  const [artist, setArtist] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getArtistById(id)
      .then(setArtist)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Artiste introuvable</div>;

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20 }}>
      <h1>Détail de l'artiste</h1>
      <p>Prénom : {artist.firstname}</p>
      <p>Nom : {artist.lastname}</p>
    </div>
  );
}

export default ArtistDetail;
