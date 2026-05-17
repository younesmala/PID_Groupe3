const rawApiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '').trim()

const normalizedApiBaseUrl = rawApiBaseUrl
  .replace(/\/+$/, '')
  .replace(/\/api$/, '')

export function absoluteUrl(path = '') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return normalizedApiBaseUrl ? `${normalizedApiBaseUrl}${normalizedPath}` : normalizedPath
}

export function apiUrl(path = '') {
  if (!path) {
    return absoluteUrl('/api')
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return absoluteUrl(`/api${normalizedPath}`)
}

export const API_ROOT = apiUrl()
