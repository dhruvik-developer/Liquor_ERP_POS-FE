import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

let brandsCache = null
let brandsErrorCache = null
let brandsPromise = null
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  return []
}

const normalizeBrands = (payload) => {
  const source = payload?.data !== undefined ? payload.data : payload
  return toArray(source)
}

const fetchBrandsOnce = async () => {
  if (brandsPromise) return brandsPromise

  brandsPromise = api
    .get('/lookups/brands/')
    .then((response) => {
      brandsCache = normalizeBrands(response?.data)
      brandsErrorCache = null
      notifyListeners()
      return brandsCache
    })
    .catch((error) => {
      brandsErrorCache = error?.response?.data?.message || error.message || 'Unable to load brands'
      notifyListeners()
      throw error
    })
    .finally(() => {
      brandsPromise = null
      notifyListeners()
    })

  return brandsPromise
}

export const refetchBrands = async () => {
  brandsCache = null
  brandsErrorCache = null
  notifyListeners()
  return fetchBrandsOnce()
}

const useBrands = () => {
  const [brands, setBrands] = useState(() => brandsCache || [])
  const [loading, setLoading] = useState(() => !brandsCache)
  const [error, setError] = useState(() => brandsErrorCache)

  useEffect(() => {
    const syncState = () => {
      setBrands(brandsCache || [])
      setError(brandsErrorCache)
      setLoading(Boolean(brandsPromise) || (!brandsCache && !brandsErrorCache))
    }

    listeners.add(syncState)
    syncState()

    if (!brandsCache && !brandsPromise) {
      fetchBrandsOnce().catch(() => {})
    }

    return () => {
      listeners.delete(syncState)
    }
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      await refetchBrands()
    } catch (_) {
      // error state is synced from shared cache
    }
  }, [])

  return { brands, loading, error, refetch }
}

export default useBrands
