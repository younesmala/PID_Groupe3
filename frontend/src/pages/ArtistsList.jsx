import { artists } from "../data/artists";
import ArtistCard from "../components/ArtistCard";

function ArtistsList() {
  return (
    <div style={{ maxWidth: 400, margin: "40px auto", padding: 20, background: "#f9f9f9", borderRadius: 8, boxShadow: "0 2px 8px #0001" }}>
      <h1 style={{ textAlign: "center" }}>Artists List</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {artists.map((artist) => (
          <li key={artist.id} style={{ listStyle: "none" }}>
            <ArtistCard firstname={artist.firstname} lastname={artist.lastname} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ArtistsList;
