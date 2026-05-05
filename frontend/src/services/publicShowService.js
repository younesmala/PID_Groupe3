const PUBLIC_SHOWS_URL = '/api/public/shows/'
const CACHE_KEY = 'public_shows_cache'

let inMemoryShows = null
let pendingRequest = null

function readCachedShows() {
  if (inMemoryShows) {
    return inMemoryShows
  }

  try {
    const rawValue = sessionStorage.getItem(CACHE_KEY)
    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue)
    if (!Array.isArray(parsedValue)) {
      return null
    }

    inMemoryShows = parsedValue
    return parsedValue
  } catch {
    return null
  }
}

function persistShows(shows) {
  inMemoryShows = shows

  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(shows))
  } catch {
    // Ignore storage errors and keep the in-memory cache.
  }
}

export async function getPublicShows() {
  const cachedShows = readCachedShows()
  if (cachedShows) {
    return cachedShows
  }

  if (pendingRequest) {
    return pendingRequest
  }

  pendingRequest = fetch(PUBLIC_SHOWS_URL)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Impossible de charger les spectacles publics')
      }

      const shows = await response.json()
      const normalizedShows = Array.isArray(shows) ? shows : []
      persistShows(normalizedShows)
      return normalizedShows
    })
    .catch((error) => {
      const fallbackShows = readCachedShows()
      if (fallbackShows) {
        return fallbackShows
      }

      throw error
    })
    .finally(() => {
      pendingRequest = null
    })

  return pendingRequest
}
