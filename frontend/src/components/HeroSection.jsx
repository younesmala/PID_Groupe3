import { useTranslation } from 'react-i18next'

function HeroSection() {
  const { t } = useTranslation()

  return (
    <section className="home-hero">
      <div className="home-hero__glow home-hero__glow--amber" />
      <div className="home-hero__glow home-hero__glow--blue" />

      <div className="home-hero__content">
        <p className="home-hero__eyebrow">{t('hero.subtitle')}</p>
        <h1>{t('hero.title')}</h1>
        <p className="home-hero__subtitle">
          {t('hero.description')}
        </p>
        <div className="home-hero__actions">
          <a href="#shows" className="home-hero__cta">
            {t('hero.cta')}
          </a>
          <span className="home-hero__note">Nouveautes mises a jour en temps reel</span>
        </div>
      </div>

      <div className="home-hero__visual" aria-hidden="true">
        <div className="home-hero__poster home-hero__poster--main">
          <span>LIVE</span>
          <strong>BRU</strong>
        </div>
        <div className="home-hero__poster home-hero__poster--back" />
        <div className="home-hero__ticket">
          <span>{t('hero.tonight')}</span>
          <strong>20:30</strong>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
