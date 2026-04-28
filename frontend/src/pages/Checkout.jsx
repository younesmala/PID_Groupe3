import { useState } from 'react'
import { Link } from 'react-router-dom'
import { checkout } from '../services/reservationService'


function Checkout() {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(null)
  const [error, setError] = useState(null)

  async function handlePayment() {
  setLoading(true)
  setError(null)
  setSuccess(null)

  try {
    const data = await checkout()
    setSuccess(data)
      } catch (err) {
    setError(err.message)
      } finally {
    setLoading(false)
      }
   }

  return (
    <div
      style={{
        backgroundColor: '#111113',
        color: 'white',
        minHeight: '100vh',
        padding: '40px 20px',
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          backgroundColor: '#1a1a1d',
          border: '1px solid #2a2a2e',
          borderRadius: '16px',
          padding: '30px',
        }}
      >
        <h1 style={{ marginTop: 0 }}>Paiement</h1>

        {!success && (
          <>
            <p style={{ color: '#cfcfcf' }}>
              Vérifiez votre panier avant de confirmer la commande.
            </p>

            <button
              type="button"
              onClick={handlePayment}
              disabled={loading}
              style={{
                backgroundColor: '#e05a2b',
                color: 'white',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '700',
                marginTop: '20px',
              }}
            >
              {loading ? 'Traitement...' : 'Confirmer et payer'}
            </button>

            <div style={{ marginTop: '20px' }}>
              <Link
                to="/cart"
                style={{
                  color: 'white',
                  textDecoration: 'none',
                  border: '1px solid #666',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  display: 'inline-block',
                }}
              >
                Retour au panier
              </Link>
            </div>
          </>
        )}

        {error && (
          <p style={{ color: '#ff6b6b', marginTop: '20px' }}>
            Erreur : {error}
          </p>
        )}

        {success && (
          <div>
            <h2>Commande confirmée ✅</h2>
            <p style={{ color: '#cfcfcf' }}>
              Vos réservations ont été créées avec succès.
            </p>

            {success.reservation_ids?.length > 0 && (
              <div style={{ marginTop: '20px' }}>
                <strong>Numéros de réservation :</strong>
                <ul>
                  {success.reservation_ids.map((id) => (
                    <li key={id}>Réservation #{id}</li>
                  ))}
                </ul>
              </div>
            )}

            <Link
              to="/profile"
              style={{
                backgroundColor: '#e05a2b',
                color: 'white',
                textDecoration: 'none',
                padding: '12px 18px',
                borderRadius: '8px',
                fontWeight: '700',
                display: 'inline-block',
                marginTop: '20px',
              }}
            >
              Voir mon profil
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Checkout