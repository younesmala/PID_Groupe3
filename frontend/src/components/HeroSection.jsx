import { Link } from 'react-router-dom'

function HeroSection() {
  return (
    <section className="home-hero">
      <div className="home-hero__glow home-hero__glow--amber" />
      <div className="home-hero__glow home-hero__glow--blue" />

      <div className="home-hero__content">
        <p className="home-hero__eyebrow">Spectacles, concerts et scenes vivantes</p>
        <h1>Decouvrez les meilleurs spectacles a Bruxelles</h1>
        <p className="home-hero__subtitle">
          Une selection vibrante d'evenements culturels, reservee en quelques clics.
        </p>
        <div className="home-hero__actions">
          <Link to="/shows" className="home-hero__cta">
            Voir les spectacles
          </Link>
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
          <span>Ce soir</span>
          <strong>20:30</strong>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
