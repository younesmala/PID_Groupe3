const BASE = '/api'

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

export async function addToCart(representationId, quantity, priceId) {
  const res = await fetch(`${BASE}/cart/add/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({
      representation_id: representationId,
      quantity: quantity,
      price_id: priceId,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Erreur ajout au panier')
  }
  return res.json()
}

export async function getCart() {
  const res = await fetch(`${BASE}/cart/`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Erreur chargement panier')
  return res.json()
}

export async function updateCart(representationId, quantity, priceId) {
  const res = await fetch(`${BASE}/cart/update/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({
      representation_id: representationId,
      quantity: quantity,
      price_id: priceId,
    }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.detail || 'Erreur mise à jour panier')
  }
  return res.json()
}

export async function removeFromCart(representationId, priceId) {
  const res = await fetch(`${BASE}/cart/remove/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({
      representation_id: representationId,
      price_id: priceId,
    }),
  })
  if (!res.ok) throw new Error('Erreur suppression article')
  return res.json()
}

export async function clearCart() {
  const res = await fetch(`${BASE}/cart/`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
    },
  })
  if (!res.ok) throw new Error('Erreur vidage panier')
  return res.json()
}
