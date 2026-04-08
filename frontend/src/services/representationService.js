const BASE = '/api'

export async function getRepresentationsByShow(showId) {
  const res = await fetch(`${BASE}/representations/?show=${showId}`)
  if (!res.ok) throw new Error('Erreur chargement représentations')
  return res.json()
}
