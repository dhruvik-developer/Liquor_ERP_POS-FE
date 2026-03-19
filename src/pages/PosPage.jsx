import { useEffect, useMemo, useState } from 'react'
import PosSidebar from '../components/pos/PosSidebar'
import PosTopbar from '../components/pos/PosTopbar'
import CategoryTabs from '../components/pos/CategoryTabs'
import ProductGrid from '../components/pos/ProductGrid'
import QuickActions from '../components/pos/QuickActions'
import CartItemsList from '../components/pos/CartItemsList'
import BillingSummary from '../components/pos/BillingSummary'
import PaymentSection from '../components/pos/PaymentSection'
import OrderStatusPill from '../components/pos/OrderStatusPill'
import RecentOrdersPanel from '../components/pos/RecentOrdersPanel'
import DashboardOverview from '../components/pos/DashboardOverview'
import InventoryManagement from '../components/pos/InventoryManagement'
import PurchaseBills from '../components/pos/PurchaseBills'
import PurchaseOrders from '../components/pos/PurchaseOrders'
import PeopleManagement from '../components/pos/PeopleManagement'
import AddUserPage from '../components/pos/AddUserPage'
import AddCustomerPage from '../components/pos/AddCustomerPage'
import AddVendorPage from '../components/pos/AddVendorPage'
import CashDrawerPage from '../components/pos/CashDrawerPage'
import CreatePurchaseBill from '../components/pos/CreatePurchaseBill'
import SettingsPage from '../components/pos/SettingsPage'
import {
  posMockStores as INITIAL_STORES,
  posMockCategories as INITIAL_CATEGORIES,
  posMockProducts as INITIAL_PRODUCTS,
  posMockRecentOrders as INITIAL_RECENT_ORDERS
} from '../mocks/posMockData'
import { usePosStore } from '../store/usePosStore'

const PosPage = () => {
  const [stores, setStores] = useState(INITIAL_STORES)
  const [categories, setCategories] = useState(INITIAL_CATEGORIES)
  const [products, setProducts] = useState(INITIAL_PRODUCTS)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState('')
  const [activeView, setActiveView] = useState('inventory')

  const {
    activeStoreId,
    selectedCategory,
    productSearch,
    paymentMethod,
    discount,
    cartItems,
    heldOrders,
    orderStatus,
    recentOrders,
    setStore,
    setCategory,
    setProductSearch,
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

  const selectedStore = stores.find(store => store.id === activeStoreId)

  const handleCompleteOrder = async () => {
    if (cartItems.length === 0) {
      return
    }

    setIsCompleting(true)
    setError('')

    try {
      const newOrderId = `SO-${Date.now()}`
      setOrderStatus('Completed')
      setRecentOrders([
        {
          id: newOrderId,
          storeName: selectedStore?.name || 'Store',
          total: totals.grandTotal,
          status: 'Completed',
          createdAt: new Date().toISOString(),
        },
        ...recentOrders,
      ])
      clearCart()
      setOrderStatus('Completed')
    } catch (submitError) {
      setError(submitError?.message || 'Unable to complete order')
    } finally {
      setIsCompleting(false)
    }
  }

  useEffect(() => {
    const onKeyDown = event => {
      const isMeta = event.ctrlKey || event.metaKey
      if (!isMeta) {
        return
      }

      const key = event.key.toLowerCase()
      if (key === 'f') {
        event.preventDefault()
        document.getElementById('product-search')?.focus()
      } else if (key === 'n') {
        event.preventDefault()
        newOrder()
      } else if (key === 'h') {
        event.preventDefault()
        holdOrder()
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [newOrder, holdOrder])

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] flex font-sans">
      <PosSidebar activeView={activeView} onViewChange={setActiveView} />
      
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden ml-[240px]">
          <PosTopbar />

          <main className="flex-1 overflow-y-auto p-6 bg-[#F8FAFC]">
            {activeView === 'dashboard' ? (
              <DashboardOverview />
            ) : activeView === 'inventory' ? (
              <InventoryManagement />
            ) : activeView === 'purchase-bills' ? (
              <PurchaseBills onViewChange={setActiveView} />
            ) : activeView === 'purchase-orders' ? (
              <PurchaseOrders />
            ) : activeView === 'peoples' ? (
              <PeopleManagement onViewChange={setActiveView} />
            ) : activeView === 'add-user' ? (
              <AddUserPage 
                onCancel={() => setActiveView('peoples')}
                onSave={() => setActiveView('peoples')}
              />
            ) : activeView === 'add-customer' ? (
              <AddCustomerPage 
                onCancel={() => setActiveView('peoples')}
                onSave={() => setActiveView('peoples')}
              />
            ) : activeView === 'add-vendor' ? (
              <AddVendorPage 
                onCancel={() => setActiveView('peoples')}
                onSave={() => setActiveView('peoples')}
              />
            ) : activeView === 'reports' ? (
              <div className="flex items-center justify-center h-full text-[#94A3B8] font-bold uppercase tracking-widest bg-white rounded-lg border border-[#E2E8F0] shadow-sm">
                Module Restricted / Coming Soon
              </div>
            ) : activeView === 'cash-drawer' ? (
              <CashDrawerPage />
            ) : activeView === 'create-purchase-bill' ? (
              <CreatePurchaseBill onBack={() => setActiveView('purchase-bills')} />
            ) : activeView === 'settings' ? (
              <SettingsPage />
            ) : (
              <div className="grid h-full gap-6 xl:grid-cols-[1fr_360px] 2xl:grid-cols-[1fr_400px]">
                {/* Product Section */}
                <section className="flex flex-col min-w-0 rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h2 className="text-[20px] font-bold text-[#1E293B]">Products</h2>
                      <p className="mt-1 text-[12px] font-medium text-[#64748B]">
                        Shortcut keys: <span className="text-[#0EA5E9] font-bold">Ctrl+F</span> (Search), <span className="text-[#0EA5E9] font-bold">Ctrl+N</span> (New), <span className="text-[#0EA5E9] font-bold">Ctrl+H</span> (Hold)
                      </p>
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
                          <div key={index} className="h-48 animate-pulse rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]" />
                        ))}
                      </div>
                    ) : (
                      <ProductGrid products={filteredProducts} onAddToCart={addToCart} />
                    )}
                  </div>
                </section>

                {/* Cart & Billing Section */}
                <section className="flex flex-col gap-4 sticky top-0 h-[calc(100vh-120px)]">
                  <div className="flex flex-col flex-1 min-h-0 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm">
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

                    <div className="mt-4 space-y-4 pt-4 border-t border-[#F1F5F9]">
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

                  <div className="rounded-lg border border-[#E2E8F0] bg-white px-5 py-3 text-[14px] font-bold text-[#1E293B] flex justify-between items-center shadow-sm">
                    <span className="uppercase tracking-wider text-[#64748B] text-[12px]">Held Orders</span>
                    <span className="bg-[#F8FAFC] text-[#0EA5E9] px-3 py-1 rounded-md border border-[#E2E8F0]">{heldOrders.length}</span>
                  </div>

                  <div className="flex-none">
                    <RecentOrdersPanel orders={recentOrders} />
                  </div>
                </section>
              </div>
            )}
          </main>
      </div>
    </div>
  )
}

export default PosPage
