import React, { useMemo, useState } from 'react'
import { Search, SlidersHorizontal, UserPlus, Minus, Plus, CircleCheck } from 'lucide-react'
import CategoryTabs from './CategoryTabs'
import ProductGrid from './ProductGrid'
import { usePosStore } from '../../store/usePosStore'
import useFetch from '../../hooks/useFetch'
import useApi from '../../hooks/useApi'
import { resolveMediaUrl } from '../../utils/url'

const TAX_RATE = 0.18

const roundToTwo = (value) => {
  const num = Number(value) || 0
  return Math.round((num + Number.EPSILON) * 100) / 100
}

const formatCurrency = (value) => `$${(Number(value) || 0).toFixed(2)}`

const PosTerminalView = () => {
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState('')

  const { data: categoriesData } = useFetch('/inventory/categories/')
  const { data: productsData, loading: isLoadingProducts } = useFetch('/inventory/products/')
  const { post } = useApi()

  const categories = categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0
    ? [{ id: 'all', name: 'All Products' }, ...categoriesData.map(c => ({ id: c.id, name: c.name }))]
    : [
        { id: 'whiskey', name: 'Whiskey' },
        { id: 'vodka', name: 'Vodka' },
        { id: 'wine', name: 'Wine' },
        { id: 'beer', name: 'Beer' },
        { id: 'all', name: 'All Products' },
      ]

  const products = useMemo(() => {
    if (!productsData) return []
    const items = Array.isArray(productsData) ? productsData : productsData.results || []
    if (items.length === 0) return []

    return items
      .filter((p) => !p?.item_is_inactive)
      .map((p) => ({
        id: p.id,
        name: p.name,
        categoryId: p.category?.id || p.category || p.category_name || 'all',
        categoryName: p.category?.name || p.category_name || 'Liquor',
        barcode: p.sku || p.barcode || '',
        price: Number(
          p?.cost_pricing?.unit_price ??
          p?.retail_price ??
          p?.price ??
          0,
        ),
        image: resolveMediaUrl(p.image) || null,
        stock: Number(p.stock ?? p.total_stock_available ?? p.stock_quantity ?? 0),
        volume: p?.size?.name || p?.size_name || p?.volume || p?.pack_size || '-',
        abv: p?.abv || p?.alcohol_percentage || '-',
        caseBottle: p?.case_bottle || p?.case_qty || p?.bottle_per_case || '-',
        taxCategory: p?.tax_category?.name || p?.tax_category_name || 'Liquor',
        deposit: Number(p?.deposit_amount ?? p?.deposit ?? 0),
        itemDiscount: Number(p?.discount_amount ?? p?.discount ?? 0),
        ageRestricted: p?.age_restricted !== false,
      }))
  }, [productsData])

  const {
    selectedCategory,
    productSearch,
    paymentMethod,
    discount,
    cartItems,
    setCategory,
    setProductSearch,
    addToCart,
    increaseCartItem,
    decreaseCartItem,
    clearCart,
    getTotals,
  } = usePosStore()

  const totals = getTotals()

  const filteredProducts = useMemo(() => {
    const normalizedSearch = productSearch.trim().toLowerCase()
    return products.filter((product) => {
      const categoryOk = selectedCategory === 'all' || String(product.categoryId) === String(selectedCategory)
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
        total_amount: roundToTwo(totals.grandTotal),
        discount_amount: roundToTwo(totals.discount || 0),
        tax_amount: roundToTwo(totals.tax || 0),
        items: cartItems.map((item) => ({
          product_id: item.id,
          quantity: item.quantity,
          unit_price: roundToTwo(item.price),
        })),
      }

      await post('/sales/orders/', payload)
      clearCart()
    } catch (err) {
      setError(err?.message || 'Unable to complete order')
    } finally {
      setIsCompleting(false)
    }
  }

  return (
    <div className="h-full min-h-0 grid grid-cols-[340px_1fr] bg-[#F3F5F8]">
      <aside className="border-r border-[#E3E8EF] bg-[#F8FAFC] min-h-0">
        <div className="h-full min-h-0 flex flex-col">
          <div className="px-4 pt-5 pb-3">
            <h2 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">Current Order</h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
            {cartItems.length === 0 ? (
              <div className="h-full min-h-[420px] rounded-xl border border-dashed border-[#D8E0EB] bg-white flex items-center justify-center text-[#94A3B8] text-[32px]">
                Cart is empty
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="rounded-2xl border border-[#E4EAF2] bg-[#F3F7FC] p-3">
                    <div className="flex gap-3 items-start">
                      <div className="h-[42px] w-[42px] shrink-0 rounded-xl bg-[#E2E8F0] border border-[#DCE4EF] flex items-center justify-center overflow-hidden">
                        {item.image ? (
                          <img src={resolveMediaUrl(item.image)} alt={item.name} className="h-7 w-7 object-contain" />
                        ) : (
                          <span className="text-[#94A3B8] text-[10px] font-semibold">N/A</span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[13px] font-bold transition-colors text-slate-900 leading-[1.25] line-clamp-2">{item.name}</p>
                            <p className="mt-0.5 text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 truncate">SKU: {item.sku || '-'}</p>
                          </div>

                          <div className="inline-flex items-center rounded-full border border-[#DCE4EF] bg-white h-8 shrink-0 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => decreaseCartItem(item.id)}
                              className="h-full px-2.5 text-[#64748B] hover:bg-[#F8FAFC]"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="px-2 text-[13px] font-bold transition-colors text-slate-900">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => increaseCartItem(item.id)}
                              className="h-full px-2.5 text-[#64748B] hover:bg-[#F8FAFC]"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>

                        <div className="mt-1">
                          <p className="text-[15px] font-black text-[#1EA7EE] tracking-tight font-poppins">{formatCurrency(item.price)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 border-t border-[#E1E8F1] pt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category:</span>
                        <span className="text-[13px] font-bold transition-colors text-slate-900">{item.categoryName}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Volume:</span>
                        <span className="text-[13px] font-bold transition-colors text-slate-900">{item.volume}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Case/Bottle:</span>
                        <span className="text-[13px] font-bold transition-colors text-slate-900">{item.caseBottle}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">ABV:</span>
                        <span className="text-[13px] font-bold transition-colors text-slate-900">{item.abv}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount:</span>
                        <span className="text-[13px] font-bold transition-colors text-emerald-600">-{formatCurrency(item.itemDiscount)}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Category:</span>
                        <span className="text-[13px] font-bold transition-colors text-slate-900">{item.taxCategory}</span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deposit:</span>
                        <span className="text-[13px] font-bold transition-colors text-slate-900">{formatCurrency(item.deposit)}</span>
                      </div>
                      <p className="flex items-center justify-end gap-1 text-[13px] font-bold transition-colors text-emerald-600">
                        <CircleCheck size={13} />
                        <span>{item.ageRestricted ? 'Age Verified' : 'No Verification'}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 ? (
            <div className="shrink-0 border-t border-[#E8EDF4] p-4 bg-[#F8FAFC] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Subtotal</span>
                <span className="text-[13px] font-bold transition-colors text-slate-900">{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount</span>
                <span className="text-[13px] font-bold transition-colors text-emerald-600">-{formatCurrency(discount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
                <span className="text-[13px] font-bold transition-colors text-slate-900">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                <span className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">Total</span>
                <span className="text-[15px] font-black text-[#1EA7EE] tracking-tight font-poppins">{formatCurrency(totals.grandTotal)}</span>
              </div>

              <button
                type="button"
                onClick={handleCompleteOrder}
                disabled={isCompleting || cartItems.length === 0}
                className="w-full h-12 rounded-xl bg-[#1EA7EE] text-white text-[15px] font-black tracking-tight font-poppins disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCompleting ? 'Completing...' : 'Pay Now'}
              </button>
              {error ? <p className="text-[11px] text-rose-600">{error}</p> : null}
            </div>
          ) : null}
        </div>
      </aside>

      <section className="min-w-0 min-h-0 flex flex-col px-4 py-3 overflow-hidden">
        <div className="flex items-center gap-2">
          <div className="flex-1 h-10 rounded-lg border border-[#DFE5EF] bg-white flex items-center px-3 gap-2">
            <Search size={16} className="text-[#94A3B8]" />
            <input
              type="text"
              value={productSearch}
              onChange={(event) => setProductSearch(event.target.value)}
              placeholder="Search product by name or SKU..."
              className="w-full bg-transparent text-[14px] text-[#1E293B] placeholder:text-[#94A3B8] outline-none"
            />
          </div>
          <button type="button" className="h-10 w-10 rounded-lg border border-[#DFE5EF] bg-white text-[#64748B] flex items-center justify-center">
            <SlidersHorizontal size={16} />
          </button>
          <button type="button" className="h-10 rounded-lg border border-[#DFE5EF] bg-white px-3 text-[13px] font-semibold text-[#475569] flex items-center gap-2">
            <UserPlus size={14} />
            Select Customer
          </button>
        </div>

        <div className="mt-4">
          <CategoryTabs
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setCategory}
            variant="underline"
          />
        </div>

        <div className="mt-4 flex-1 min-h-0 overflow-y-auto">
          {isLoadingProducts ? (
            <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(175px,1fr))]">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} className="h-56 animate-pulse rounded-xl bg-slate-100 border border-[#E2E8F0]" />
              ))}
            </div>
          ) : (
            <ProductGrid products={filteredProducts} onAddToCart={addToCart} variant="terminal" />
          )}
        </div>
      </section>
    </div>
  )
}

export { PosTerminalView }
export default PosTerminalView
