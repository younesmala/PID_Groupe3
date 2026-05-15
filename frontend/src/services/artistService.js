import { apiUrl } from './api'

export async function getArtists() {
  const res = await fetch(apiUrl('/artists/'));
  if (!res.ok) throw new Error('Failed to fetch artists');
  return res.json();
}

export async function getArtistById(id) {
  const res = await fetch(apiUrl(`/artists/${id}/`));
  if (!res.ok) throw new Error('Artist not found');
  return res.json();
}

export async function createArtist(data) {
  const res = await fetch(apiUrl('/artists/'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to create artist');
  return res.json();
}

export async function updateArtist(id, data) {
  const res = await fetch(apiUrl(`/artists/${id}/`), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Failed to update artist');
  return res.json();
}

export async function deleteArtist(id) {
  const res = await fetch(apiUrl(`/artists/${id}/`), { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete artist');
}
