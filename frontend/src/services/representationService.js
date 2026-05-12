const BASE = '/api'
const CACHE_PREFIX = 'show_representations_'

const inMemoryRepresentations = new Map()

function readCachedRepresentations(showId) {
  if (inMemoryRepresentations.has(showId)) {
    return inMemoryRepresentations.get(showId)
  }

  try {
    const rawValue = sessionStorage.getItem(`${CACHE_PREFIX}${showId}`)
    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) {
      return null
    }

    inMemoryRepresentations.set(showId, parsedValue)
    return parsedValue
  } catch {
    return null
  }
}

function persistRepresentations(showId, representations) {
  inMemoryRepresentations.set(showId, representations)

  try {
    sessionStorage.setItem(`${CACHE_PREFIX}${showId}`, JSON.stringify(representations))
  } catch {
    // ignore cache storage issues
  }
}

function normalizeRepresentations(payload) {
  if (!Array.isArray(payload)) {
    return []
  }

  return payload.map((representation) => ({
    ...representation,
    available_seats: Number(representation.available_seats ?? 0),
    location: representation.location ?? null,
  }))
}

export async function getRepresentationsByShow(showId) {
  const cachedRepresentations = readCachedRepresentations(showId)
  if (cachedRepresentations) {
    return cachedRepresentations
  }

  try {
    const response = await fetch(`${BASE}/representations/?show=${showId}`)
    if (!response.ok) {
      throw new Error('Erreur chargement representations')
    }

    const payload = await response.json()
    const normalizedRepresentations = normalizeRepresentations(payload)
    persistRepresentations(showId, normalizedRepresentations)
    return normalizedRepresentations
  } catch {
    return cachedRepresentations || []
  }
}
