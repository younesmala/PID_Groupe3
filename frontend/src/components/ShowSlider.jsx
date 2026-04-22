import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

const DJANGO_ORIGIN = 'http://localhost:8000'

const CURATED_POSTERS = {
  ayiti: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80',
  'cible-mouvante': 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80',
  'ceci-nest-pas-un-chanteur-belge': 'https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=900&q=80',
  manneke: 'https://images.unsplash.com/photo-1508807526345-15e9b5f4eaff?auto=format&fit=crop&w=900&q=80',
}

function getPosterSrc(posterUrl) {
  if (!posterUrl) return null
  if (posterUrl.startsWith('http://') || posterUrl.startsWith('https://')) {
    return posterUrl
  }
  if (posterUrl.startsWith('/')) {
    return `${DJANGO_ORIGIN}${posterUrl}`
  }
  return `${DJANGO_ORIGIN}/static/catalogue/images/${posterUrl}`
}

function getCuratedPoster(show) {
  return CURATED_POSTERS[show.slug] || 'https://images.unsplash.com/photo-1503095396549-807759245b868?auto=format&fit=crop&w=900&q=80'
}

function trimDescription(description) {
  if (!description) return 'Un evenement a decouvrir prochainement sur BrusselsShow.'
  return description.length > 150 ? `${description.slice(0, 150)}...` : description
}

function ShowSlider({ shows = [], loading = false, error = null }) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (shows.length <= 1) return undefined

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % shows.length)
    }, 4500)

    return () => window.clearInterval(timer)
  }, [shows.length])

  if (loading) {
    return (
      <section className="show-slider">
        <div className="show-slider__header">
          <p className="section-kicker">Evenements speciaux</p>
          <h2>Chargement des spectacles...</h2>
        </div>
        <div className="show-slider__skeleton" />
      </section>
    )
  }

  if (error) {
    return (
      <section className="show-slider">
        <div className="show-slider__header">
          <p className="section-kicker">Evenements speciaux</p>
          <h2>Impossible de charger le slider</h2>
          <p className="show-slider__message">{error}</p>
        </div>
      </section>
    )
  }

  if (shows.length === 0) {
    return (
      <section className="show-slider">
        <div className="show-slider__header">
          <p className="section-kicker">Evenements speciaux</p>
          <h2>Aucun spectacle disponible pour le moment</h2>
        </div>
      </section>
    )
  }

  const safeActiveIndex = activeIndex % shows.length
  const activeShow = shows[safeActiveIndex]
  const posterSrc = getPosterSrc(activeShow.poster_url) || getCuratedPoster(activeShow)

  return (
    <section className="show-slider" aria-label="Evenements speciaux">
      <div className="show-slider__header">
        <p className="section-kicker">Evenements speciaux</p>
        <h2>Sur scene cette saison</h2>
        <p>BrusselsShow, un defile de spectacles a decouvrir au coeur de Bruxelles.</p>
      </div>

      <div className="show-slider__stage">
        <button
          type="button"
          className="show-slider__control show-slider__control--prev"
          onClick={() => setActiveIndex((safeActiveIndex - 1 + shows.length) % shows.length)}
          aria-label="Spectacle precedent"
        >
          ‹
        </button>

        <article className="show-slide">
          <div className="show-slide__image-wrap">
            {posterSrc ? (
              <img
                src={posterSrc}
                alt={activeShow.title}
                className="show-slide__image"
                onError={(event) => {
                  if (event.currentTarget.dataset.fallbackApplied) return
                  event.currentTarget.dataset.fallbackApplied = 'true'
                  event.currentTarget.src = getCuratedPoster(activeShow)
                }}
              />
            ) : (
              <div className="show-slide__image show-slide__image--fallback">
                {activeShow.title?.slice(0, 2).toUpperCase() || 'PB'}
              </div>
            )}
          </div>

          <div className="show-slide__content">
            <span className="show-slide__tag">
              {activeShow.bookable ? 'Reservations ouvertes' : 'Bientot disponible'}
            </span>
            <h3>{activeShow.title}</h3>
            <p>{trimDescription(activeShow.description)}</p>
            <div className="show-slide__meta">
              {activeShow.duration && <span>{activeShow.duration} min</span>}
              {activeShow.slug && <span>#{activeShow.slug}</span>}
            </div>
            <Link to={`/show/${activeShow.id}`} className="show-slide__button">
              {activeShow.bookable ? 'Reserver' : 'En savoir plus'}
            </Link>
          </div>
        </article>

        <button
          type="button"
          className="show-slider__control show-slider__control--next"
          onClick={() => setActiveIndex((safeActiveIndex + 1) % shows.length)}
          aria-label="Spectacle suivant"
        >
          ›
        </button>
      </div>

      <div className="show-slider__dots" aria-label="Selection du spectacle">
        {shows.map((show, index) => (
          <button
            key={show.id}
            type="button"
            className={`show-slider__dot ${index === safeActiveIndex ? 'show-slider__dot--active' : ''}`}
            onClick={() => setActiveIndex(index)}
            aria-label={`Afficher ${show.title}`}
          />
        ))}
      </div>
    </section>
  )
}

export default ShowSlider
