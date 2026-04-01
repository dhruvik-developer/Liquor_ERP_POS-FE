import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

let subCategoriesCache = null
let subCategoriesErrorCache = null
let subCategoriesPromise = null
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  return []
}

const normalizeSubCategories = (payload) => {
  const source = payload?.data !== undefined ? payload.data : payload
  return toArray(source)
}

const fetchSubCategoriesOnce = async () => {
  if (subCategoriesPromise) return subCategoriesPromise

  subCategoriesPromise = api
    .get('/inventory/sub-categories/')
    .then((response) => {
      subCategoriesCache = normalizeSubCategories(response?.data)
      subCategoriesErrorCache = null
      notifyListeners()
      return subCategoriesCache
    })
    .catch((error) => {
      subCategoriesErrorCache = error?.response?.data?.message || error.message || 'Unable to load sub-categories'
      notifyListeners()
      throw error
    })
    .finally(() => {
      subCategoriesPromise = null
    })

  return subCategoriesPromise
}

export const refetchSubCategories = async () => {
  subCategoriesCache = null
  subCategoriesErrorCache = null
  notifyListeners()
  return fetchSubCategoriesOnce()
}

const useSubCategories = () => {
  const [subCategories, setSubCategories] = useState(() => subCategoriesCache || [])
  const [loading, setLoading] = useState(() => !subCategoriesCache)
  const [error, setError] = useState(() => subCategoriesErrorCache)

  useEffect(() => {
    const syncState = () => {
      setSubCategories(subCategoriesCache || [])
      setError(subCategoriesErrorCache)
      setLoading(Boolean(subCategoriesPromise) || !subCategoriesCache)
    }

    listeners.add(syncState)
    syncState()

    if (!subCategoriesCache && !subCategoriesPromise) {
      fetchSubCategoriesOnce().catch(() => {})
    }

    return () => {
      listeners.delete(syncState)
    }
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      await refetchSubCategories()
    } catch (_) {
      // error state is synced from shared cache
    }
  }, [])

  return { subCategories, loading, error, refetch }
}

export default useSubCategories
