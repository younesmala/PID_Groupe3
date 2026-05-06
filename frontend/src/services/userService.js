const BASE = '/api'

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

function getErrorMessage(data, fallbackMessage) {
  return data.detail || data.error || fallbackMessage
}

function parseJsonResponse(res) {
  return res.json().catch(() => ({}))
}

function getAuthHeaders() {
  const token =
    localStorage.getItem('access_token') ||
    localStorage.getItem('authToken') ||
    localStorage.getItem('token')

  return token
    ? {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      }
    : {
        Accept: 'application/json',
      }
}

function normalizeCollection(data) {
  if (Array.isArray(data)) {
    return data
  }

  if (Array.isArray(data?.results)) {
    return data.results
  }

  return []
}

export async function getCurrentUser() {
  const res = await fetch(`${BASE}/users/me/`, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthHeaders(),
  })

  const data = await parseJsonResponse(res)

  if (res.status === 401 || res.status === 403) {
    throw new Error(getErrorMessage(data, 'Utilisateur non connecte'))
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Impossible de charger le profil utilisateur'))
  }

  return data
}

export async function updateProfile(profileData) {
  const res = await fetch(`${BASE}/profile/update/`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify(profileData),
  })

  const data = await parseJsonResponse(res)

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Impossible de mettre a jour le profil'))
  }

  return data
}

export async function fetchMyReservations() {
  const res = await fetch(`${BASE}/my/reservations/`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  const data = await parseJsonResponse(res)

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Impossible de charger vos reservations'))
  }

  return normalizeCollection(data)
}