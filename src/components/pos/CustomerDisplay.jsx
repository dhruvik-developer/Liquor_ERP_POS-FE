import { useEffect, useRef, useState } from 'react'
import { ScanLine } from 'lucide-react'
import api from '../../services/api'
import {
  CUSTOMER_DISPLAY_EVENTS,
  CUSTOMER_DISPLAY_STORAGE_KEY,
  createCustomerDisplayChannel,
  getPersistedCustomerDisplaySnapshot,
} from '../../utils/customerDisplay'
import CartItemRow from './customer-display/CartItemRow'
import CartSummary from './customer-display/CartSummary'
import PromoPanel from './customer-display/PromoPanel'

const PROMOTION_ROTATION_INTERVAL = 8000

const DEFAULT_PROMOTION = {
  title: 'Get 15% Off All Local Wines',
  description: 'Discover the best of our region’s vineyards. Ask your cashier for recommendations!',
}

const getChangedItemId = (previousItems, cartItems) => {
  for (let index = cartItems.length - 1; index >= 0; index -= 1) {
    const item = cartItems[index]
    const previousQuantity = previousItems.get(item.id)

    if (previousQuantity !== item.quantity) {
      return item.id
    }
  }

  return cartItems[cartItems.length - 1]?.id || null
}

const CustomerDisplay = () => {
  const [displayState, setDisplayState] = useState(() => getPersistedCustomerDisplaySnapshot())
  const [highlightedItemId, setHighlightedItemId] = useState(null)
  const [animatedItemIds, setAnimatedItemIds] = useState([])
  const [promotions, setPromotions] = useState([])
  const [isLoadingPromotions, setIsLoadingPromotions] = useState(true)
  const [activePromotionIndex, setActivePromotionIndex] = useState(0)
  const previousItemsRef = useRef(new Map())

  useEffect(() => {
    document.title = 'Customer Display'
  }, [])

  useEffect(() => {
    const applySnapshot = (snapshot) => {
      if (!snapshot) return

      setDisplayState((currentSnapshot) => {
        if ((snapshot.updatedAt || 0) < (currentSnapshot.updatedAt || 0)) {
          return currentSnapshot
        }

        return snapshot
      })
    }

    const handleStorage = (event) => {
      if (event.key !== CUSTOMER_DISPLAY_STORAGE_KEY || !event.newValue) return

      try {
        applySnapshot(JSON.parse(event.newValue))
      } catch (error) {
        console.warn('Unable to parse customer display snapshot from storage.', error)
      }
    }

    const channel = createCustomerDisplayChannel()

    const handleChannelMessage = (event) => {
      if (event?.data?.type !== CUSTOMER_DISPLAY_EVENTS.SYNC_STATE) return
      applySnapshot(event.data.payload)
    }

    window.addEventListener('storage', handleStorage)
    channel?.addEventListener('message', handleChannelMessage)
    channel?.postMessage({ type: CUSTOMER_DISPLAY_EVENTS.REQUEST_STATE })

    return () => {
      window.removeEventListener('storage', handleStorage)
      channel?.removeEventListener('message', handleChannelMessage)
      channel?.close()
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const fetchPromotions = async () => {
      setIsLoadingPromotions(true)

      try {
        const response = await api.get('/inventory/promotions/', {
          skipGlobalErrorToast: true,
        })

        const items = Array.isArray(response?.data?.data) ? response.data.data : []

        if (!isMounted) return
        setPromotions(items.filter((item) => item?.status !== false))
      } catch (error) {
        if (!isMounted) return
        setPromotions([])
      } finally {
        if (isMounted) {
          setIsLoadingPromotions(false)
        }
      }
    }

    fetchPromotions()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (promotions.length <= 1) return undefined

    const intervalId = window.setInterval(() => {
      setActivePromotionIndex((currentIndex) => (currentIndex + 1) % promotions.length)
    }, PROMOTION_ROTATION_INTERVAL)

    return () => window.clearInterval(intervalId)
  }, [promotions])

  useEffect(() => {
    if (activePromotionIndex >= promotions.length) {
      setActivePromotionIndex(0)
    }
  }, [activePromotionIndex, promotions.length])

  useEffect(() => {
    const previousItems = previousItemsRef.current
    const cartItems = displayState.cartItems

    if (cartItems.length === 0) {
      previousItemsRef.current = new Map()
      setHighlightedItemId(null)
      setAnimatedItemIds([])
      return undefined
    }

    const nextAnimatedIds = cartItems
      .filter((item) => {
        const previousQuantity = previousItems.get(item.id) || 0
        return item.quantity > previousQuantity
      })
      .map((item) => item.id)

    setHighlightedItemId(getChangedItemId(previousItems, cartItems))
    previousItemsRef.current = new Map(cartItems.map((item) => [item.id, item.quantity]))

    if (nextAnimatedIds.length === 0) return undefined

    setAnimatedItemIds(nextAnimatedIds)
    const timeoutId = window.setTimeout(() => {
      setAnimatedItemIds([])
    }, 550)

    return () => window.clearTimeout(timeoutId)
  }, [displayState.cartItems])

  const cartItems = displayState.cartItems
  const totals = displayState.totals
  const activePromotion = promotions[activePromotionIndex] || DEFAULT_PROMOTION
  return (
    <div
      className="min-h-screen bg-[#f5f6f8] p-5 text-[#111827]"
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <style>
        {`
          @keyframes customer-display-pop {
            0% { transform: translateY(10px); opacity: 0.35; }
            60% { transform: translateY(-2px); opacity: 1; }
            100% { transform: translateY(0); opacity: 1; }
          }
        `}
      </style>

      <div className="mx-auto flex min-h-[calc(100vh-40px)] max-w-[1440px] gap-5 max-[980px]:flex-col">
        <section className="flex min-h-0 flex-[1.85] flex-col overflow-hidden rounded-[12px] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.08)]">
          <header className="border-b border-[#e5e7eb] px-6 pb-4 pt-5">
            <h1 className="text-[18px] font-[800] tracking-[-0.02em] text-[#1f2937]">Your Cart</h1>
            <div className="mt-2 flex items-center gap-2 text-[14px] font-[600] text-[#6b7280]">
              <ScanLine size={15} className="text-[#39a8ff]" />
              <span>Scanning items...</span>
            </div>
          </header>

          <div className="flex-1 overflow-hidden px-4 py-3">
            {cartItems.length === 0 ? (
              <div className="flex h-full items-center justify-center rounded-[10px] border border-dashed border-[#d8dee7] bg-[#fafbfc] px-6 text-center">
                <p className="text-[30px] font-[800] tracking-[-0.03em] text-[#1f2937]">
                  Welcome! Please add items
                </p>
              </div>
            ) : (
              <div className="h-full overflow-y-auto rounded-[10px] bg-white">
                {cartItems.map((item, index) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    isHighlighted={highlightedItemId === item.id}
                    shouldAnimate={animatedItemIds.includes(item.id)}
                    showDivider={index !== cartItems.length - 1}
                  />
                ))}
              </div>
            )}
          </div>

          <CartSummary totals={totals} />
        </section>

        <PromoPanel
          promotion={activePromotion}
          isLoading={isLoadingPromotions}
          hasMultiplePromotions={promotions.length > 1}
          activePromotionIndex={activePromotionIndex}
          promotionCount={promotions.length}
        />
      </div>
    </div>
  )
}

export default CustomerDisplay
