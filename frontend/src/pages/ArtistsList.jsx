import { artists } from "../data/artists";

function ArtistsList() {
  return (
    <div>
      <h1>Artists List</h1>
      <ul>
        {artists.map((artist) => (
          <li key={artist.id}>
            {artist.firstname} {artist.lastname}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default ArtistsList;
