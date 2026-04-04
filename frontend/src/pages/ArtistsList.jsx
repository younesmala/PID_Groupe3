import ArtistCard from "../components/ArtistCard";
import { artists } from "../data/artists";

function ArtistsList() {
  return (
    <div className="artists-page">
      <h1>Artists List</h1>

      <div className="artists-grid">
        {artists.map((artist) => (
          <ArtistCard key={artist.id} artist={artist} />
        ))}
      </div>
    </div>
  );
}

export default ArtistsList;