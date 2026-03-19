const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim()?.replace(/\/$/, '')

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

export const getJson = async (path, params = {}) => {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is missing in .env')
  }

  const response = await fetch(`${API_BASE_URL}${path}${createQueryString(params)}`)
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }
  return response.json()
}

export const postJson = async (path, payload = {}) => {
  if (!API_BASE_URL) {
    throw new Error('VITE_API_BASE_URL is missing in .env')
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return { status: true }
  }

  return response.json()
}
