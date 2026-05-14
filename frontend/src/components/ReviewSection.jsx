import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReviews, createReview } from '../services/reviewService';
import { getStoredUsername } from '../services/authService';
import './ReviewSection.css';

const AUTO_TRANSLATE_LANGS = new Set(['en', 'nl']);

function normalizeLang(lang) {
  return (lang || 'fr').split('-')[0].toLowerCase();
}

function openLoginFlow(lang) {
  const normalizedLang = normalizeLang(lang);
  window.history.pushState({}, '', `/${normalizedLang}/login`);
  window.dispatchEvent(new Event('open-login-modal'));
}

async function translateTextDirect(text, targetLang) {
  if (!text || !AUTO_TRANSLATE_LANGS.has(targetLang)) {
    return text;
  }

  const sourceCandidates = ['fr', 'en', 'nl'].filter((lang) => lang !== targetLang);

  for (const sourceLang of sourceCandidates) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`;
    const res = await fetch(url);

    if (!res.ok) {
      continue;
    }

    const payload = await res.json();
    const translated = payload?.responseData?.translatedText;

    if (translated && !translated.toLowerCase().includes('invalid source language')) {
      return translated;
    }
  }

  throw new Error('Translation unavailable');
}

const ReviewSection = ({ showId, producerUsername }) => {
  const { t, i18n } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [translatedReviews, setTranslatedReviews] = useState({});
  const [translationUnavailable, setTranslationUnavailable] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentUsername = getStoredUsername();
  const isLoggedIn = !!currentUsername;
  const isOwnShow = !!producerUsername && producerUsername === currentUsername;
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

  useEffect(() => {
    let cancelled = false;
    const targetLang = normalizeLang(i18n.resolvedLanguage || i18n.language);

    async function translateReviews() {
      if (!reviews.length || !AUTO_TRANSLATE_LANGS.has(targetLang)) {
        setTranslatedReviews({});
        setTranslationUnavailable(false);
        return;
      }

      const translatedById = {};
      let hadError = false;

      for (const rev of reviews) {
        try {
          translatedById[rev.id] = await translateTextDirect(rev.review, targetLang);
        } catch {
          translatedById[rev.id] = rev.review;
          hadError = true;
        }
      }

      if (!cancelled) {
        setTranslatedReviews(translatedById);
        setTranslationUnavailable(hadError);
      }
    }

    translateReviews();

    return () => {
      cancelled = true;
    };
  }, [reviews, i18n.resolvedLanguage, i18n.language]);

  const fetchReviews = async () => {
    setIsLoading(true);
    setStatusMsg({ type: '', text: '' });
    try {
      const data = await getReviews(showId);
      setReviews(data);
    } catch (error) {
      setReviews([]);
      if (isLoggedIn) {
        setStatusMsg({ type: 'error', text: t('show.review_load_error') });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return setStatusMsg({ type: 'error', text: t('show.rating_required') });

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

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.stars, 0) / reviews.length).toFixed(1).replace('.', ',')
    : null;
  const targetLang = normalizeLang(i18n.resolvedLanguage || i18n.language);
  const isAutoTranslating = AUTO_TRANSLATE_LANGS.has(targetLang) && reviews.length > 0;

  return (
    <div className="review-section" id="reviews-section">
      <div className="review-section-header">
        <h3>{t('show.reviews_title')}</h3>
        {avgRating && (
          <span className="review-avg">{t('show.reviews_average')}: {avgRating}/5</span>
        )}
      </div>
      {isAutoTranslating && translationUnavailable && (
        <p className="loading-text">{t('show.reviews_translation_unavailable')}</p>
      )}

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
              <p>{translatedReviews[rev.id] || rev.review}</p>
              <small>{new Date(rev.created_at).toLocaleDateString()}</small>
            </div>
          ))
        ) : !statusMsg.text ? (
          /* Affichage neutre s'il n'y a pas encore d'avis */
          <p className="no-reviews">{t('show.no_reviews_yet')}</p>
        ) : null}
      </div>

      {/* Bouton ou Formulaire */}
      {!isOwnShow && !showForm && !showLoginPrompt && !statusMsg.text && (
        <div className="review-actions" style={{ marginTop: '30px', textAlign: 'center' }}>
          <button
            className="btn-write-review"
            onClick={() => isLoggedIn ? setShowForm(true) : openLoginFlow(i18n.resolvedLanguage || i18n.language)}
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
                openLoginFlow(i18n.resolvedLanguage || i18n.language);
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
            <button type="button" onClick={() => setShowForm(false)} className="btn-cancel">{t('show.cancel')}</button>
            <button type="submit" className="btn-submit">{t('show.review_submit')}</button>
          </div>
        </form>
      )}
      {statusMsg.text && <p className={`status-msg ${statusMsg.type}`}>{statusMsg.text}</p>}
    </div>
  );
}

export default ReviewSection;
