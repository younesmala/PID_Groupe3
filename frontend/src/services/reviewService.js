/**
 * Service pour gérer les avis (Reviews) via l'API Django
 */

import { apiUrl } from './api';

function normalizeReviewsPayload(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.results)) {
    return payload.results;
  }

  return [];
}

export async function getReviews(showId) {
  const url = showId ? apiUrl(`/reviews/?show_id=${showId}`) : apiUrl('/reviews/');
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des avis');
  }

  const data = await response.json();
  return normalizeReviewsPayload(data);
}

export async function getPendingReviews() {
  const response = await fetch(apiUrl('/reviews/?status=pending'), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des avis en attente');
  }

  const data = await response.json();
  return normalizeReviewsPayload(data);
}

export async function getAllReviews() {
  const response = await fetch(apiUrl('/reviews/'), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Erreur lors du chargement des avis');
  }

  const data = await response.json();
  return normalizeReviewsPayload(data);
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

export async function createReview(reviewData) {
  const csrfToken = getCookie('csrftoken') || localStorage.getItem('csrf_token');

  const response = await fetch(apiUrl('/reviews/'), {
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

export async function moderateReview(reviewId, status) {
  const csrfToken = getCookie('csrftoken') || localStorage.getItem('csrf_token');

  const response = await fetch(apiUrl(`/reviews/${reviewId}/`), {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({ status }),
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data?.detail || "Erreur lors de la modération de l'avis");
  }

  return response.json();
}
