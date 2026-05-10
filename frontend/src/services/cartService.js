const BASE = '/api'
const DJANGO_BASE_URL = `http://${window.location.hostname}:8000`

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

async function ensureCsrfToken() {
  const storedToken = localStorage.getItem('csrf_token')
  if (storedToken) {
    return storedToken
  }

  const existingToken = getCookie('csrftoken')
  if (existingToken) {
    return existingToken
  }

  await fetch(`${DJANGO_BASE_URL}/accounts/login/`, {
    method: 'GET',
    credentials: 'include',
  })

  return localStorage.getItem('csrf_token') || getCookie('csrftoken')
}

function notifyCartUpdated(cartCount) {
  window.dispatchEvent(
    new CustomEvent('cart-updated', {
      detail: { cartCount },
    })
  )
}

export async function addToCart(representationId, quantity, priceId) {
  const csrfToken = await ensureCsrfToken()

  const res = await fetch(`${BASE}/cart/add/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({
      representation_id: representationId,
      quantity,
      price_id: priceId,
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.detail || 'Erreur ajout au panier')
  }

  notifyCartUpdated(data.cart_count ?? null)
  return data
}

export async function getCart() {
  const res = await fetch(`${BASE}/cart/`, {
    credentials: 'include',
  })
  if (!res.ok) throw new Error('Erreur chargement panier')
  return res.json()
}

export async function updateCart(representationId, quantity, priceId) {
  const csrfToken = await ensureCsrfToken()

  const res = await fetch(`${BASE}/cart/update/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({
      representation_id: representationId,
      quantity,
      price_id: priceId,
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.detail || 'Erreur mise a jour panier')
  }

  notifyCartUpdated(data.cart_count ?? null)
  return data
}

export async function removeFromCart(representationId, priceId) {
  const csrfToken = await ensureCsrfToken()

  const res = await fetch(`${BASE}/cart/remove/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
    },
    body: JSON.stringify({
      representation_id: representationId,
      price_id: priceId,
    }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.detail || 'Erreur suppression article')
  }

  notifyCartUpdated(data.cart_count ?? null)
  return data
}

export async function clearCart() {
  const csrfToken = await ensureCsrfToken()

  const res = await fetch(`${BASE}/cart/`, {
    method: 'DELETE',
    credentials: 'include',
    headers: {
      'X-CSRFToken': csrfToken,
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.detail || 'Erreur vidage panier')
  }

  notifyCartUpdated(0)
  return data
}
