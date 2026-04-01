import { Link } from "react-router-dom";
import { artists } from "../data/artists";

function ArtistsList() {
  return (
    <div>
      <h1>Artists List</h1>
      <ul>
        {artists.map((artist) => (
          <li key={artist.id}>
            {artist.firstname} {artist.lastname} -
            <Link to={`/artist/${artist.id}`}>Voir</Link> |
            <Link to={`/artist/${artist.id}/edit`}>Modifier</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ArtistsList;
