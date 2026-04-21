const BASE = '/api'

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({ username, password }),
  })

  if (res.status === 501) {
    throw new Error('Service de connexion temporairement indisponible')
  }

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.detail || data.error || 'Identifiants incorrects')
  }

  localStorage.setItem('username', username)
  return data
}

export async function logout() {
  await fetch(`${BASE}/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRFToken': getCookie('csrftoken'),
    },
  })
  localStorage.removeItem('username')
}

export function getStoredUsername() {
  return localStorage.getItem('username')
}
