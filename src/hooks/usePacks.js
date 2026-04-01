import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

let packsCache = null
let packsErrorCache = null
let packsPromise = null
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  return []
}

const normalizePacks = (payload) => {
  const source = payload?.data !== undefined ? payload.data : payload
  return toArray(source)
}

const fetchPacksOnce = async () => {
  if (packsPromise) return packsPromise

  packsPromise = api
    .get('/lookups/packs/')
    .then((response) => {
      packsCache = normalizePacks(response?.data)
      packsErrorCache = null
      notifyListeners()
      return packsCache
    })
    .catch((error) => {
      packsErrorCache = error?.response?.data?.message || error.message || 'Unable to load packs'
      notifyListeners()
      throw error
    })
    .finally(() => {
      packsPromise = null
      notifyListeners()
    })

  return packsPromise
}

export const refetchPacks = async () => {
  packsCache = null
  packsErrorCache = null
  notifyListeners()
  return fetchPacksOnce()
}

const usePacks = () => {
  const [packs, setPacks] = useState(() => packsCache || [])
  const [loading, setLoading] = useState(() => !packsCache)
  const [error, setError] = useState(() => packsErrorCache)

  useEffect(() => {
    const syncState = () => {
      setPacks(packsCache || [])
      setError(packsErrorCache)
      setLoading(Boolean(packsPromise) || (!packsCache && !packsErrorCache))
    }

    listeners.add(syncState)
    syncState()

    if (!packsCache && !packsPromise) {
      fetchPacksOnce().catch(() => {})
    }

    return () => {
      listeners.delete(syncState)
    }
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      await refetchPacks()
    } catch (_) {
      // error state is synced from shared cache
    }
  }, [])

  return { packs, loading, error, refetch }
}

export default usePacks
