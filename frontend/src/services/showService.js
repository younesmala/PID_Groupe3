const BASE = '/api'

export async function getPublicShows(params = {}) {
  const query = new URLSearchParams(params).toString()
  const url = `${BASE}/public/shows/${query ? '?' + query : ''}`
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erreur chargement shows')
  return res.json()
}

export async function getPublicLocations() {
  const res = await fetch(`${BASE}/public/representations/`)
  if (!res.ok) return { locations: [] }
  return res.json()
}

export async function getShows() {
  const res = await fetch(`${BASE}/shows/`)
  if (!res.ok) throw new Error('Erreur chargement shows')
  return res.json()
}


async function getShowBySlug(slug) {
  const res = await fetch(`${BASE}/shows/${slug}/`)
  if (!res.ok) throw new Error('Show introuvable')
  return res.json()
}

export async function getShowByIdentifier(identifier) {
  const rawIdentifier = String(identifier)

  if (!/^\d+$/.test(rawIdentifier)) {
    return getShowBySlug(rawIdentifier)
  }

  const publicShows = await getPublicShows()
  const matchedShow = publicShows.find((show) => String(show.id) === rawIdentifier)

  if (!matchedShow?.slug) {
    throw new Error('Show introuvable')
  }

  return getShowBySlug(matchedShow.slug)
}
