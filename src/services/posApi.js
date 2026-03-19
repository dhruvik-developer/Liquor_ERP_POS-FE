import { posMockCategories, posMockProducts, posMockRecentOrders, posMockStores } from '../mocks/posMockData'
import { getJson } from './http'

const parseList = payload => payload?.data || payload?.results || payload || []

const withFallback = async (requestFn, fallbackValue) => {
  try {
    return await requestFn()
  } catch {
    return fallbackValue
  }
}

export const posApi = {
  getStores: async () => posMockStores,

  getProducts: async params => withFallback(async () => {
    const response = await getJson('/products', params)
    return parseList(response)
  }, posMockProducts),

  getCategories: async () => withFallback(async () => {
    const response = await getJson('/categories')
    const categories = parseList(response)
    if (!categories.find(category => category.id === 'all')) {
      return [{ id: 'all', name: 'All' }, ...categories]
    }
    return categories
  }, posMockCategories),

  getStoreProducts: async params => withFallback(async () => {
    const response = await getJson('/store-products', params)
    return parseList(response)
  }, posMockProducts),

  createOrder: async payload => withFallback(async () => {
    const baseUrl = import.meta.env.VITE_API_BASE_URL?.trim()?.replace(/\/$/, '')
    if (!baseUrl) {
      throw new Error('VITE_API_BASE_URL is missing in .env')
    }

    const response = await fetch(`${baseUrl}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      throw new Error(`Failed to create order (${response.status})`)
    }

    return response.json()
  }, {
    status: true,
    message: 'Order completed successfully',
    data: {
      orderId: `MOCK-${Math.floor(Math.random() * 90000) + 10000}`,
      createdAt: new Date().toISOString(),
    },
  }),

  getRecentOrders: async () => posMockRecentOrders,
}

