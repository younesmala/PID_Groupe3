import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchCurrentUser, getStoredUsername } from '../services/authService'
import { fetchMyReservations } from '../services/userService'
import './AccountPages.css'

function readValue(...values) {
  return values.find((value) => value !== undefined && value !== null && value !== '')
}

function formatDate(value) {
  if (!value) {
    return 'Date non disponible'
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return String(value)
  }

  return new Intl.DateTimeFormat('fr-BE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatStatus(value) {
  if (!value) {
    return 'Statut inconnu'
  }

  return String(value)
}

function extractReservationTitle(reservation) {
  return readValue(
    reservation.show_title,
    reservation.show?.title,
    reservation.representation?.show?.title,
    reservation.representation_title,
    reservation.title,
    `Reservation #${readValue(reservation.id, reservation.pk, '...')}`,
  )
}

function extractReservationDate(reservation) {
  return readValue(
    reservation.booking_date,
    reservation.date,
    reservation.created_at,
    reservation.created,
    reservation.representation?.when,
    reservation.representation_date,
  )
}

function extractReservationQuantity(reservation) {
  return readValue(
    reservation.quantity,
    reservation.seats,
    reservation.tickets_count,
    reservation.lines?.reduce((total, line) => total + (line.quantity || 0), 0),
    reservation.items?.reduce((total, item) => total + (item.quantity || 0), 0),
    1,
  )
}

function buildTicketList(reservations) {
  return reservations.flatMap((reservation) => {
    if (Array.isArray(reservation.tickets) && reservation.tickets.length > 0) {
      return reservation.tickets.map((ticket, index) => ({
        id: readValue(ticket.id, `${reservation.id || reservation.pk || 'reservation'}-${index}`),
        title: readValue(ticket.title, ticket.show_title, extractReservationTitle(reservation)),
        status: formatStatus(readValue(ticket.status, reservation.status, 'Valide')),
        date: formatDate(readValue(ticket.date, ticket.representation_date, extractReservationDate(reservation))),
        seat: readValue(ticket.seat, ticket.reference, ticket.code, 'Billet numerique'),
      }))
    }

    const quantity = Number(extractReservationQuantity(reservation)) || 1

    return Array.from({ length: quantity }, (_, index) => ({
      id: `${readValue(reservation.id, reservation.pk, 'reservation')}-${index + 1}`,
      title: extractReservationTitle(reservation),
      status: formatStatus(readValue(reservation.status, 'Valide')),
      date: formatDate(extractReservationDate(reservation)),
      seat: `Ticket ${index + 1}`,
    }))
  })
}

function Profile({ isLoggedIn, username }) {
  const [profile, setProfile] = useState(() => (
    username ? { username } : null
  ))
  const [reservations, setReservations] = useState([])
  const [profileError, setProfileError] = useState('')
  const [reservationsError, setReservationsError] = useState('')
  const [loadingProfile, setLoadingProfile] = useState(true)
  const [loadingReservations, setLoadingReservations] = useState(true)

  useEffect(() => {
    let active = true

    async function loadProfile() {
      setLoadingProfile(true)
      setProfileError('')

      try {
        const data = await fetchCurrentUser()
        if (active) {
          setProfile(data)
        }
      } catch (error) {
        if (active) {
          const storedUsername = getStoredUsername()
          setProfile(storedUsername ? { username: storedUsername } : null)
          setProfileError(error.message)
        }
      } finally {
        if (active) {
          setLoadingProfile(false)
        }
      }
    }

    if (isLoggedIn) {
      loadProfile()
    } else {
      setLoadingProfile(false)
    }

    return () => {
      active = false
    }
  }, [isLoggedIn])

  useEffect(() => {
    let active = true

    async function loadReservations() {
      setLoadingReservations(true)
      setReservationsError('')

      try {
        const data = await fetchMyReservations()
        if (active) {
          setReservations(data)
        }
      } catch (error) {
        if (active) {
          setReservations([])
          setReservationsError(error.message)
        }
      } finally {
        if (active) {
          setLoadingReservations(false)
        }
      }
    }

    if (isLoggedIn) {
      loadReservations()
    } else {
      setLoadingReservations(false)
    }

    return () => {
      active = false
    }
  }, [isLoggedIn])

  const tickets = useMemo(() => buildTicketList(reservations), [reservations])

  if (!isLoggedIn) {
    return (
      <main className="account-shell">
        <section className="account-hero account-hero--compact">
          <div className="account-hero__content">
            <p className="account-kicker">Espace personnel</p>
            <h1>Connectez-vous pour acceder a votre profil.</h1>
            <p>Les sections reservations et tickets sont disponibles depuis votre compte utilisateur.</p>
            <div className="account-inline-actions">
              <Link className="account-secondary-link" to="/signup">Creer un compte</Link>
              <Link className="account-secondary-link" to="/">Retour a l&apos;accueil</Link>
            </div>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="account-shell">
      <section className="account-hero">
        <div className="account-hero__content">
          <p className="account-kicker">Mon espace</p>
          <h1>{loadingProfile ? 'Chargement du profil...' : `Bonjour ${readValue(profile?.first_name, profile?.username, username, 'utilisateur')}`}</h1>
          <p>
            Cette page utilise le backend existant pour afficher le profil utilisateur, les reservations et les tickets associes.
          </p>
        </div>

        <div className="account-hero__panel">
          <span>API connectee</span>
          <strong>GET /api/users/me/</strong>
          <strong>GET /api/my/reservations/</strong>
          <p>
            Les indisponibilites backend sont remontees dans l&apos;interface sans bloquer le rendu des sections.
          </p>
        </div>
      </section>

      <section className="account-card-grid account-card-grid--profile">
        <article className="account-card">
          <div className="account-card__header">
            <h2>Profil utilisateur</h2>
            <p>Donnees chargees depuis l&apos;endpoint utilisateur courant.</p>
          </div>

          {profileError && <p className="account-feedback account-feedback--error">{profileError}</p>}

          <dl className="profile-definition-list">
            <div>
              <dt>Username</dt>
              <dd>{readValue(profile?.username, username, 'Non disponible')}</dd>
            </div>
            <div>
              <dt>Email</dt>
              <dd>{readValue(profile?.email, 'Non disponible')}</dd>
            </div>
            <div>
              <dt>Prenom</dt>
              <dd>{readValue(profile?.first_name, profile?.firstname, 'Non disponible')}</dd>
            </div>
            <div>
              <dt>Nom</dt>
              <dd>{readValue(profile?.last_name, profile?.lastname, 'Non disponible')}</dd>
            </div>
          </dl>
        </article>

        <article className="account-card">
          <div className="account-card__header">
            <h2>Mes reservations</h2>
            <p>Historique des reservations recuperees cote API.</p>
          </div>

          {reservationsError && <p className="account-feedback account-feedback--error">{reservationsError}</p>}

          {loadingReservations ? (
            <p className="account-empty-state">Chargement des reservations...</p>
          ) : reservations.length === 0 ? (
            <p className="account-empty-state">Aucune reservation disponible pour le moment.</p>
          ) : (
            <div className="account-list">
              {reservations.map((reservation, index) => (
                <article
                  key={readValue(reservation.id, reservation.pk, index)}
                  className="account-list__item"
                >
                  <div>
                    <h3>{extractReservationTitle(reservation)}</h3>
                    <p>{formatDate(extractReservationDate(reservation))}</p>
                  </div>
                  <div className="account-list__meta">
                    <span>{formatStatus(readValue(reservation.status, 'Statut inconnu'))}</span>
                    <strong>{extractReservationQuantity(reservation)} ticket(s)</strong>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>

        <article className="account-card account-card--full">
          <div className="account-card__header">
            <h2>Mes tickets</h2>
            <p>Generation d&apos;une vue ticket a partir des reservations recuperees.</p>
          </div>

          {loadingReservations ? (
            <p className="account-empty-state">Preparation des tickets...</p>
          ) : tickets.length === 0 ? (
            <p className="account-empty-state">Aucun ticket a afficher.</p>
          ) : (
            <div className="ticket-grid">
              {tickets.map((ticket) => (
                <article key={ticket.id} className="ticket-card">
                  <span className="ticket-card__eyebrow">Ticket numerique</span>
                  <h3>{ticket.title}</h3>
                  <p>{ticket.date}</p>
                  <div className="ticket-card__footer">
                    <strong>{ticket.seat}</strong>
                    <span>{ticket.status}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}

export default Profile