export const inventoryData = [
  { id: '1', sku: '5008', name: 'REDBULL', size: '8.4 OZ', pack: '24-Pack', price: 3.49, stock: 19, total: 19, type: 'Soft Drink', department: 'Beverage', category: 'Energy Drink', brand: 'Red Bull', supplier: 'Global Dist', image: 'https://images.unsplash.com/photo-1622543953490-0b70ed6fdad1?w=100&h=100&fit=crop' },
  { id: '2', sku: '5009', name: 'TROPICANA ORANGE JUICE', size: '32 OZ', pack: '12-PACK', price: 4.89, stock: 49, total: 49, type: 'Juice', department: 'Beverage', category: 'Fruit Juice', brand: 'Tropicana', supplier: 'Pure Foods', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=100&h=100&fit=crop' },
  { id: '6', sku: '5013', name: 'ANGOSTURA AROMATIC BITTER', size: '4 OZ', pack: '12-PACK', price: 13.99, stock: 24, total: 24, type: 'Liquor', department: 'Spirits', category: 'Aromatic', brand: 'Angostura', supplier: 'Premium Spirits', image: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=100&h=100&fit=crop' },
  { id: '11', sku: '5018', name: 'COCO LOPEZ CREAM OF COCONUT', size: '15 OZ', pack: '24-Pack', price: 4.99, stock: 16, total: 16, type: 'Mixer', department: 'Beverage', category: 'Coconut', brand: 'Coco Lopez', supplier: 'Pure Foods', image: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=100&h=100&fit=crop' },
  { id: '12', sku: '5019', name: 'BACARDI BAHAMA MAMA', size: '1.75 LT', pack: 'Single', price: 24.99, stock: 5, total: 5, type: 'Liquor', department: 'Spirits', category: 'Cocktail', brand: 'Bacardi', supplier: 'Premium Spirits', image: 'https://images.unsplash.com/photo-1614313511387-1436a4480ebb?w=100&h=100&fit=crop' },
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
