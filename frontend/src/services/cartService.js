const BASE = '/api'

export async function addToCart(representationId, quantity, priceType) {
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
      price_type: priceType,
    }),
  })
  if (!res.ok) throw new Error('Erreur ajout au panier')
  return res.json()
}

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return '';
}

export async function getCart() {
  const res = await fetch(`${BASE}/cart/`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Erreur chargement panier')
  return res.json()
}
