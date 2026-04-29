/**
 * Service pour gérer les avis (Reviews) via l'API Django
 */

export async function getReviews() {
  const response = await fetch('/api/reviews/');
  if (!response.ok) {
    throw new Error('Erreur lors du chargement des avis');
  }
  return response.json();
}

export async function createReview(reviewData) {
  // Fonction utilitaire pour récupérer le token CSRF requis par Django
  const getCookie = (name) => {
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
  };

  const response = await fetch('/api/reviews/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify(reviewData),
    credentials: 'include',
  });

  if (!response.ok) throw new Error("Erreur lors de l'envoi de l'avis");
  return response.json();
}