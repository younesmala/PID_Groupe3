const BASE = '/api'

async function fetchJson(url, errorMessage) {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(errorMessage)
  }
  return res.json()
}

async function getRepresentationAvailability(representationId) {
  try {
    return await fetchJson(
      `${BASE}/representations/${representationId}/availability/`,
      'Erreur chargement disponibilites'
    )
  } catch {
    return null
  }
}

export async function getRepresentationsByShow(showId) {
  const representations = await fetchJson(
    `${BASE}/representations/?show=${showId}`,
    'Erreur chargement representations'
  )

  if (!Array.isArray(representations) || representations.length === 0) {
    return []
  }

  const availabilities = await Promise.all(
    representations.map((representation) => getRepresentationAvailability(representation.id))
  )

  return representations.map((representation, index) => {
    const availability = availabilities[index]

    return {
      ...representation,
      available_seats: availability?.available_seats ?? 0,
      location: availability?.location ?? representation.location ?? null,
    }
  })
}
