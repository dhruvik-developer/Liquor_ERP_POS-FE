import { useCallback, useEffect, useMemo, useState } from 'react'
import { dashboardApi } from '../services/dashboardApi'

const REFRESH_INTERVAL_MS = 45_000

const defaultDateRange = {
  from: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
}

const defaultFilters = {
  storeId: 'all',
  ...defaultDateRange,
}

export const useDashboardData = () => {
  const [filters, setFilters] = useState(defaultFilters)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [dashboard, setDashboard] = useState({
    summary: {},
    stores: [],
    dailySales: [],
    storeSalesComparison: [],
    categorySales: [],
    recentOrders: [],
    pendingOrders: [],
    lowStock: [],
  })

  const storeOptions = useMemo(() => dashboardApi.getStoreOptions(), [])

  const getApiFilters = useCallback(() => ({
    storeId: filters.storeId !== 'all' ? filters.storeId : undefined,
    fromDate: filters.from,
    toDate: filters.to,
  }), [filters])

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true)
    setError('')

    try {
      const apiFilters = getApiFilters()
      const [summary, stores, analytics, recentOrders, lowStock] = await Promise.all([
        dashboardApi.getSummary(apiFilters),
        dashboardApi.getStorePerformance(apiFilters),
        dashboardApi.getSalesAnalytics(apiFilters),
        dashboardApi.getRecentOrders(apiFilters),
        dashboardApi.getLowStock(apiFilters),
      ])

      setDashboard({
        summary,
        stores,
        dailySales: analytics.dailySales,
        storeSalesComparison: analytics.storeSalesComparison,
        categorySales: analytics.categorySales,
        recentOrders,
        pendingOrders: dashboardApi.getPendingOrdersFromRecentOrders(recentOrders),
        lowStock,
      })
    } catch (loadError) {
      setError(loadError?.message || 'Failed to load dashboard data.')
    } finally {
      setIsLoading(false)
    }
  }, [getApiFilters])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  useEffect(() => {
    const intervalId = setInterval(fetchDashboardData, REFRESH_INTERVAL_MS)
    return () => clearInterval(intervalId)
  }, [fetchDashboardData])

  return {
    filters,
    setFilters,
    storeOptions,
    isLoading,
    error,
    dashboard,
    refresh: fetchDashboardData,
  }
}

