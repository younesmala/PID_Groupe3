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

export async function getShowById(id) {
  const res = await fetch(`${BASE}/shows/${id}/`)
  if (!res.ok) throw new Error('Show introuvable')
  return res.json()
}
