import { Link } from 'react-router-dom'

const CARD_THEMES = [
  'show-card__poster--green',
  'show-card__poster--violet',
  'show-card__poster--amber',
  'show-card__poster--blue',
  'show-card__poster--rose',
  'show-card__poster--teal',
]

function getShortTitle(title = '') {
  const words = title.split(' ').filter(Boolean)
  if (words.length <= 3) return title
  return words.slice(0, 3).join(' ')
}

function ShowCards({ shows = [], loading = false, error = null }) {
  if (loading) {
    return (
      <section className="show-cards-section">
        <p className="section-kicker">Evenements speciaux</p>
        <h2>Chargement des spectacles...</h2>
      </section>
    )
  }

  if (error) {
    return (
      <section className="show-cards-section">
        <p className="section-kicker">Evenements speciaux</p>
        <h2>Impossible de charger les spectacles</h2>
        <p className="show-cards-section__message">{error}</p>
      </section>
    )
  }

  return (
    <section className="show-cards-section" id="shows">
      <div className="show-cards-section__header">
        <p className="section-kicker">Evenements speciaux</p>
        <h2>Sur scene cette saison</h2>
        <p>BrusselsShow, un defile de spectacles a decouvrir au coeur de Bruxelles.</p>
      </div>

      <div className="show-cards-grid">
        {shows.map((show, index) => (
          <article className="show-card" key={show.id}>
            <div className={`show-card__poster ${CARD_THEMES[index % CARD_THEMES.length]}`}>
              <span className="show-card__rating">★ {show.duration || 90}</span>
              <strong>{getShortTitle(show.title)}</strong>
              <span className="show-card__spark">◆</span>
            </div>

            <div className="show-card__body">
              <h3>{show.title}</h3>
              <p className="show-card__artist">📍 {show.artist_name || 'Artiste a confirmer'}</p>
              <p className="show-card__description">
                {show.description || 'Description a venir.'}
              </p>
              <div className="show-card__actions">
                <Link to={`/show/${show.id}`} className="show-card__details">
                  Voir
                </Link>
                <Link to={`/show/${show.id}`} className="show-card__book">
                  Reserver
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default ShowCards
