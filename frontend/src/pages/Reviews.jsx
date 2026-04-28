import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getReviews } from '../services/reviewService';
import './AccountPages.css';

const Reviews = () => {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getReviews();
        setReviews(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, []);

  return (
    <main className="account-shell">
      <section className="account-hero">
        <div className="account-hero__content">
          <p className="account-kicker">Communauté</p>
          <h1>Avis & Commentaires</h1>
          <p>Découvrez ce que les autres pensent des spectacles.</p>
        </div>
      </section>

      <section className="account-card-grid">
        <article className="account-card account-card--full">
          <div className="account-card__header">
            <h2>Derniers commentaires</h2>
          </div>
          {loading ? (
            <p className="account-empty-state">Chargement des avis...</p>
          ) : error ? (
            <p className="account-feedback account-feedback--error">Erreur : {error}</p>
          ) : reviews.length === 0 ? (
            <p className="account-empty-state">Aucun avis pour le moment.</p>
          ) : (
            <div className="account-list">
              {reviews.map((rev) => (
                <div key={rev.id} className="account-list__item">
                  <p>{rev.comment}</p>
                  <small>Note: {rev.rating} / 5</small>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  );
};

export default Reviews;