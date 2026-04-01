import { useCallback, useEffect, useState } from 'react'
import api from '../services/api'

let departmentsCache = null
let departmentsErrorCache = null
let departmentsPromise = null
const listeners = new Set()

const notifyListeners = () => {
  listeners.forEach(listener => listener())
}

const toArray = (value) => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  return []
}

const normalizeDepartments = (payload) => {
  const source = payload?.data !== undefined ? payload.data : payload
  return toArray(source)
}

const fetchDepartmentsOnce = async () => {
  if (departmentsPromise) return departmentsPromise

  departmentsPromise = api
    .get('/lookups/departments/')
    .then((response) => {
      departmentsCache = normalizeDepartments(response?.data)
      departmentsErrorCache = null
      notifyListeners()
      return departmentsCache
    })
    .catch((error) => {
      departmentsErrorCache = error?.response?.data?.message || error.message || 'Unable to load departments'
      notifyListeners()
      throw error
    })
    .finally(() => {
      departmentsPromise = null
      notifyListeners()
    })

  return departmentsPromise
}

export const refetchDepartments = async () => {
  departmentsCache = null
  departmentsErrorCache = null
  notifyListeners()
  return fetchDepartmentsOnce()
}

const useDepartments = () => {
  const [departments, setDepartments] = useState(() => departmentsCache || [])
  const [loading, setLoading] = useState(() => !departmentsCache)
  const [error, setError] = useState(() => departmentsErrorCache)

  useEffect(() => {
    const syncState = () => {
      setDepartments(departmentsCache || [])
      setError(departmentsErrorCache)
      setLoading(Boolean(departmentsPromise) || (!departmentsCache && !departmentsErrorCache))
    }

    listeners.add(syncState)
    syncState()

    if (!departmentsCache && !departmentsPromise) {
      fetchDepartmentsOnce().catch(() => {})
    }

    return () => {
      listeners.delete(syncState)
    }
  }, [])

  const refetch = useCallback(async () => {
    setLoading(true)
    try {
      await refetchDepartments()
    } catch (_) {
      // error state is updated by shared cache handler
    }
  }, [])

  return { departments, loading, error, refetch }
}

export default useDepartments
