import { dashboardMockData } from '../mocks/dashboardMockData'
import { getJson } from './http'

const asArray = payload => payload?.data || payload?.results || payload || []
const asObject = payload => payload?.data || payload || {}

const withFallback = async (requestFn, fallbackData) => {
  try {
    return await requestFn()
  } catch {
    return fallbackData
  }
}

export const dashboardApi = {
  getSummary: filters => withFallback(async () => {
    const response = await getJson('/dashboard/summary/', filters)
    return asObject(response)
  }, dashboardMockData.summary),

  getStorePerformance: filters => withFallback(async () => {
    const response = await getJson('/dashboard/store-performance/', filters)
    return asArray(response)
  }, dashboardMockData.stores),

  getSalesAnalytics: filters => withFallback(async () => {
    const response = await getJson('/dashboard/sales-analytics/', filters)
    return {
      dailySales: asArray(response?.dailySales || response?.daily || response?.line),
      storeSalesComparison: asArray(response?.storeSalesComparison || response?.storeWise || response?.bar),
      categorySales: asArray(response?.categorySales || response?.categories || response?.pie),
    }
  }, {
    dailySales: dashboardMockData.dailySales,
    storeSalesComparison: dashboardMockData.storeSalesComparison,
    categorySales: dashboardMockData.categorySales,
  }),

  getRecentOrders: filters => withFallback(async () => {
    const response = await getJson('/dashboard/recent-orders/', filters)
    return asArray(response)
  }, dashboardMockData.recentOrders),

  getLowStock: filters => withFallback(async () => {
    const response = await getJson('/dashboard/low-stock/', filters)
    return asArray(response)
  }, dashboardMockData.lowStock),

  getStoreOptions: () => dashboardMockData.storeOptions,

  getPendingOrdersFromRecentOrders: orders => {
    const grouped = orders
      .filter(order => `${order.status}`.toLowerCase() === 'pending')
      .reduce((acc, order) => {
        const key = order.store || 'Unknown'
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})

    const pendingList = Object.entries(grouped).map(([storeName, count]) => ({
      storeName,
      count,
      urgency: count >= 20 ? 'High' : count >= 12 ? 'Medium' : 'Low',
    }))

    if (pendingList.length === 0) {
      return dashboardMockData.pendingOrders
    }

    return pendingList.sort((a, b) => b.count - a.count)
  },
}
