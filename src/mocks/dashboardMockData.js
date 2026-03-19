const summary = {
  totalStores: 12,
  totalRevenue: 2864300,
  totalOrders: 14682,
  pendingOrders: 73,
  todaySales: 184200,
  lowStockItems: 21,
  trends: {
    totalRevenue: 9.8,
    totalOrders: 4.1,
    pendingOrders: -6.4,
    todaySales: 12.3,
    lowStockItems: -2.7,
  },
}

const stores = [
  { id: 'st-001', storeName: 'Downtown Spirits', totalSales: 2419, ordersCount: 2631, revenue: 522440 },
  { id: 'st-002', storeName: 'West End Liquors', totalSales: 2160, ordersCount: 2320, revenue: 457900 },
  { id: 'st-003', storeName: 'Airport Fine Wines', totalSales: 1846, ordersCount: 2024, revenue: 389600 },
  { id: 'st-004', storeName: 'Harbor Cellars', totalSales: 1540, ordersCount: 1700, revenue: 334120 },
  { id: 'st-005', storeName: 'Uptown Reserve', totalSales: 1387, ordersCount: 1521, revenue: 306300 },
]

const dailySales = [
  { label: 'Mar 12', sales: 154000 },
  { label: 'Mar 13', sales: 161200 },
  { label: 'Mar 14', sales: 149800 },
  { label: 'Mar 15', sales: 168600 },
  { label: 'Mar 16', sales: 175500 },
  { label: 'Mar 17', sales: 181300 },
  { label: 'Mar 18', sales: 184200 },
]

const storeSalesComparison = stores.map(store => ({
  storeName: store.storeName,
  sales: store.revenue,
}))

const categorySales = [
  { name: 'Whisky', value: 34 },
  { name: 'Wine', value: 26 },
  { name: 'Vodka', value: 18 },
  { name: 'Rum', value: 12 },
  { name: 'Beer', value: 10 },
]

const recentOrders = [
  { orderId: 'ORD-9932', store: 'Downtown Spirits', amount: 4200, status: 'Completed', date: '2026-03-18T09:05:00Z' },
  { orderId: 'ORD-9931', store: 'West End Liquors', amount: 2860, status: 'Pending', date: '2026-03-18T08:54:00Z' },
  { orderId: 'ORD-9929', store: 'Airport Fine Wines', amount: 1930, status: 'Completed', date: '2026-03-18T08:18:00Z' },
  { orderId: 'ORD-9927', store: 'Harbor Cellars', amount: 3520, status: 'Pending', date: '2026-03-18T07:44:00Z' },
  { orderId: 'ORD-9926', store: 'Uptown Reserve', amount: 2240, status: 'Completed', date: '2026-03-18T07:12:00Z' },
]

const pendingOrders = [
  { storeName: 'West End Liquors', count: 22, urgency: 'High' },
  { storeName: 'Harbor Cellars', count: 18, urgency: 'Medium' },
  { storeName: 'Downtown Spirits', count: 14, urgency: 'Medium' },
  { storeName: 'Airport Fine Wines', count: 11, urgency: 'Low' },
  { storeName: 'Uptown Reserve', count: 8, urgency: 'Low' },
]

const lowStock = [
  { productName: 'Lagavulin 16', store: 'Downtown Spirits', remainingQty: 4 },
  { productName: 'Grey Goose 750ml', store: 'West End Liquors', remainingQty: 6 },
  { productName: 'Jameson Black Barrel', store: 'Airport Fine Wines', remainingQty: 7 },
  { productName: 'Moet Brut', store: 'Uptown Reserve', remainingQty: 5 },
  { productName: 'Bacardi Carta Blanca', store: 'Harbor Cellars', remainingQty: 3 },
]

const storeOptions = [
  { value: 'all', label: 'All Stores' },
  ...stores.map(store => ({ value: store.id, label: store.storeName })),
]

export const dashboardMockData = {
  summary,
  stores,
  dailySales,
  storeSalesComparison,
  categorySales,
  recentOrders,
  pendingOrders,
  lowStock,
  storeOptions,
}

