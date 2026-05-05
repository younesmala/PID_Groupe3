const BASE = '/api'

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop().split(';').shift()
  return ''
}

async function parseJsonResponse(res) {
  return res.json().catch(() => ({}))
}

function formatValidationErrors(data) {
  const entries = Object.entries(data).filter(([key, value]) => {
    return key !== 'detail' && key !== 'error' && value !== undefined && value !== null
  })

  if (entries.length === 0) {
    return ''
  }

  return entries
    .map(([field, value]) => {
      const messages = Array.isArray(value) ? value.join(', ') : String(value)
      return `${field}: ${messages}`
    })
    .join(' | ')
}

function getErrorMessage(data, fallbackMessage) {
  return data.detail || data.error || formatValidationErrors(data) || fallbackMessage
}

export async function login(username, password) {
  const res = await fetch(`${BASE}/auth/login/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  })

  if (res.status === 501) {
    throw new Error('Service de connexion temporairement indisponible')
  }

  const data = await parseJsonResponse(res)

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Identifiants incorrects'))
  }

  localStorage.setItem('username', data.username || username)

  if (data.csrf_token) {
    localStorage.setItem('csrf_token', data.csrf_token)
  }

  return data
}

export async function signup(userData) {
  const res = await fetch(`${BASE}/auth/signup/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
    },
    body: JSON.stringify({
      username: userData.username,
      email: userData.email,
      password: userData.password,
      password_confirm: userData.password_confirm,
      first_name: userData.first_name,
      last_name: userData.last_name,
      language: userData.language,
    }),
  })

  const data = await parseJsonResponse(res)

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Inscription impossible'))
  }

  return data
}

export async function fetchCurrentUser() {
  const res = await fetch(`${BASE}/users/me/`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  const data = await parseJsonResponse(res)

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Impossible de charger le profil'))
  }

  if (data?.username) {
    localStorage.setItem('username', data.username)
  }

  return data
}

export async function logout() {
  await fetch(`${BASE}/auth/logout/`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'X-CSRFToken': getCookie('csrftoken') || localStorage.getItem('csrf_token') || '',
    },
  })

  localStorage.removeItem('username')
  localStorage.removeItem('csrf_token')
  localStorage.removeItem('user_role')
  localStorage.removeItem('user_is_staff')
}

export function getStoredUsername() {
  return localStorage.getItem('username')
}

export function getStoredUser() {
  const username = localStorage.getItem('username')
  if (!username) return null
  return {
    username,
    role: localStorage.getItem('user_role') || null,
    is_staff: localStorage.getItem('user_is_staff') === 'true',
  }
}

export function storeUser(data) {
  if (data?.username) localStorage.setItem('username', data.username)
  if (data?.role !== undefined) localStorage.setItem('user_role', data.role || '')
  if (data?.is_staff !== undefined) localStorage.setItem('user_is_staff', String(data.is_staff))
}