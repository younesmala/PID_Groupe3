import { useState } from "react";
import { artists as mockArtists } from "../data/artists";
import ArtistCard from "../components/ArtistCard";

function ArtistsList() {
  const [artists, setArtists] = useState(mockArtists);

  const handleDelete = (id) => {
    setArtists(artists.filter((artist) => artist.id !== id));
  };

  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20, background: "#f9f9f9", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
      <h1 style={{ textAlign: "center" }}>Artists List</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {artists.map((artist) => (
          <li key={artist.id} style={{ listStyle: "none", display: "flex", alignItems: "center", gap: 8 }}>
            <ArtistCard firstname={artist.firstname} lastname={artist.lastname} />
            <button style={{ marginLeft: 4 }}>Voir</button>
            <button style={{ marginLeft: 4 }}>Modifier</button>
            <button style={{ marginLeft: 4 }} onClick={() => handleDelete(artist.id)}>Supprimer</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ArtistsList;
