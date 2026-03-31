import React from "react";
import { artists } from "../data/artists";
import ArtistCard from "../components/ArtistCard";

const ArtistsList = () => {
  return (
    <div>
      <h1>Artists List</h1>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxWidth: 400 }}>
        {artists.map((artist) => (
          <ArtistCard key={artist.id} firstname={artist.firstname} lastname={artist.lastname} />
        ))}
      </div>
    </div>
  );
};

export default ArtistsList;
