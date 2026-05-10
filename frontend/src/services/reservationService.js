const BASE = "/api"

function parseJsonResponse(res) {
  return res.json().catch(() => ({}))
}

function getErrorMessage(data, fallbackMessage) {
  return data.detail || data.error || fallbackMessage
}

function getCookie(name) {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)

  if (parts.length === 2) {
    return parts.pop().split(";").shift()
  }

  return ""
}

function getAuthHeaders() {
  const token =
    localStorage.getItem("access_token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("token")

  return token
    ? {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      }
    : {
        Accept: "application/json",
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
    method: "GET",
    credentials: "include",
    headers: getAuthHeaders(),
  })

  const data = await parseJsonResponse(res)

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      getErrorMessage(data, "Utilisateur non connecté")
    )
  }

  if (!res.ok) {
    throw new Error(
      getErrorMessage(
        data,
        "Impossible de charger vos réservations"
      )
    )
  }

  return normalizeCollection(data)
}

export async function checkout(paymentData = {}) {
  const csrfToken = getCookie("csrftoken")

  const headers = {
    ...getAuthHeaders(),
    "Content-Type": "application/json",
  }

  if (csrfToken) {
    headers["X-CSRFToken"] = csrfToken
  }

  const res = await fetch(`${BASE}/checkout/`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(paymentData),
  })

  const data = await parseJsonResponse(res)

  if (res.status === 401 || res.status === 403) {
    throw new Error(
      getErrorMessage(
        data,
        "Vous devez être connecté pour commander"
      )
    )
  }

  if (!res.ok) {
    console.log("Erreur checkout :", res.status, data)

    throw new Error(
      getErrorMessage(
        data,
        "Impossible de finaliser la commande"
      )
    )
  }

  return data
}