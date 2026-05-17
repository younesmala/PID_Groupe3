export function formatDate(value, t) {
  if (!value) return t ? t('tickets.no_date') : '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat('fr-BE', { dateStyle: 'medium', timeStyle: 'short' }).format(date)
}

export function getTitle(r) {
  return r.show_title || r.show?.title || r.representation?.show?.title || r.title || `Billet #${r.id || '?'}`
}

export function getDate(r) {
  return r.representation_date || r.booking_date || r.date || r.created_at || r.representation?.when
}

export function getLocation(r, t) {
  return r.location_name || r.location?.name || r.representation?.location?.name || (t ? t('tickets.no_location') : '-')
}

export function getQuantity(r) {
  return r.quantity || r.seats || r.tickets_count || 1
}

export function buildQRData(reservation) {
  return JSON.stringify({
    id: reservation.id || reservation.pk,
    title: getTitle(reservation),
    date: getDate(reservation),
    quantity: getQuantity(reservation),
  })
}

export function buildSingleTicketQRData(reservation, ticketIndex, totalTickets) {
  return JSON.stringify({
    id: `${reservation.id || reservation.pk}-${ticketIndex}`,
    title: getTitle(reservation),
    date: getDate(reservation),
    ticket: `${ticketIndex}/${totalTickets}`,
  })
}
