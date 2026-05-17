import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { tField } from '../utils/locale'
import { translateTextDirect, needsTranslation } from '../utils/translate'

const CARD_THEMES = [
  'show-card__poster--green',
  'show-card__poster--violet',
  'show-card__poster--amber',
  'show-card__poster--blue',
  'show-card__poster--rose',
  'show-card__poster--teal',
]

const POSTER_OVERRIDES = {
  'cible.jpg': 'cible-mouvante.png',
}

function getPosterSrc(show) {
  const posterUrl = show?.poster_url
  const fallbackSlug = show?.slug

  if (posterUrl && (posterUrl.startsWith('http://') || posterUrl.startsWith('https://') || posterUrl.startsWith('/'))) {
    return posterUrl
  }

  if (!posterUrl && fallbackSlug) {
    return `/show-posters/${fallbackSlug}.png?v=${encodeURIComponent(fallbackSlug)}`
  }

  if (!posterUrl) return null

  const resolved = POSTER_OVERRIDES[posterUrl] ?? posterUrl
  return `/show-posters/${resolved}?v=${encodeURIComponent(resolved)}`
}

function ShowCards({ shows = [], loading = false, error = null }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language?.split('-')[0] || 'fr'
  const [translations, setTranslations] = useState({})

  useEffect(() => {
    setTranslations({})
    if (!['en', 'nl'].includes(lang)) return
    shows.forEach((show) => {
      if (needsTranslation(show, 'title', lang)) {
        translateTextDirect(show.title, lang)
          .then((text) => setTranslations((prev) => ({ ...prev, [`${show.id}_title`]: text })))
          .catch(() => {})
      }
      if (needsTranslation(show, 'description', lang)) {
        translateTextDirect(show.description, lang)
          .then((text) => setTranslations((prev) => ({ ...prev, [`${show.id}_desc`]: text })))
          .catch(() => {})
      }
    })
  }, [shows, lang])

  if (loading) {
    return (
      <section className="show-cards-section">
        <p className="section-kicker">{t('shows.special_events')}</p>
        <h2>{t('shows.loading')}</h2>
      </section>
    )
  }

  if (error) {
    return (
      <section className="show-cards-section">
        <p className="section-kicker">{t('shows.special_events')}</p>
        <h2>{t('shows.error_load')}</h2>
        <p className="show-cards-section__message">{error}</p>
      </section>
    )
  }

  return (
    <section className="show-cards-section" id="shows">
      <div className="show-cards-section__header">
        <p className="section-kicker">{t('shows.special_events')}</p>
        <h2>{t('shows.on_stage')}</h2>
        <p>{t('shows.tagline')}</p>
      </div>

      <div className="show-cards-grid">
        {shows.map((show, index) => (
          <article className="show-card" key={show.id}>
            <div className={`show-card__poster ${CARD_THEMES[index % CARD_THEMES.length]}`}>
              {getPosterSrc(show) ? (
                <img
                  className="show-card__poster-image"
                  src={getPosterSrc(show)}
                  alt={show.title}
                />
              ) : null}
              <div className="show-card__poster-overlay" />
              <span className="show-card__rating">{show.duration || 90} min</span>
            </div>

            <div className="show-card__body">
              <h3>{translations[`${show.id}_title`] || tField(show, 'title', lang)}</h3>
              <p className="show-card__artist">{t('shows.artist')} : {show.artist_name || t('shows.artist_tbc')}</p>
              <p className="show-card__description">
                {translations[`${show.id}_desc`] || tField(show, 'description', lang) || t('shows.desc_tbc')}
              </p>
              <div className="show-card__actions">
                <Link to={`/shows/${show.slug}`} className="show-card__book">
                  {t('shows.book_place')}
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
