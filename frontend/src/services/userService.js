import { API_ROOT } from './api'

const BASE = API_ROOT

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

async function ensureCsrfToken() {
  const storedToken = localStorage.getItem('csrf_token')
  if (storedToken) return storedToken

  const cookieToken = getCookie('csrftoken')
  if (cookieToken) return cookieToken

  const res = await fetch(`${BASE}/auth/csrf/`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  const data = await parseJsonResponse(res)
  const csrfToken = data.csrf_token || getCookie('csrftoken') || ''

  if (csrfToken) {
    localStorage.setItem('csrf_token', csrfToken)
  }

  return csrfToken
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
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
    },
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
  const csrfToken = await ensureCsrfToken()
  const res = await fetch(`${BASE}/profile/update/`, {
    method: 'PUT',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': csrfToken,
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
  const res = await fetch(`${BASE}/my/reservations/?_=${Date.now()}`, {
    method: 'GET',
    cache: 'no-store',
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
