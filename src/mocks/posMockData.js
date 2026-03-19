export const posMockStores = [
  { id: 'all', name: 'All Stores' },
  { id: 'st-001', name: 'Downtown Spirits' },
  { id: 'st-002', name: 'West End Liquors' },
  { id: 'st-003', name: 'Airport Fine Wines' },
]

export const posMockCategories = [
  { id: 'all', name: 'All' },
  { id: 'whisky', name: 'Whisky' },
  { id: 'beer', name: 'Beer' },
  { id: 'wine', name: 'Wine' },
  { id: 'vodka', name: 'Vodka' },
  { id: 'rum', name: 'Rum' },
]

export const posMockProducts = [
  { id: 'p-101', name: 'Jack Daniel No. 7', barcode: '890000101', categoryId: 'whisky', price: 48, stock: 24, image: 'https://images.unsplash.com/photo-1584916201218-f4242ceb4809?auto=format&fit=crop&w=300&q=80' },
  { id: 'p-102', name: 'Jameson Irish Whiskey', barcode: '890000102', categoryId: 'whisky', price: 52, stock: 16, image: 'https://images.unsplash.com/photo-1582819509237-d1a2f3c68d89?auto=format&fit=crop&w=300&q=80' },
  { id: 'p-103', name: 'Corona Extra 330ml', barcode: '890000103', categoryId: 'beer', price: 7, stock: 84, image: 'https://images.unsplash.com/photo-1514361892635-6df6f36bf0f2?auto=format&fit=crop&w=300&q=80' },
  { id: 'p-104', name: 'Budweiser 650ml', barcode: '890000104', categoryId: 'beer', price: 6, stock: 58, image: 'https://images.unsplash.com/photo-1566633806327-68e152aaf26d?auto=format&fit=crop&w=300&q=80' },
  { id: 'p-105', name: 'Sula Shiraz', barcode: '890000105', categoryId: 'wine', price: 28, stock: 29, image: 'https://images.unsplash.com/photo-1516594915697-87eb3b1c14ea?auto=format&fit=crop&w=300&q=80' },
  { id: 'p-106', name: 'Jacob Creek Merlot', barcode: '890000106', categoryId: 'wine', price: 31, stock: 12, image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=300&q=80' },
  { id: 'p-107', name: 'Absolut Vodka', barcode: '890000107', categoryId: 'vodka', price: 36, stock: 8, image: 'https://images.unsplash.com/photo-1584225064785-c62a8b43d148?auto=format&fit=crop&w=300&q=80' },
  { id: 'p-108', name: 'Smirnoff Red Label', barcode: '890000108', categoryId: 'vodka', price: 30, stock: 18, image: 'https://images.unsplash.com/photo-1582106245687-cbb466a9f07f?auto=format&fit=crop&w=300&q=80' },
  { id: 'p-109', name: 'Old Monk Rum', barcode: '890000109', categoryId: 'rum', price: 22, stock: 41, image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?auto=format&fit=crop&w=300&q=80' },
  { id: 'p-110', name: 'Bacardi White Rum', barcode: '890000110', categoryId: 'rum', price: 25, stock: 6, image: 'https://images.unsplash.com/photo-1612817288484-6f916006741a?auto=format&fit=crop&w=300&q=80' },
]

export const posMockRecentOrders = [
  { id: 'SO-20013', storeName: 'Downtown Spirits', total: 186, status: 'Completed', createdAt: '2026-03-18T10:18:00Z' },
  { id: 'SO-20012', storeName: 'West End Liquors', total: 92, status: 'Pending', createdAt: '2026-03-18T09:54:00Z' },
  { id: 'SO-20011', storeName: 'Airport Fine Wines', total: 242, status: 'Completed', createdAt: '2026-03-18T09:31:00Z' },
  { id: 'SO-20010', storeName: 'Downtown Spirits', total: 64, status: 'Completed', createdAt: '2026-03-18T09:02:00Z' },
]

