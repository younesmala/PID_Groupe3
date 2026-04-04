import { artists as mockArtists } from "../data/artists";

let artists = [...mockArtists];

export function getArtists() {
  return artists;
}

export function getArtistById(id) {
  return artists.find((a) => a.id === Number(id));
}

export function updateArtist(id, data) {
  artists = artists.map((a) =>
    a.id === Number(id) ? { ...a, ...data } : a
  );
  return getArtistById(id);
}

export function deleteArtist(id) {
  artists = artists.filter((a) => a.id !== Number(id));
}
