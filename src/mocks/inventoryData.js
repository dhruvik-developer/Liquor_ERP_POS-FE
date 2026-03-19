export const inventoryData = [
  { id: '1', sku: '5008', name: 'REDBULL', size: '250ML', pack: '24', price: 2.5, stock: 120, total: 300, type: 'Soft Drink', department: 'Beverage', category: 'Energy Drink', brand: 'Red Bull', supplier: 'Global Dist', image: 'https://images.unsplash.com/photo-1622543953490-0b70ed6fdad1?w=100&h=100&fit=crop' },
  { id: '2', sku: '5009', name: 'TROPICANA ORANGE JUICE', size: '1L', pack: '12', price: 4.0, stock: 85, total: 340, type: 'Juice', department: 'Beverage', category: 'Fruit Juice', brand: 'Tropicana', supplier: 'Pure Foods', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=100&h=100&fit=crop' },
  { id: '3', sku: '5010', name: 'BACARDI CARTA BLANCA', size: '750ML', pack: '6', price: 22.0, stock: 42, total: 924, type: 'Liquor', department: 'Spirits', category: 'Rum', brand: 'Bacardi', supplier: 'Premium Spirits', image: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=100&h=100&fit=crop' },
  { id: '4', sku: '5011', name: 'JACK DANIELS OLD NO. 7', size: '1L', pack: '6', price: 35.0, stock: 15, total: 1050, type: 'Liquor', department: 'Spirits', category: 'Whisky', brand: 'Jack Daniels', supplier: 'Brown-Forman', image: 'https://images.unsplash.com/photo-1527281405159-eb56cf137dcc?w=100&h=100&fit=crop' },
  { id: '5', sku: '5012', name: 'HEINEKEN BEER', size: '330ML', pack: '24', price: 1.8, stock: 240, total: 432, type: 'Beer', department: 'Beer & Wine', category: 'Lager', brand: 'Heineken', supplier: 'Global Dist', image: 'https://images.unsplash.com/photo-1532634710-c03504f47dd0?w=100&h=100&fit=crop' },
  { id: '6', sku: '5013', name: 'GREY GOOSE VODKA', size: '700ML', pack: '6', price: 45.0, stock: 18, total: 810, type: 'Liquor', department: 'Spirits', category: 'Vodka', brand: 'Grey Goose', supplier: 'Premium Spirits', image: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=100&h=100&fit=crop' },
  { id: '7', sku: '5014', name: 'CORONA EXTRA', size: '355ML', pack: '24', price: 2.2, stock: 180, total: 396, type: 'Beer', department: 'Beer & Wine', category: 'Lager', brand: 'Corona', supplier: 'Global Dist', image: 'https://images.unsplash.com/photo-1625902148227-2b509f69795f?w=100&h=100&fit=crop' },
  { id: '8', sku: '5015', name: 'MOET & CHANDON BRUT', size: '750ML', pack: '6', price: 55.0, stock: 5, total: 660, type: 'Wine', department: 'Beer & Wine', category: 'Champagne', brand: 'Moet', supplier: 'LVMH', image: 'https://images.unsplash.com/photo-1594460741527-dc62bb9aac7c?w=100&h=100&fit=crop' },
  { id: '9', sku: '5016', name: 'SMIRNOFF RED', size: '750ML', pack: '12', price: 18.0, stock: 60, total: 1080, type: 'Liquor', department: 'Spirits', category: 'Vodka', brand: 'Smirnoff', supplier: 'Diageo', image: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=100&h=100&fit=crop' },
  { id: '10', sku: '5017', name: 'BUDWEISER MAGNUM', size: '650ML', pack: '12', price: 1.5, stock: 0, total: 450, type: 'Beer', department: 'Beer & Wine', category: 'Strong Beer', brand: 'Budweiser', supplier: 'Global Dist', image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=100&h=100&fit=crop' },
]

export const filterOptions = {
  itemTypes: ['All', 'Liquor', 'Beer', 'Wine', 'Soft Drink', 'Juice'],
  departments: ['All', 'Spirits', 'Beer & Wine', 'Beverage'],
  categories: ['All', 'Whisky', 'Vodka', 'Rum', 'Lager', 'Energy Drink', 'Fruit Juice', 'Champagne'],
  brands: ['All', 'Jack Daniels', 'Bacardi', 'Heineken', 'Red Bull', 'Tropicana', 'Grey Goose', 'Corona', 'Moet', 'Smirnoff', 'Budweiser'],
  suppliers: ['All', 'Global Dist', 'Premium Spirits', 'Pure Foods', 'Brown-Forman', 'LVMH', 'Diageo'],
  sizes: ['All', '250ML', '330ML', '355ML', '650ML', '700ML', '750ML', '1L'],
  packs: ['All', '6', '12', '24']
}
