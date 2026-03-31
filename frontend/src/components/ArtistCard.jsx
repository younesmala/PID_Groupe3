import React from "react";

const ArtistCard = ({ firstname, lastname }) => {
  return (
    <div className="artist-card">
      <p>{firstname} {lastname}</p>
    </div>
  );
};

export default ArtistCard;
