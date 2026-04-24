const BASE = '/api'

function getErrorMessage(data, fallbackMessage) {
  return data.detail || data.error || fallbackMessage
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

export async function fetchMyReservations() {
  const res = await fetch(`${BASE}/my/reservations/`, {
    method: 'GET',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
    },
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(getErrorMessage(data, 'Impossible de charger vos reservations'))
  }

  return normalizeCollection(data)
}