import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Search, SlidersHorizontal, UserPlus, Minus, Plus, CircleCheck, ShieldAlert } from 'lucide-react'
import CategoryTabs from './CategoryTabs'
import ProductGrid from './ProductGrid'
import { usePosStore } from '../../store/usePosStore'
import useFetch from '../../hooks/useFetch'
import useApi from '../../hooks/useApi'
import { resolveMediaUrl } from '../../utils/url'
import { showToast } from '../../utils/toast'
import { getStoredAuth } from '../../utils/auth'
import { resolveTaxRateDetails } from '../../utils/tax'
import AgeVerificationModal from './AgeVerificationModal'
import CustomerSelectModal from './CustomerSelectModal'
import PaymentMethodModal from './PaymentMethodModal'

const LEGAL_DRINKING_AGE = 21

const roundToTwo = (value) => {
  const num = Number(value) || 0
  return Math.round((num + Number.EPSILON) * 100) / 100
}

const formatCurrency = (value) => `$${(Number(value) || 0).toFixed(2)}`

const getNumericId = (...candidates) => {
  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) {
      return candidate
    }

    if (typeof candidate === 'string') {
      const trimmedCandidate = candidate.trim()
      if (!trimmedCandidate) continue

      const directNumber = Number(trimmedCandidate)
      if (Number.isFinite(directNumber)) {
        return directNumber
      }

      const matchedDigits = trimmedCandidate.match(/\d+/)
      if (matchedDigits) {
        return Number(matchedDigits[0])
      }
    }

    if (candidate && typeof candidate === 'object') {
      const nestedId = getNumericId(
        candidate.id,
        candidate.pk,
        candidate.value,
        candidate.store_id,
        candidate.storeId,
        candidate.shift_id,
        candidate.shiftId,
      )

      if (nestedId !== null) {
        return nestedId
      }
    }
  }

  return null
}

const normalizeOrderPaymentMethod = (paymentMethod) => {
  const normalizedMethod = String(paymentMethod || '').trim().toLowerCase()
  return normalizedMethod === 'cash' ? 'Cash' : 'Card'
}

const getCustomerName = (customer) => (
  customer?.name ||
  customer?.full_name ||
  customer?.customer_name ||
  ''
)

const getCustomerDateOfBirth = (customer) => (
  customer?.dob ||
  customer?.date_of_birth ||
  customer?.dateOfBirth ||
  ''
)

const normalizeDateOfBirth = (value) => {
  if (!value) return null

  const parsedDate = new Date(value)
  if (Number.isNaN(parsedDate.getTime())) return null

  return [
    parsedDate.getFullYear(),
    String(parsedDate.getMonth() + 1).padStart(2, '0'),
    String(parsedDate.getDate()).padStart(2, '0'),
  ].join('-')
}

const getAgeFromDateOfBirth = (value) => {
  const normalizedDateOfBirth = normalizeDateOfBirth(value)
  if (!normalizedDateOfBirth) return null

  const today = new Date()
  const dateOfBirth = new Date(`${normalizedDateOfBirth}T00:00:00`)
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const monthDifference = today.getMonth() - dateOfBirth.getMonth()

  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < dateOfBirth.getDate())) {
    age -= 1
  }

  return age
}

