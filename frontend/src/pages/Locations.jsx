import { useState, useEffect } from 'react'
import './Locations.css'

export default function Locations() {
  const [locations, setLocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)

  useEffect(() => {
    fetchLocations()
  }, [])

  const fetchLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/locations/?include_shows=true')
      if (!response.ok) throw new Error('Erreur lors du chargement des lieux')
      const data = await response.json()
      setLocations(data)
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="locations-page"><p>Chargement...</p></div>
  if (error) return <div className="locations-page error-message"><p>Erreur: {error}</p></div>

  return (
    <div className="locations-page">
      <div className="locations-header">
        <h1>Nos Lieux</h1>
        <p className="subtitle">Découvrez les différents lieux où se déroulent nos spectacles</p>
      </div>

      <div className="locations-grid">
        {locations.map((location) => (
          <div key={location.id} className="location-card">
            <div className="location-header">
              <h2>{location.designation}</h2>
              <p className="location-address">{location.address}</p>
              {location.locality && (
                <p className="location-locality">{location.locality.designation}</p>
              )}
            </div>

            <div className="location-details">
              {location.phone && (
                <p className="detail-item">
                  <strong>Téléphone:</strong> {location.phone}
                </p>
              )}
              {location.website && (
                <p className="detail-item">
                  <strong>Site web:</strong>
                  <a href={location.website} target="_blank" rel="noopener noreferrer">
                    {location.website}
                  </a>
                </p>
              )}
            </div>

            {location.shows && location.shows.length > 0 ? (
              <div className="location-shows">
                <h3>Spectacles à venir ({location.shows.length})</h3>
                <div className="shows-list">
                  {location.shows.map((show) => (
                    <div key={show.id} className="show-item">
                      <div className="show-poster">
                        {show.poster_url && (
                          <img src={show.poster_url} alt={show.title} />
                        )}
                      </div>
                      <div className="show-info">
                        <h4>{show.title}</h4>
                        {show.artist && (
                          <p className="artist-name">{show.artist.name}</p>
                        )}
                        {show.duration && (
                          <p className="duration">{show.duration}min</p>
                        )}
                        
                        {show.upcoming_representations && show.upcoming_representations.length > 0 && (
                          <div className="representations">
                            <p className="rep-title">Prochaines représentations:</p>
                            <ul>
                              {show.upcoming_representations.map((rep) => (
                                <li key={rep.id}>
                                  {new Date(rep.when).toLocaleString('fr-FR')}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-shows">
                <p>Aucun spectacle prévu pour le moment</p>
              </div>
            )}

            <button
              onClick={() => setSelectedLocation(location)}
              className="btn btn-details"
            >
              Plus de détails
            </button>
          </div>
        ))}
      </div>

      {selectedLocation && (
        <div className="location-modal-overlay" onClick={() => setSelectedLocation(null)}>
          <div className="location-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedLocation(null)}
            >
              ✕
            </button>

            <h2>{selectedLocation.designation}</h2>
            <p className="address">{selectedLocation.address}</p>
            
            {selectedLocation.locality && (
              <p className="locality">{selectedLocation.locality.designation}</p>
            )}

            <div className="modal-details">
              <h3>Informations</h3>
              {selectedLocation.phone && (
                <p>
                  <strong>Téléphone:</strong><br />
                  <a href={`tel:${selectedLocation.phone}`}>
                    {selectedLocation.phone}
                  </a>
                </p>
              )}
              {selectedLocation.website && (
                <p>
                  <strong>Site web:</strong><br />
                  <a href={selectedLocation.website} target="_blank" rel="noopener noreferrer">
                    {selectedLocation.website}
                  </a>
                </p>
              )}
            </div>

            {selectedLocation.shows && selectedLocation.shows.length > 0 && (
              <div className="modal-shows">
                <h3>Spectacles ({selectedLocation.shows.length})</h3>
                <div className="modal-shows-list">
                  {selectedLocation.shows.map((show) => (
                    <div key={show.id} className="modal-show-item">
                      <h4>{show.title}</h4>
                      {show.artist && <p>{show.artist.name}</p>}
                      {show.duration && <p>Durée: {show.duration}min</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
