import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { getStoredUsername } from '../services/authService';
import './ReviewSection.css';

// Fonction utilitaire pour récupérer le jeton CSRF des cookies de Django
function getCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export default function ReviewSection({ showSlug }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = !!getStoredUsername();
  const [showForm, setShowForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (showSlug) {
      fetchReviews();
    }
  }, [showSlug]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const response = await fetch(`/api/shows/${showSlug}/reviews/`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data);
      } else {
        // Gestion explicite des erreurs
        let errorText = "Erreur lors du chargement des avis.";
        if (response.status === 429) errorText = "Trop de requêtes. Veuillez patienter quelques instants.";
        if (response.status === 501) errorText = "Le système d'avis est en cours de maintenance (Non implémenté).";
        
        setStatusMsg({ type: 'error', text: errorText });
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: "Impossible de contacter le serveur." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setStatusMsg({ type: 'error', text: 'Veuillez choisir une note' });

    try {
      const csrftoken = getCookie('csrftoken');
      const response = await fetch(`/api/shows/${showSlug}/reviews/`, {
        method: 'POST',
        credentials: 'include', // Important pour envoyer les cookies de session
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrftoken, // Envoi du jeton de sécurité Django
        },
        body: JSON.stringify({ stars: rating, review: comment })
      });

      if (response.ok) {
        setStatusMsg({ type: 'success', text: t('show.review_success') });
        setShowForm(false);
        setRating(0);
        setComment('');
      } else {
        const err = await response.json();
        setStatusMsg({ type: 'error', text: err.error || t('show.error') });
      }
    } catch (error) {
      setStatusMsg({ type: 'error', text: t('show.cart_error') });
    }
  };

  return (
    <div className="review-section" id="reviews-section">
      <h3>{t('show.view_reviews')}</h3>

      {/* Liste des avis existants */}
      <div className="reviews-list">
        {isLoading ? (
          <p className="loading-text">{t('show.loading')}</p>
        ) : reviews.length > 0 ? (
          reviews.map(rev => (
            <div key={rev.id} className="review-item">
              <div className="review-header">
                <strong>{rev.username}</strong>
                <span className="stars">{'★'.repeat(rev.stars)}{'☆'.repeat(5-rev.stars)}</span>
              </div>
              <p>{rev.review}</p>
              <small>{new Date(rev.created_at).toLocaleDateString()}</small>
            </div>
          ))
        ) : !statusMsg.text ? (
          /* Affichage neutre s'il n'y a pas encore d'avis */
          <p className="no-reviews">{t('show.no_reviews_yet')}</p>
        ) : null}
      </div>

      {/* Bouton ou Formulaire */}
      {!showForm && !showLoginPrompt && !statusMsg.text && (
        <div className="review-actions" style={{ marginTop: '30px', textAlign: 'center' }}>
          <button 
            className="btn-write-review"
            onClick={() => isLoggedIn ? setShowForm(true) : window.dispatchEvent(new Event("open-login-modal"))}
          >
            {t('show.write_review')}
          </button>
        </div>
      )}

      {/* Pop-up / Message d'incitation à la connexion */}
      {showLoginPrompt && (
        <div className="login-prompt-box animate-fade-in" style={{ border: '2px dashed #ffc107' }}>
          <p><strong>{t('show.review_login_required')}</strong></p>
          <div className="form-actions">
            <button onClick={() => setShowLoginPrompt(false)} className="btn-cancel">
              {t('cart.continue')}
            </button>
            <button 
              onClick={() => {
                window.dispatchEvent(new Event("open-login-modal"));
                setShowLoginPrompt(false);
              }} 
              className="btn-submit"
            >
              {t('connexion')}
            </button>
          </div>
        </div>
      )}

      {showForm && isLoggedIn && (
        <form onSubmit={handleSubmit} className="review-form">
          <div className="rating-input">
            <label>{t('show.rating_label')}</label>
            {[1, 2, 3, 4, 5].map(star => (
              <span 
                key={star} 
                className={`star ${rating >= star ? 'active' : ''}`}
                onClick={() => setRating(star)}
              >★</span>
            ))}
          </div>
          <textarea 
            required
            placeholder={t('show.review_placeholder')}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="form-actions">
            <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">Annuler</button>
            <button type="submit" className="btn-submit">{t('show.review_submit')}</button>
          </div>
        </form>
      )}
      {statusMsg.text && <p className={`status-msg ${statusMsg.type}`}>{statusMsg.text}</p>}
    </div>
  );
}