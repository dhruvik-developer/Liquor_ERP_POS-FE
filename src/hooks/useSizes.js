import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

let sizesCache = null
let sizesErrorCache = null
let sizesPromise = null
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  return []
}

const normalizeSizes = (payload) => {
  const source = payload?.data !== undefined ? payload.data : payload
  return toArray(source)
}

const fetchSizesOnce = async () => {
  if (sizesPromise) return sizesPromise

  sizesPromise = api
    .get('/lookups/sizes/')
    .then((response) => {
      sizesCache = normalizeSizes(response?.data)
      sizesErrorCache = null
      notifyListeners()
      return sizesCache
    })
    .catch((error) => {
      sizesErrorCache = error?.response?.data?.message || error.message || 'Unable to load sizes'
      notifyListeners()
      throw error
    })
    .finally(() => {
      sizesPromise = null
      notifyListeners()
    })

  return sizesPromise
}

export const refetchSizes = async () => {
  sizesCache = null
  sizesErrorCache = null
  notifyListeners()
  return fetchSizesOnce()
}

export const fetchSizeById = async (id) => {
  if (!id) return null
  const response = await api.get(`/lookups/sizes/${id}/`)
  const source = response?.data?.data !== undefined ? response.data.data : response.data
  return source || null
}

const useSizes = () => {
  const [sizes, setSizes] = useState(() => sizesCache || [])
  const [loading, setLoading] = useState(() => !sizesCache)
  const [error, setError] = useState(() => sizesErrorCache)

  useEffect(() => {
    const syncState = () => {
      setSizes(sizesCache || [])
      setError(sizesErrorCache)
      setLoading(Boolean(sizesPromise) || (!sizesCache && !sizesErrorCache))
    }

    listeners.add(syncState)
    syncState()

    if (!sizesCache && !sizesPromise) {
      fetchSizesOnce().catch(() => {})
    }

    return () => {
      listeners.delete(syncState)
    }
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      await refetchSizes()
    } catch {
      // error state is synced from shared cache
    }
  }, [])

  return { sizes, loading, error, refetch }
}

export default useSizes
