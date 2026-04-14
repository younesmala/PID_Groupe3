import { useEffect, useState } from "react";
import ArtistCard from "../components/ArtistCard";
import { getArtists } from "../services/artistService";

function ArtistsList() {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getArtists()
      .then(setArtists)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleDelete(id) {
    setArtists((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur : {error}</div>;

  return (
    <div className="artists-page">
      <h1>Artists List</h1>

      <div className="artists-grid">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} onDelete={handleDelete} />
        ))}
      </div>
    </div>
  );
}

export default ArtistsList;
