import React, { useMemo, useState, useEffect } from 'react'
import CategoryTabs from './CategoryTabs'
import ProductGrid from './ProductGrid'
import QuickActions from './QuickActions'
import CartItemsList from './CartItemsList'
import BillingSummary from './BillingSummary'
import PaymentSection from './PaymentSection'
import OrderStatusPill from './OrderStatusPill'
import RecentOrdersPanel from './RecentOrdersPanel'
import {
  posMockCategories as INITIAL_CATEGORIES,
  posMockProducts as INITIAL_PRODUCTS,
  posMockRecentOrders as INITIAL_RECENT_ORDERS
} from '../../mocks/posMockData'
import { usePosStore } from '../../store/usePosStore'
import useFetch from '../../hooks/useFetch'
import useApi from '../../hooks/useApi'

const PosTerminalView = () => {
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState('')

  const { data: categoriesData } = useFetch('/inventory/categories/')
  const { data: productsData, loading: isLoadingProducts } = useFetch('/inventory/products/')
  
  const { post } = useApi()

  const categories = categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0 
    ? [{ id: 'all', name: 'All Items' }, ...categoriesData.map(c => ({ id: c.id, name: c.name }))]
    : INITIAL_CATEGORIES

  const products = React.useMemo(() => {
    if (!productsData) return INITIAL_PRODUCTS
    const items = Array.isArray(productsData) ? productsData : productsData.results || []
    if (items.length === 0) return INITIAL_PRODUCTS
    return items.map(p => ({
      id: p.id,
      name: p.name,
      categoryId: p.category?.id || p.category || 'all',
      barcode: p.sku || p.barcode || '',
      price: Number(p.retail_price || p.price || 0),
      image: p.image || null,
      stock: p.stock_quantity || 0,
      color: 'bg-emerald-500' 
    }))
  }, [productsData])

  const {
    selectedCategory,
    productSearch,
    paymentMethod,
    discount,
    cartItems,
    heldOrders,
    orderStatus,
    recentOrders,
    setCategory,
    setPaymentMethod,
    setDiscount,
    setRecentOrders,
    setOrderStatus,
    addToCart,
    increaseCartItem,
    decreaseCartItem,
    removeCartItem,
    clearCart,
    newOrder,
    holdOrder,
    getTotals,
  } = usePosStore()

  const totals = getTotals()

  useEffect(() => {
    if (recentOrders.length === 0) {
      setRecentOrders(INITIAL_RECENT_ORDERS)
    }
  }, [recentOrders.length, setRecentOrders])

  const filteredProducts = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase()
    return products.filter(product => {
      const categoryOk = selectedCategory === 'all' || product.categoryId === selectedCategory
      const searchOk = !normalizedSearch
        || product.name.toLowerCase().includes(normalizedSearch)
        || product.barcode.toLowerCase().includes(normalizedSearch)
      return categoryOk && searchOk
    })
  }, [products, selectedCategory, productSearch])

  const handleCompleteOrder = async () => {
    if (cartItems.length === 0) return
    setIsCompleting(true)
    setError('')
    try {
      const payload = {
        status: 'Completed',
        payment_method: paymentMethod || 'Cash',
        total_amount: totals.grandTotal,
        discount_amount: totals.discount || 0,
        tax_amount: totals.tax || 0,
        items: cartItems.map(item => ({
            product_id: item.id,
            quantity: item.cartQuantity,
            unit_price: item.price
        }))
      }
      const response = await post('/sales/orders/', payload)
      
      setOrderStatus('Completed')
      setRecentOrders([
        {
          id: response?.id ? `SO-${response.id}` : `SO-${Date.now()}`,
          storeName: 'Main Store',
          total: totals.grandTotal,
          status: 'Completed',
          createdAt: new Date().toISOString(),
        },
        ...recentOrders,
      ])
      clearCart()
    } catch (err) {
      setError(err?.message || 'Unable to complete order')
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="grid h-full gap-6 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px]">
      <section className="flex flex-col min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-bold text-[#1E293B]">Products</h2>
            <p className="mt-1 text-[12px] text-[#64748B]">Shortcut keys: Ctrl+F (Search), Ctrl+N (New), Ctrl+H (Hold)</p>
          </div>
          <OrderStatusPill status={orderStatus} />
        </div>

        <div className="mt-6">
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setCategory}
          />
        </div>

        {error ? (
          <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <div className="mt-6 flex-1 overflow-auto pr-1">
          {isLoadingProducts ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-48 animate-pulse rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : (
            <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
          )}
        </div>
      </section>

      <section className="flex flex-col gap-4 sticky top-0 h-[calc(100vh-140px)]">
        <div className="flex flex-col flex-1 min-h-0 rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <div className="mb-4">
            <QuickActions onNewOrder={newOrder} onClearCart={clearCart} onHoldOrder={holdOrder} />
          </div>

          <div className="flex-1 overflow-auto pr-1">
            <CartItemsList
              items={cartItems}
              onIncrease={increaseCartItem}
              onDecrease={decreaseCartItem}
              onRemove={removeCartItem}
            />
          </div>

          <div className="mt-4 space-y-4 pt-4 border-t border-[#E2E8F0]">
            <BillingSummary
              subtotal={totals.subtotal}
              tax={totals.tax}
              discount={discount}
              grandTotal={totals.grandTotal}
              onDiscountChange={setDiscount}
            />

            <PaymentSection
              paymentMethod={paymentMethod}
              onChangeMethod={setPaymentMethod}
              onCompleteOrder={handleCompleteOrder}
              disabled={isCompleting || cartItems.length === 0}
            />
          </div>
        </div>

        <div className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-3 text-[12px] font-medium text-[#64748B] flex justify-between items-center shadow-sm">
          <span>Held Orders</span>
          <span className="bg-[#F8FAFC] text-[#1E293B] px-2 py-1 rounded-md border border-[#E2E8F0]">{heldOrders.length}</span>
        </div>

        <div className="flex-none">
          <RecentOrdersPanel orders={recentOrders} />
        </div>
      </section>
    </div>
  )
}

export default PosTerminalView
