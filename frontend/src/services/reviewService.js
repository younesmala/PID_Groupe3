/**
 * Service pour gérer les avis (Reviews) via l'API Django
 */

export async function getReviews(showId) {
  const url = showId ? `/api/reviews/?show_id=${showId}` : '/api/reviews/';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des avis');
  }
  return response.json();
}

export async function createReview(reviewData) {
  // Fonction utilitaire pour récupérer le token CSRF requis par Django
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  };

  const csrfToken = getCookie('csrftoken') || localStorage.getItem('csrf_token');

  const response = await fetch('/api/reviews/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify(reviewData),
    credentials: 'include',
  });

  if (!response.ok) throw new Error("Erreur lors de l'envoi de l'avis");
  return response.json();
}