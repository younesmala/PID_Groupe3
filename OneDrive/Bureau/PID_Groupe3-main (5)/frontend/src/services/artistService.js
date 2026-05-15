export async function getArtists() {
  const res = await fetch('/api/artists/', { credentials: 'include' });
  if (!res.ok) throw new Error('Failed to fetch artists');
  return res.json();
}

export async function getArtistById(id) {
  const res = await fetch(`/api/artists/${id}/`, { credentials: 'include' });
  if (!res.ok) throw new Error('Artist not found');
  return res.json();
}

export async function updateArtist(id, data) {
  const res = await fetch(`/api/artists/${id}/`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update artist');
  return res.json();
}

export async function deleteArtist(id) {
  const res = await fetch(`/api/artists/${id}/`, { method: 'DELETE', credentials: 'include' });
  if (!res.ok) throw new Error('Failed to delete artist');
}
