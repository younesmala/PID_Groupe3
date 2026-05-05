const BASE = '/api'

export async function getShows() {
  const res = await fetch(`${BASE}/public/shows/`)
  if (!res.ok) throw new Error('Erreur chargement shows')
  return res.json()
}

export async function getShowById(slug) {
  const shows = await getShows()
  const show = shows.find((item) => item.slug === slug)

  if (!show) {
    throw new Error('Show introuvable')
  }

  return show
}