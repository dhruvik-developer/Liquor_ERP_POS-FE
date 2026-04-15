import { normalizeUrl } from '../utils/url'
import { showErrorToast } from '../utils/toast'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim()?.replace(/\/+$/, '')
const NGROK_SKIP_WARNING_HEADER = 'true'
const shouldSendNgrokHeader = (() => {
  try {
    const hostname = new URL(API_BASE_URL).hostname
    return hostname.includes('ngrok')
  } catch {
    return false
  }
})()

const createBaseHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  }

  if (shouldSendNgrokHeader) {
    headers['ngrok-skip-browser-warning'] = NGROK_SKIP_WARNING_HEADER
  }

  return headers
}

const createQueryString = params => {
  const searchParams = new URLSearchParams()

  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value)
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `?${queryString}` : ''
}

const parseErrorMessage = async (response) => {
  try {
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      const errorData = await response.json()
      if (typeof errorData?.message === 'string' && errorData.message.trim()) return errorData.message
      if (typeof errorData?.detail === 'string' && errorData.detail.trim()) return errorData.detail
      if (Array.isArray(errorData?.non_field_errors) && errorData.non_field_errors.length > 0) {
        return `${errorData.non_field_errors[0]}`
      }
    } else {
      const text = await response.text()
      if (text?.trim()) return text
    }
  } catch (error) {
    console.error('Failed to parse API error response:', error)
  }

  return `Request failed (${response.status})`
}

export const getJson = async (path, params = {}) => {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is missing in .env')
  }

  const token = localStorage.getItem('access_token')
  const headers = createBaseHeaders()

  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`
  }

  const normalizedPath = normalizeUrl(path)
  try {
    const response = await fetch(`${API_BASE_URL}${normalizedPath}${createQueryString(params)}`, {
      headers,
    })

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(response)
      showErrorToast(errorMessage)
      const requestError = new Error(errorMessage)
      requestError.toastShown = true
      throw requestError
    }

    return response.json()
  } catch (error) {
    if (error?.name !== 'AbortError' && !error?.toastShown) {
      showErrorToast(error?.message || 'This action is not allowed for demo.')
    }
    throw error
  }
}

export const postJson = async (path, payload = {}) => {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is missing in .env')
  }

  const token = localStorage.getItem('access_token')
  const headers = createBaseHeaders()

  if (token && token !== 'undefined' && token !== 'null') {
    headers['Authorization'] = `Bearer ${token}`
  }

  const normalizedPath = normalizeUrl(path)
  try {
    const response = await fetch(`${API_BASE_URL}${normalizedPath}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorMessage = await parseErrorMessage(response)
      showErrorToast(errorMessage)
      const requestError = new Error(errorMessage)
      requestError.toastShown = true
      throw requestError
    }

    if (response.status === 204) {
      return { status: true }
    }

    return response.json()
  } catch (error) {
    if (error?.name !== 'AbortError' && !error?.toastShown) {
      showErrorToast(error?.message || 'This action is not allowed for demo.')
    }
    throw error
  }
}
