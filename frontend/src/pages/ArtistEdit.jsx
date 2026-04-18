import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getArtistById, updateArtist } from "../services/artistService";

function ArtistEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getArtistById(id)
      .then((artist) => {
        setFirstname(artist.firstname);
        setLastname(artist.lastname);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await updateArtist(id, { firstname, lastname });
      navigate(`/artist/${id}`);
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20 }}>
      <h1>Modifier l'artiste</h1>
      <form onSubmit={handleSubmit}>
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
        <button type="submit">Enregistrer</button>
      </form>
    </div>
  );
}

export default ArtistEdit;
