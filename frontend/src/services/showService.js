const BASE = '/api'

export async function getShows() {
  const res = await fetch(`${BASE}/public/shows/`)
  if (!res.ok) throw new Error('Erreur chargement shows')
  return res.json()
}

export async function getShowById(slug) {
  const res = await fetch(`${BASE}/shows/${slug}/`)
  if (!res.ok) throw new Error('Show introuvable')
  return res.json()
}