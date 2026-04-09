import { create } from 'zustand'

const TAX_RATE = 0.18

const normalizeCartItem = product => ({
  id: product.id,
  name: product.name,
  price: Number(product.price) || 0,
  quantity: 1,
  image: product.image || null,
  sku: product.barcode || product.sku || '',
  stock: Number(product.stock) || 0,
  categoryName: product.categoryName || 'Liquor',
  volume: product.volume || product.size || '-',
  abv: product.abv || '-',
  caseBottle: product.caseBottle || '-',
  taxCategory: product.taxCategory || 'Liquor',
  deposit: Number(product.deposit) || 0,
  itemDiscount: Number(product.itemDiscount) || 0,
  ageRestricted: product.ageRestricted !== false,
})

const computeTotals = (cartItems, discount) => {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * TAX_RATE
  const grandTotal = Math.max(subtotal + tax - discount, 0)

  return { subtotal, tax, grandTotal }
}

export const usePosStore = create((set, get) => ({
  activeStoreId: 'st-001',
  selectedCategory: 'all',
  productSearch: '',
  paymentMethod: 'Cash',
  discount: 0,
  cartItems: [],
  heldOrders: [],
  orderStatus: 'Pending',
  recentOrders: [],

  setStore: storeId => set({ activeStoreId: storeId }),
  setCategory: categoryId => set({ selectedCategory: categoryId }),
  setProductSearch: value => set({ productSearch: value }),
  setPaymentMethod: method => set({ paymentMethod: method }),
  setDiscount: discount => set({ discount: Number(discount) || 0 }),
  setRecentOrders: orders => set({ recentOrders: orders }),
  setOrderStatus: status => set({ orderStatus: status }),

  addToCart: product => {
    set(state => {
      const existing = state.cartItems.find(item => item.id === product.id)
      if (existing) {
        return {
          cartItems: state.cartItems.map(item => (
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          )),
        }
      }

      return { cartItems: [...state.cartItems, normalizeCartItem(product)] }
    })
  },

  decreaseCartItem: productId => {
    set(state => ({
      cartItems: state.cartItems
        .map(item => (item.id === productId ? { ...item, quantity: item.quantity - 1 } : item))
        .filter(item => item.quantity > 0),
    }))
  },

  increaseCartItem: productId => {
    set(state => ({
      cartItems: state.cartItems.map(item => (
        item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
      )),
    }))
  },

  removeCartItem: productId => {
    set(state => ({
      cartItems: state.cartItems.filter(item => item.id !== productId),
    }))
  },

  clearCart: () => set({ cartItems: [], discount: 0, paymentMethod: 'Cash', orderStatus: 'Pending' }),
  newOrder: () => set({ cartItems: [], discount: 0, paymentMethod: 'Cash', orderStatus: 'Pending' }),

  holdOrder: () => {
    const state = get()
    if (state.cartItems.length === 0) {
      return
    }

    set({
      heldOrders: [
        ...state.heldOrders,
        {
          id: `HOLD-${Date.now()}`,
          storeId: state.activeStoreId,
          items: state.cartItems,
          totals: computeTotals(state.cartItems, state.discount),
          createdAt: new Date().toISOString(),
        },
      ],
      cartItems: [],
      discount: 0,
      orderStatus: 'Pending',
    })
  },

  getTotals: () => {
    const state = get()
    return computeTotals(state.cartItems, state.discount)
  },
}))