const PosTerminalView = () => {
  const [isCompleting, setIsCompleting] = useState(false)
  const [error, setError] = useState('')
  const [isAgeVerificationOpen, setIsAgeVerificationOpen] = useState(false)
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const previousCartCountRef = useRef(0)
  const previousCheckoutSignatureRef = useRef('')
  const auth = getStoredAuth()

  const { data: categoriesData } = useFetch('/inventory/categories/')
  const { data: productsData, loading: isLoadingProducts } = useFetch('/inventory/products/')
  const { data: taxRatesData } = useFetch('/lookups/tax-rates/')
  const { data: customersData, loading: isLoadingCustomers, refetch: refetchCustomers } = useFetch('/people/customers/')
  const { post } = useApi()

  const taxRates = useMemo(() => (
    Array.isArray(taxRatesData) ? taxRatesData : taxRatesData?.results || []
  ), [taxRatesData])

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
        taxRateSource: p?.tax_rate ?? p?.taxRate ?? null,
        taxRate: resolveTaxRateDetails(p?.tax_rate ?? p?.taxRate, taxRates).rate,
        deposit: Number(p?.deposit_amount ?? p?.deposit ?? 0),
        itemDiscount: Number(p?.discount_amount ?? p?.discount ?? 0),
        ageRestricted: p?.age_restricted !== false,
      }))
  }, [productsData, taxRates])

  const customers = useMemo(() => {
    if (Array.isArray(customersData)) return customersData
    return customersData?.results || []
  }, [customersData])

  const {
    selectedCategory,
    productSearch,
    paymentMethod,
    discount,
    cartItems,
    activeStoreId,
    ageVerification,
    giftCardPayment,
    setCategory,
    setProductSearch,
    setPaymentMethod,
    setGiftCardPayment,
    addToCart,
    increaseCartItem,
    decreaseCartItem,
    clearCart,
    clearGiftCardPayment,
    syncCartItemTaxRates,
    setAgeVerification,
    getTotals,
  } = usePosStore()

  const totals = getTotals()
  const cartRequiresAgeVerification = useMemo(
    () => cartItems.some((item) => item.ageRestricted !== false),
    [cartItems],
  )
  const checkoutSignature = useMemo(
    () => JSON.stringify({
      cartItems: cartItems.map((item) => ({
        id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
      discount,
    }),
    [cartItems, discount],
  )

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

  useEffect(() => {
    const previousCartCount = previousCartCountRef.current

    if (
      previousCartCount === 0
      && cartItems.length > 0
      && cartRequiresAgeVerification
      && !ageVerification.isVerified
    ) {
      setIsAgeVerificationOpen(true)
    }

    if ((!cartRequiresAgeVerification || cartItems.length === 0) && isAgeVerificationOpen) {
      setIsAgeVerificationOpen(false)
    }

    previousCartCountRef.current = cartItems.length
  }, [ageVerification.isVerified, cartItems, cartRequiresAgeVerification, isAgeVerificationOpen])

  useEffect(() => {
    if (!previousCheckoutSignatureRef.current) {
      previousCheckoutSignatureRef.current = checkoutSignature
      return
    }

    if (
      previousCheckoutSignatureRef.current !== checkoutSignature
      && (Number(giftCardPayment?.appliedAmount) || 0) > 0
    ) {
      clearGiftCardPayment()
    }

    previousCheckoutSignatureRef.current = checkoutSignature
  }, [checkoutSignature, clearGiftCardPayment, giftCardPayment?.appliedAmount])

  useEffect(() => {
    if (taxRates.length === 0 || cartItems.length === 0) {
      return
    }

    syncCartItemTaxRates(taxRates)
  }, [cartItems.length, syncCartItemTaxRates, taxRates])

  const handleAgeVerificationCancel = () => {
    setIsAgeVerificationOpen(false)
    clearCart()
  }

  const handleAgeVerificationSuccess = ({ dateOfBirth, method }) => {
    setAgeVerification({
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verifiedDateOfBirth: dateOfBirth,
      method,
    })
    setIsAgeVerificationOpen(false)
  }

  const getCustomerAgeEligibility = (customer) => {
    const customerName = getCustomerName(customer) || 'Selected customer'
    const customerDateOfBirth = getCustomerDateOfBirth(customer)
    const normalizedDateOfBirth = normalizeDateOfBirth(customerDateOfBirth)

    if (!normalizedDateOfBirth) {
      return {
        isEligible: false,
        customerName,
        message: `${customerName} does not have a valid DOB. Update DOB before adding age-restricted items.`,
      }
    }

    const customerAge = getAgeFromDateOfBirth(normalizedDateOfBirth)
    if (customerAge === null || customerAge < LEGAL_DRINKING_AGE) {
      return {
        isEligible: false,
        customerName,
        message: `${customerName} must be at least ${LEGAL_DRINKING_AGE} years old to add this product.`,
      }
    }

    return {
      isEligible: true,
      customerName,
      normalizedDateOfBirth,
    }
  }

  const syncCustomerAgeVerification = (customer) => {
    const customerEligibility = getCustomerAgeEligibility(customer)

    if (!customerEligibility.isEligible) {
      setAgeVerification({
        isVerified: false,
        verifiedAt: null,
        verifiedDateOfBirth: null,
        method: null,
      })
      return customerEligibility
    }

    setAgeVerification({
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verifiedDateOfBirth: customerEligibility.normalizedDateOfBirth,
      method: 'customer_dob',
    })
    setIsAgeVerificationOpen(false)
    return customerEligibility
  }

  const ensureCheckoutReady = () => {
    if (cartItems.length === 0) return false
    setError('')

    if (cartRequiresAgeVerification) {
      if (selectedCustomer) {
        const customerEligibility = syncCustomerAgeVerification(selectedCustomer)
        if (!customerEligibility.isEligible) {
          setError(customerEligibility.message)
          showToast({
            title: 'Age Restriction',
            message: customerEligibility.message,
            type: 'warning',
          })
          return false
        }
      } else if (!ageVerification.isVerified) {
        setIsAgeVerificationOpen(true)
        return false
      }
    }

    return true
  }

  const handleCompleteOrder = async (selectedPaymentMethod = paymentMethod) => {
    if (!ensureCheckoutReady()) return false

    const resolvedPaymentMethod = typeof selectedPaymentMethod === 'string'
      ? selectedPaymentMethod
      : selectedPaymentMethod?.paymentMethod || paymentMethod
    const normalizedPaymentMethod = normalizeOrderPaymentMethod(resolvedPaymentMethod)
    const storeId = getNumericId(
      activeStoreId,
      auth?.store,
      auth?.store_id,
      auth?.storeId,
      auth?.user?.store,
      auth?.user?.store_id,
      auth?.user?.storeId,
      auth?.data?.store,
      auth?.data?.store_id,
      auth?.data?.storeId,
      auth?.data?.user?.store,
      auth?.data?.user?.store_id,
      auth?.data?.user?.storeId,
      auth?.stores?.[0],
      auth?.user?.stores?.[0],
      auth?.data?.user?.stores?.[0],
      localStorage.getItem('active_store_id'),
      localStorage.getItem('store_id'),
    )
    const shiftId = getNumericId(
      auth?.shift,
      auth?.shift_id,
      auth?.shiftId,
      auth?.current_shift,
      auth?.currentShift,
      auth?.user?.shift,
      auth?.user?.shift_id,
      auth?.user?.shiftId,
      auth?.user?.current_shift,
      auth?.user?.currentShift,
      auth?.data?.shift,
      auth?.data?.shift_id,
      auth?.data?.shiftId,
      auth?.data?.current_shift,
      auth?.data?.currentShift,
      auth?.data?.user?.shift,
      auth?.data?.user?.shift_id,
      auth?.data?.user?.shiftId,
      auth?.data?.user?.current_shift,
      auth?.data?.user?.currentShift,
      localStorage.getItem('active_shift_id'),
      localStorage.getItem('shift_id'),
      localStorage.getItem('current_shift_id'),
    )

    setIsCompleting(true)
    setPaymentMethod(normalizedPaymentMethod)

    try {
      const payload = {
        store: storeId,
        customer: getNumericId(selectedCustomer?.id, selectedCustomer?.customer_id, selectedCustomer?.customerId),
        shift: shiftId,
        subtotal: roundToTwo(totals.subtotal),
        tax_amount: roundToTwo(totals.tax || 0),
        discount_amount: roundToTwo(discount || 0),
        total_amount: roundToTwo(totals.subtotal + (totals.tax || 0) - (discount || 0)),
        payment_method: normalizedPaymentMethod,
        status: 'Completed',
        items: cartItems.map((item) => ({
          product: item.id,
          quantity: item.quantity,
          unit_price: roundToTwo(item.price),
          subtotal: roundToTwo((Number(item.price) || 0) * (Number(item.quantity) || 0)),
        })),
      }

      await post('/sales/orders/', payload)
      clearCart()
      setIsPaymentModalOpen(false)
      return true
    } catch (err) {
      console.error('Unable to complete order.', err)
      setError('')
      return false
    } finally {
      setIsCompleting(false)
    }
  }

  const handleOpenPaymentModal = () => {
    if (!ensureCheckoutReady()) return
    setError('')
    setIsPaymentModalOpen(true)
  }

  const handlePaymentMethodSelection = async (method) => {
    setPaymentMethod(method)
    setError('')
  }

  const handleGiftCardPaymentApply = async ({ number, balance, appliedAmount }) => {
    setPaymentMethod('Gift Card')
    setGiftCardPayment({
      number,
      balance,
      appliedAmount: Math.min(roundToTwo(appliedAmount), roundToTwo(totals.grandTotal)),
    })
    setError('')
  }

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer)
    syncCustomerAgeVerification(customer)
    setIsCustomerModalOpen(false)
  }

  const handleCustomerAdded = async (customer) => {
    await refetchCustomers()
    setSelectedCustomer(customer)
    syncCustomerAgeVerification(customer)
    setIsCustomerModalOpen(false)
  }

  const handleAddToCart = (product) => {
    if (product?.ageRestricted === false) {
      addToCart(product)
      return
    }

    if (!selectedCustomer) {
      addToCart(product)
      return
    }

    const customerEligibility = getCustomerAgeEligibility(selectedCustomer)
    if (!customerEligibility.isEligible) {
      showToast({
        title: 'Age Restriction',
        message: customerEligibility.message,
        type: 'warning',
      })
      return
    }

    setAgeVerification({
      isVerified: true,
      verifiedAt: new Date().toISOString(),
      verifiedDateOfBirth: customerEligibility.normalizedDateOfBirth,
      method: 'customer_dob',
    })
    setIsAgeVerificationOpen(false)
    addToCart(product)
  }

  useEffect(() => {
    if (cartItems.length === 0 && isPaymentModalOpen) {
      setIsPaymentModalOpen(false)
    }
  }, [cartItems.length, isPaymentModalOpen])

  return (
    <div className="h-full min-h-0 grid grid-cols-[340px_1fr] bg-[#F3F5F8]">
      <aside className="border-r border-[#E3E8EF] bg-[#F8FAFC] min-h-0">
        <div className="h-full min-h-0 flex flex-col">
          <div className="px-4 pt-5 pb-3">
            <h2 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">Current Order</h2>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto px-3 pb-3">
            {cartItems.length === 0 ? (
              <div className="h-full min-h-[420px] rounded-xl border border-dashed border-[#D8E0EB] bg-white flex items-center justify-center text-[22px] font-black text-[#1E293B] tracking-tight">
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
                      <p
                        className={`flex items-center justify-end gap-1 text-[13px] font-bold transition-colors ${
                          ageVerification.isVerified ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {ageVerification.isVerified ? <CircleCheck size={13} /> : <ShieldAlert size={13} />}
                        <span>
                          {ageVerification.isVerified ? 'Age Verified' : 'Verification Required'}
                        </span>
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
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{totals.taxLabel}</span>
                <span className="text-[13px] font-bold transition-colors text-slate-900">{formatCurrency(totals.tax)}</span>
              </div>
              <div className="border-t border-[#E2E8F0] pt-3 flex items-center justify-between">
                <span className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">Total</span>
                <span className="text-[15px] font-black text-[#1EA7EE] tracking-tight font-poppins">{formatCurrency(totals.grandTotal)}</span>
              </div>

              <button
                type="button"
                onClick={handleOpenPaymentModal}
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
          <button
            type="button"
            onClick={() => setIsCustomerModalOpen(true)}
            className="h-10 max-w-[220px] rounded-lg border border-[#DFE5EF] bg-white px-3 text-[13px] font-semibold text-[#475569] flex items-center gap-2"
          >
            <UserPlus size={14} />
            <span className="truncate">{getCustomerName(selectedCustomer) || 'Select Customer'}</span>
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
            <ProductGrid products={filteredProducts} onAddToCart={handleAddToCart} variant="terminal" />
          )}
        </div>
      </section>

      <AgeVerificationModal
        isOpen={isAgeVerificationOpen}
        onCancel={handleAgeVerificationCancel}
        onVerify={handleAgeVerificationSuccess}
      />

      <CustomerSelectModal
        isOpen={isCustomerModalOpen}
        customers={customers}
        loading={isLoadingCustomers}
        onClose={() => setIsCustomerModalOpen(false)}
        onSelect={handleCustomerSelect}
        onCustomerAdded={handleCustomerAdded}
      />

      <PaymentMethodModal
        isOpen={isPaymentModalOpen}
        cartItems={cartItems}
        totals={totals}
        taxLabel={totals.taxLabel}
        discount={discount}
        paymentMethod={paymentMethod}
        giftCardPayment={giftCardPayment}
        processing={isCompleting}
        onClose={() => setIsPaymentModalOpen(false)}
        onSelectMethod={handlePaymentMethodSelection}
        onApplyGiftCard={handleGiftCardPaymentApply}
        onFinalizeCash={handleCompleteOrder}
      />
    </div>
  )
}

export { PosTerminalView }
export default PosTerminalView
