const BASE = '/api'

export async function getShows() {
  const res = await fetch(`${BASE}/shows/`)
  if (!res.ok) throw new Error('Erreur chargement shows')
  return res.json()
}

export async function getPublicShows() {
  const res = await fetch(`${BASE}/public/shows/`)
  if (!res.ok) throw new Error('Erreur chargement spectacles publics')
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
