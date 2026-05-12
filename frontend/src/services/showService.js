const BASE = '/api'
const PUBLIC_SHOWS_CACHE_KEY = 'public_shows_cache'

function readCachedPublicShows() {
  try {
    const rawValue = sessionStorage.getItem(PUBLIC_SHOWS_CACHE_KEY)
    if (!rawValue) return []
    const parsedValue = JSON.parse(rawValue)
    return Array.isArray(parsedValue) ? parsedValue : []
  } catch {
    return []
  }
}

export async function getPublicShows(params = {}) {
  if (Object.keys(params).length === 0) {
    const cachedShows = readCachedPublicShows()
    if (cachedShows.length > 0) {
      return cachedShows
    }
  }

  const query = new URLSearchParams(params).toString()
  const url = `${BASE}/public/shows/${query ? '?' + query : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erreur chargement shows')
  const shows = await res.json()

  if (Object.keys(params).length === 0) {
    try {
      sessionStorage.setItem(PUBLIC_SHOWS_CACHE_KEY, JSON.stringify(shows))
    } catch {
      // ignore cache storage issues
    }
  }

  return shows
}

export async function getPublicLocations() {
  const res = await fetch(`${BASE}/public/representations/`)
  if (!res.ok) return { locations: [] }
  return res.json()
}

export async function getShows() {
  const res = await fetch(`${BASE}/public/shows/`)
  if (!res.ok) throw new Error('Erreur chargement shows')
  return res.json()
}


async function getShowBySlug(slug) {
  const cachedShows = readCachedPublicShows()
  const cachedMatch = cachedShows.find((show) => show.slug === slug)
  if (cachedMatch) {
    return cachedMatch
  }

  const res = await fetch(`${BASE}/shows/${slug}/`)
  if (!res.ok) {
    const publicShows = await getPublicShows()
    const matchedShow = publicShows.find((show) => show.slug === slug)
    if (matchedShow) {
      return matchedShow
    }
    throw new Error('Show introuvable')
  }
  return res.json()
}

export async function getShowByIdentifier(identifier) {
  const rawIdentifier = String(identifier)

  if (!/^\d+$/.test(rawIdentifier)) {
    return getShowBySlug(rawIdentifier)
  }

  const cachedShows = readCachedPublicShows()
  const cachedMatch = cachedShows.find((show) => String(show.id) === rawIdentifier)
  if (cachedMatch) {
    return cachedMatch
  }

  const publicShows = await getPublicShows()
  const matchedShow = publicShows.find((show) => String(show.id) === rawIdentifier)

  if (!matchedShow?.slug) {
    throw new Error('Show introuvable')
  }

  return getShowBySlug(matchedShow.slug)
}

export async function getShowById(identifier) {
  return getShowByIdentifier(identifier)
}
