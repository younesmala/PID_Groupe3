import { apiUrl } from './api'

/**
 * Helper to retrieve CSRF token from cookies or localStorage
 */
function getCsrfToken() {
  const value = `; ${document.cookie}`
  const parts = value.split('; csrftoken=')
  const csrfFromCookie = parts.length === 2 ? parts[1].split(';').shift() : ''
  return csrfFromCookie || localStorage.getItem('csrf_token') || ''
}

/**
 * Enhanced API fetch for admin endpoints with proper authentication handling
 * 
 * This function:
 * - Includes session cookies automatically (credentials: 'include')
 * - Sends CSRF token for non-GET requests
 * - Provides detailed error messages for 401/403 responses
 * - Logs authentication issues for debugging
 * 
 * @param {string} path - API endpoint path (e.g., '/admin/users/')
 * @param {object} options - Fetch options
 * @returns {Promise<Response>} - Native fetch Response
 */
export async function adminApiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase()
  const csrfToken = getCsrfToken()

  const isGetRequest = method === 'GET'
  const headers = {
    'Accept': 'application/json',
    ...(csrfToken && !isGetRequest ? { 'X-CSRFToken': csrfToken } : {}),
    ...options.headers,
  }

  console.log(`[adminApi] ${method} ${path}`, {
    hasCsrfToken: !!csrfToken,
    hasSessionCookie: document.cookie.includes('sessionid'),
  })

  try {
    const response = await fetch(apiUrl(path), {
      credentials: 'include', // Critical: ensures cookies are sent
      headers,
      ...options,
      method,
    })

    // Log authentication issues
    if (response.status === 401 || response.status === 403) {
      const body = await response.clone().text()
      console.warn(`[adminApi] Authentication failed (${response.status})`, {
        path,
        status: response.status,
        body: body.substring(0, 200),
        sessionCookie: document.cookie.includes('sessionid'),
        csrfToken: csrfToken.substring(0, 10) + '...',
      })
    }

    return response
  } catch (error) {
    console.error(`[adminApi] Network error: ${path}`, error)
    throw error
  }
}

/**
 * Parse JSON response with better error handling
 * Shows 401/403 errors with helpful context
 */
export async function parseAdminResponse(response, defaultMessage = 'An error occurred') {
  try {
    const data = await response.json()

    if (!response.ok) {
      if (response.status === 401) {
        const message = data?.detail || 'Session expired or authentication missing'
        console.error('[adminApi] 401 Error:', message)
        throw new Error(`Authentication required: ${message}`)
      }
      if (response.status === 403) {
        const message = data?.detail || 'You do not have permission to access this resource'
        console.error('[adminApi] 403 Error:', message)
        throw new Error(`Access denied: ${message}`)
      }

      throw new Error(data?.detail || defaultMessage)
    }

    return data
  } catch (error) {
    // If JSON parsing fails, try plain text
    if (error instanceof SyntaxError) {
      const text = await response.clone().text()
      throw new Error(`Invalid response: ${text.substring(0, 50)}`)
    }
    throw error
  }
}
