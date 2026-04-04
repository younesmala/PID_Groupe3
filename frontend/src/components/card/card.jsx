import React from "react";
import './card.css';

const ArtistCard = ({ artist }) => {
    if (!artist) return null;

    const { nom, image, genre } = artist;

    return (
        <div className="artist-card">
            <img src={image} alt={nom} className="artist-card__image" />
            <div className="artist-card__info">
                <h2 className="artist-card__name">{nom}</h2>
                <p className="artist-card__genre">{genre}</p>
            </div>
        </div>
    );
};

export default ArtistCard;