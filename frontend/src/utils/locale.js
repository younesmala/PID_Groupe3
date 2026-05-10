export function tField(obj, field, lang) {
  if (!obj) return ''
  return obj[`${field}_${lang}`] || obj[`${field}_fr`] || obj[field] || ''
}
