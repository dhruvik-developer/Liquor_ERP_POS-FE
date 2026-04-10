const TAX_RATE = 0.18
const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
})

export const CUSTOMER_DISPLAY_CHANNEL_NAME = 'liquor-pos-customer-display'
export const CUSTOMER_DISPLAY_STORAGE_KEY = 'liquor-pos-customer-display-snapshot'
export const CUSTOMER_DISPLAY_WINDOW_NAME = 'liquor-pos-customer-display-window'

export const CUSTOMER_DISPLAY_EVENTS = {
  REQUEST_STATE: 'CUSTOMER_DISPLAY_REQUEST_STATE',
  SYNC_STATE: 'CUSTOMER_DISPLAY_SYNC_STATE',
}

const roundToTwo = (value) => {
  const amount = Number(value) || 0
  return Math.round((amount + Number.EPSILON) * 100) / 100
}

export const formatCustomerDisplayCurrency = (value) => currencyFormatter.format(Number(value) || 0)

export const computeCustomerDisplayTotals = (cartItems = [], discount = 0) => {
  const subtotal = cartItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0)
  const tax = subtotal * TAX_RATE
  const grandTotal = Math.max(subtotal + tax - (Number(discount) || 0), 0)

  return {
    subtotal: roundToTwo(subtotal),
    tax: roundToTwo(tax),
    discount: roundToTwo(discount),
    grandTotal: roundToTwo(grandTotal),
  }
}

export const createCustomerDisplaySnapshot = ({ cartItems = [], discount = 0 } = {}) => ({
  cartItems: cartItems.map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image || null,
    quantity: Number(item.quantity) || 0,
    price: roundToTwo(item.price),
    lineTotal: roundToTwo((Number(item.price) || 0) * (Number(item.quantity) || 0)),
  })),
  totals: computeCustomerDisplayTotals(cartItems, discount),
  updatedAt: Date.now(),
})

export const getEmptyCustomerDisplaySnapshot = () => createCustomerDisplaySnapshot()

export const persistCustomerDisplaySnapshot = (snapshot) => {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(CUSTOMER_DISPLAY_STORAGE_KEY, JSON.stringify(snapshot))
  } catch (error) {
    console.warn('Unable to persist customer display snapshot.', error)
  }
}

export const getPersistedCustomerDisplaySnapshot = () => {
  if (typeof window === 'undefined') return getEmptyCustomerDisplaySnapshot()

  try {
    const rawSnapshot = window.localStorage.getItem(CUSTOMER_DISPLAY_STORAGE_KEY)
    if (!rawSnapshot) return getEmptyCustomerDisplaySnapshot()

    const parsedSnapshot = JSON.parse(rawSnapshot)
    return {
      ...getEmptyCustomerDisplaySnapshot(),
      ...parsedSnapshot,
      cartItems: Array.isArray(parsedSnapshot?.cartItems) ? parsedSnapshot.cartItems : [],
      totals: {
        ...getEmptyCustomerDisplaySnapshot().totals,
        ...(parsedSnapshot?.totals || {}),
      },
    }
  } catch (error) {
    console.warn('Unable to read persisted customer display snapshot.', error)
    return getEmptyCustomerDisplaySnapshot()
  }
}

export const createCustomerDisplayChannel = () => {
  if (typeof window === 'undefined' || typeof window.BroadcastChannel === 'undefined') {
    return null
  }

  return new window.BroadcastChannel(CUSTOMER_DISPLAY_CHANNEL_NAME)
}
