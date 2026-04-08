const BASE = '/api'

export async function getShows() {
  const res = await fetch(`${BASE}/shows/`)
  if (!res.ok) throw new Error('Erreur chargement shows')
  return res.json()
}

export async function getShowById(id) {
  const res = await fetch(`${BASE}/shows/${id}/`)
  if (!res.ok) throw new Error('Show introuvable')
  return res.json()
}
