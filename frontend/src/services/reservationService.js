const BASE = '/api'

function parseJsonResponse(res) {
  return res.json().catch(() => ({}))
}

function getErrorMessage(data, fallbackMessage) {
  return data.detail || data.error || fallbackMessage
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

export async function getMyReservations() {
  const res = await fetch(`${BASE}/my/reservations/`, {
    method: 'GET',
    credentials: 'include',
    headers: getAuthHeaders(),
  })

  const data = await parseJsonResponse(res)

  if (res.status === 401 || res.status === 403) {
    throw new Error(getErrorMessage(data, 'Utilisateur non connecte'))
  }

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Impossible de charger vos reservations'))
  }

  return normalizeCollection(data)
}