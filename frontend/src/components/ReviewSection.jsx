import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReviews, createReview } from '../services/reviewService';
import { getStoredUsername } from '../services/authService';
import './ReviewSection.css';

const ReviewSection = ({ showId }) => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const isLoggedIn = !!getStoredUsername();
  const [showForm, setShowForm] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (showId) {
      fetchReviews();
    }
  }, [showId]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const data = await getReviews(showId);
      setReviews(data);
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
      await createReview({ 
        show: showId, 
        stars: rating, 
        review: comment 
      });
      
      setStatusMsg({ type: 'success', text: t('show.review_success') });
      setShowForm(false);
      setRating(0);
      setComment('');
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

export default ReviewSection;