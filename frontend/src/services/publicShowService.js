const PUBLIC_SHOWS_URL = '/api/public/shows/'

export async function getPublicShows() {
  const response = await fetch(PUBLIC_SHOWS_URL)

  if (!response.ok) {
    throw new Error('Impossible de charger les spectacles publics')
  }

  return response.json()
}
