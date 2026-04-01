import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

let categoriesCache = null
let categoriesErrorCache = null
let categoriesPromise = null
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  return []
}

const normalizeCategories = (payload) => {
  const source = payload?.data !== undefined ? payload.data : payload
  return toArray(source)
}

const fetchCategoriesOnce = async () => {
  if (categoriesPromise) return categoriesPromise

  categoriesPromise = api
    .get('/inventory/categories/')
    .then((response) => {
      categoriesCache = normalizeCategories(response?.data)
      categoriesErrorCache = null
      notifyListeners()
      return categoriesCache
    })
    .catch((error) => {
      categoriesErrorCache = error?.response?.data?.message || error.message || 'Unable to load categories'
      notifyListeners()
      throw error
    })
    .finally(() => {
      categoriesPromise = null
      notifyListeners()
    })

  return categoriesPromise
}

export const refetchCategories = async () => {
  categoriesCache = null
  categoriesErrorCache = null
  notifyListeners()
  return fetchCategoriesOnce()
}

const useCategories = () => {
  const [categories, setCategories] = useState(() => categoriesCache || [])
  const [loading, setLoading] = useState(() => !categoriesCache)
  const [error, setError] = useState(() => categoriesErrorCache)

  useEffect(() => {
    const syncState = () => {
      setCategories(categoriesCache || [])
      setError(categoriesErrorCache)
      setLoading(Boolean(categoriesPromise) || (!categoriesCache && !categoriesErrorCache))
    }

    listeners.add(syncState)
    syncState()

    if (!categoriesCache && !categoriesPromise) {
      fetchCategoriesOnce().catch(() => {})
    }

    return () => {
      listeners.delete(syncState)
    }
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      await refetchCategories()
    } catch (_) {
      // error state is synced from shared cache
    }
  }, [])

  return { categories, loading, error, refetch }
}

export default useCategories
