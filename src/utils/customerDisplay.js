import { getCartTaxSummary, roundToTwo } from './tax'
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

const normalizeScreenBounds = (screenLike = {}) => ({
  left: Number(screenLike.availLeft ?? screenLike.left ?? 0),
  top: Number(screenLike.availTop ?? screenLike.top ?? 0),
  width: Number(screenLike.availWidth ?? screenLike.width ?? 0),
  height: Number(screenLike.availHeight ?? screenLike.height ?? 0),
})

const areScreensEqual = (firstScreen, secondScreen) => {
  if (!firstScreen || !secondScreen) return false
  if (firstScreen === secondScreen) return true

  const firstBounds = normalizeScreenBounds(firstScreen)
  const secondBounds = normalizeScreenBounds(secondScreen)

  return (
    firstBounds.left === secondBounds.left &&
    firstBounds.top === secondBounds.top &&
    firstBounds.width === secondBounds.width &&
    firstBounds.height === secondBounds.height
  )
}

export const formatCustomerDisplayCurrency = (value) => currencyFormatter.format(Number(value) || 0)

export const computeCustomerDisplayTotals = (cartItems = [], discount = 0, giftCardAppliedAmount = 0) => {
  const subtotal = cartItems.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.quantity) || 0)), 0)
  const { tax, taxLabel } = getCartTaxSummary(cartItems)
  const originalGrandTotal = Math.max(subtotal + tax - (Number(discount) || 0), 0)
  const normalizedGiftCardAppliedAmount = Math.min(
    roundToTwo(giftCardAppliedAmount),
    roundToTwo(originalGrandTotal),
  )
  const grandTotal = Math.max(originalGrandTotal - normalizedGiftCardAppliedAmount, 0)

  return {
    subtotal: roundToTwo(subtotal),
    tax: roundToTwo(tax),
    taxLabel,
    discount: roundToTwo(discount),
    originalGrandTotal: roundToTwo(originalGrandTotal),
    giftCardAppliedAmount: normalizedGiftCardAppliedAmount,
    grandTotal: roundToTwo(grandTotal),
  }
}

export const getCustomerDisplayCartItems = (cartItems = [], ageVerification = null) => {
  const items = Array.isArray(cartItems) ? cartItems : []
  const hasPendingRestrictedItems = items.some((item) => item?.ageRestricted !== false) && !ageVerification?.isVerified

  if (!hasPendingRestrictedItems) {
    return items
  }

  return items.filter((item) => item?.ageRestricted === false)
}

export const createCustomerDisplaySnapshot = ({
  cartItems = [],
  discount = 0,
  giftCardAppliedAmount = 0,
} = {}) => ({
  cartItems: cartItems.map((item) => ({
    id: item.id,
    name: item.name,
    image: item.image || null,
    quantity: Number(item.quantity) || 0,
    price: roundToTwo(item.price),
    lineTotal: roundToTwo((Number(item.price) || 0) * (Number(item.quantity) || 0)),
  })),
  totals: computeCustomerDisplayTotals(cartItems, discount, giftCardAppliedAmount),
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

export const getCustomerDisplayTargetScreen = async () => {
  if (typeof window === 'undefined' || typeof window.getScreenDetails !== 'function') {
    return null
  }

  try {
    const screenDetails = await window.getScreenDetails()
    const screens = Array.isArray(screenDetails?.screens) ? screenDetails.screens : []

    if (screens.length < 2) {
      return null
    }

    const currentScreen = screenDetails?.currentScreen

    return (
      screens.find((screen) => !areScreensEqual(screen, currentScreen)) ||
      screens.find((screen) => screen?.isPrimary === false) ||
      null
    )
  } catch (error) {
    console.warn('Unable to read connected screens for customer display.', error)
    return null
  }
}

export const buildCustomerDisplayPopupFeatures = (targetScreen) => {
  const fallbackScreen = typeof window !== 'undefined' ? window.screen : null
  const bounds = normalizeScreenBounds(targetScreen || fallbackScreen)
  const width = bounds.width || 1280
  const height = bounds.height || 800

  return [
    'popup=yes',
    'resizable=yes',
    'scrollbars=yes',
    `width=${width}`,
    `height=${height}`,
    `left=${bounds.left}`,
    `top=${bounds.top}`,
  ].join(',')
}
