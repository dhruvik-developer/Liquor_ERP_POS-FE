import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ChevronDown, Calculator, Plus, Trash2, X, Search } from 'lucide-react'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'
import { useCalculator } from '../../context/CalculatorContext'
import useFetch from '../../hooks/useFetch'
import useApi from '../../hooks/useApi'

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

const asNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const formatCompactNumber = (value, fallback = '0') => {
  const numeric = asNumber(value, Number.NaN)
  if (!Number.isFinite(numeric)) return fallback
  if (Number.isInteger(numeric)) return String(numeric)
  return String(numeric)
}

const toInputDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const normalizeOrders = (ordersData) => {
  if (Array.isArray(ordersData)) return ordersData
  if (Array.isArray(ordersData?.results)) return ordersData.results
  if (Array.isArray(ordersData?.data?.results)) return ordersData.data.results
  if (Array.isArray(ordersData?.data)) return ordersData.data
  return []
}

const getNextPoNumber = (ordersData) => {
  const orders = normalizeOrders(ordersData)
  const maxPoNumber = orders.reduce((max, order) => {
    const rawPoNumber = getFirstDefined(order?.po_number, order?.po_no, order?.number, order?.order_number)
    const parsedPoNumber = Number.parseInt(rawPoNumber, 10)
    if (!Number.isFinite(parsedPoNumber)) return max
    return Math.max(max, parsedPoNumber)
  }, 0)

  return String(maxPoNumber + 1)
}

const createPoId = () => {
  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}${String(now.getMilliseconds()).padStart(3, '0')}`
  const randomSuffix = String(Math.floor(Math.random() * 10000)).padStart(4, '0')
  return `POR${stamp}${randomSuffix}`
}

const SHIP_TO_OPTIONS = ['In-Store', 'Warehouse']

const CreatePurchaseOrder = () => {
  const { openCalculator } = useCalculator()
  const navigate = useNavigate()
  const { id } = useParams()

  const [poDate, setPoDate] = useState(toInputDate(new Date()))
  const [selectedVendor, setSelectedVendor] = useState('')
  const [vendorOrderNumber, setVendorOrderNumber] = useState('')
  const [address, setAddress] = useState('')
  const [shipTo, setShipTo] = useState('')
  const [shipBy, setShipBy] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState([])
  const [receivedDate, setReceivedDate] = useState('')
  const [isReadOnly, setIsReadOnly] = useState(false)

  const [selectedProductId, setSelectedProductId] = useState('')
  const [productCodeInput, setProductCodeInput] = useState('')
  const [productCodeLookupMessage, setProductCodeLookupMessage] = useState('')
  const [addQty, setAddQty] = useState('')
  const [addUnitCost, setAddUnitCost] = useState('')
  const [addCaseQty, setAddCaseQty] = useState('')
  const [buyAsBottle, setBuyAsBottle] = useState(false)
  const [duplicateSku, setDuplicateSku] = useState('')
  const [selectedItemIds, setSelectedItemIds] = useState([])
  
  const [showVendorModal, setShowVendorModal] = useState(false)
  const [showProductModal, setShowProductModal] = useState(false)
  const [vendorSearch, setVendorSearch] = useState('')
  const [productSearch, setProductSearch] = useState('')

  const { data: vendorsData, loading: vendorsLoading, error: vendorsError } = useFetch('/people/vendors/')
  const { data: productsData, loading: productsLoading, error: productsError } = useFetch('/inventory/products/')
  const { data: ordersData, loading: ordersLoading } = useFetch('/purchasing/orders/')
  const { data: poData, loading: poLoading } = useFetch(id ? `/purchasing/orders/${id}/` : null)

  const { post, patch, loading: saving, error: apiError } = useApi()

  const vendors = useMemo(() => {
    if (Array.isArray(vendorsData)) return vendorsData
    if (Array.isArray(vendorsData?.results)) return vendorsData.results
    if (Array.isArray(vendorsData?.data?.results)) return vendorsData.data.results
    if (Array.isArray(vendorsData?.data)) return vendorsData.data
    return []
  }, [vendorsData])

  const vendorOptions = useMemo(() => {
    return vendors.map((v) => ({
      ...v,
      id: v.id,
      name: v.vendor_name || v.company_name || v.name || `Vendor ${v.id}`,
      subText: v.phone || v.email || '',
      salesPerson: v.sales_person || v.contact_name || v.contact_person || 'N/A'
    }))
  }, [vendors])

  const filteredVendorOptions = useMemo(() => {
    const q = vendorSearch.toLowerCase().trim()
    if (!q) return vendorOptions
    return vendorOptions.filter(v => 
      v.name.toLowerCase().includes(q) || 
      String(v.id).includes(q) || 
      v.salesPerson.toLowerCase().includes(q)
    )
  }, [vendorOptions, vendorSearch])

  const selectedVendorLabel = useMemo(() => {
    return vendorOptions.find((v) => String(v.id) === String(selectedVendor))?.name || ''
  }, [vendorOptions, selectedVendor])

  const products = useMemo(() => {
    const productList = Array.isArray(productsData)
      ? productsData
      : Array.isArray(productsData?.results)
      ? productsData.results
      : Array.isArray(productsData?.data?.results)
      ? productsData.data.results
      : Array.isArray(productsData?.data)
      ? productsData.data
      : []

    return productList.map((product, index) => {
      const size = getFirstDefined(product.size?.name, product.size_name, product.size, '')
      const pack = getFirstDefined(product.pack?.name, product.pack_name, product.pack, '')
      const sizePack = [size, pack].filter(Boolean).join(',')
      const caseUnits = asNumber(
        getFirstDefined(product.units_in_case, product.case_units, product.bpc, product.units_per_case, product.pack_quantity, 1),
        1
      )
      const unitCost = asNumber(
        getFirstDefined(
          product.cost_pricing?.unit_cost,
          product.last_cost,
          product.cost_price,
          product.cost,
          product.unit_cost,
          0
        ),
        0
      )
      const unitPrice = asNumber(
        getFirstDefined(product.cost_pricing?.unit_price, product.retail_price, product.price, product.unit_price, 0),
        0
      )
      const upc = getFirstDefined(
        product.stock_information?.enter_upcs,
        product.upcs,
        product.upc,
        product.barcode,
        product.sku,
        ''
      )
      const itemDisplay = [getFirstDefined(product.name, product.product_name, product.title, 'N/A'), upc, size, pack, unitCost.toFixed(2)]
        .filter(Boolean)
        .join(' ')

      return {
        id: getFirstDefined(product.id, product.product_id, index + 1),
        sku: getFirstDefined(product.sku, product.barcode, product.upc, upc, '-'),
        vendorCode: getFirstDefined(product.vendor_code, product.supplier_code, product.code, ''),
        itemName: getFirstDefined(product.name, product.product_name, product.title, 'N/A'),
        itemDisplay,
        size,
        pack,
        upc,
        lastCost: unitCost,
        caseUnits,
        sizePack: sizePack || '-',
        stock: asNumber(getFirstDefined(product.stock_quantity, product.quantity, 0)),
        unitPrice,
        buyAsBottle: Boolean(getFirstDefined(product.buy_as_bottle, product.buy_as_unit, false))
      }
    })
  }, [productsData])

  const productOptions = useMemo(() => {
    return products.map((p) => ({
      ...p,
      name: p.sku || `Product ${p.id}`,
      subText: p.itemName
    }))
  }, [products])

  const filteredProductOptions = useMemo(() => {
    const q = productSearch.toLowerCase().trim()
    if (!q) return productOptions
    return productOptions.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.subText.toLowerCase().includes(q)
    )
  }, [productOptions, productSearch])

  const selectedProductLabel = useMemo(() => {
    return productOptions.find((p) => String(p.id) === String(selectedProductId))?.name || ''
  }, [productOptions, selectedProductId])

  const poNumberValue = useMemo(() => {
    if (poData) return getFirstDefined(poData.po_number, poData.po_no, poData.number, poData.order_number) || ''
    return getNextPoNumber(ordersData)
  }, [ordersData, poData])

  const [poId, setPoId] = useState('')

  useEffect(() => {
    if (poData) {
      setPoDate(toInputDate(getFirstDefined(poData.expected_date, poData.order_date, poData.po_date, poData.date)))
      
      const vendorIdValue = String(getFirstDefined(poData.vendor?.id, poData.vendor_id, poData.vendor, ''))
      setSelectedVendor(vendorIdValue)
      
      setVendorOrderNumber(getFirstDefined(poData.vendor_order_ref, poData.vendor_order_number, poData.vendor_order_no, ''))
      
      // Populate address from vendor_details if poData.address is empty
      const displayAddress = poData.address || (poData.vendor_details?.address_details ? 
        [poData.vendor_details.address_details.address_1, poData.vendor_details.address_details.address_2, poData.vendor_details.address_details.city].filter(Boolean).join(', ') : '')
      setAddress(displayAddress)
      
      setShipTo(poData.ship_to || '')
      setShipBy(poData.ship_by || '')
      setNote(poData.note || '')
      setPoId(getFirstDefined(poData.po_id, poData.id, ''))
      
      const statusValue = String(getFirstDefined(poData.status, poData.po_status, '')).toLowerCase()
      const isReceived = statusValue.includes('fully received') || statusValue === 'closed'
      setIsReadOnly(isReceived)
      
      const receiveDay = getFirstDefined(poData.received_date, poData.actual_delivery_date, poData.received_at, isReceived ? poData.updated_at : '')
      setReceivedDate(toInputDate(receiveDay))

      if (Array.isArray(poData.items)) {
      const mappedItems = poData.items.map((item, idx) => {
          const productIdValue = getFirstDefined(item.product?.id, item.product_id, item.product)
          
          // Hydrate product details from the products list
          const fullProduct = products.find(p => String(p.id) === String(productIdValue)) || item.product || {}
          
          const caseUnits = asNumber(getFirstDefined(fullProduct.caseUnits, fullProduct.case_units, fullProduct.bpc, 1), 1)
          const qty = asNumber(item.quantity_ordered)
          
          return {
            id: `existing-${idx}`,
            productId: productIdValue,
            sku: getFirstDefined(fullProduct.sku, '-'),
            vendorCode: getFirstDefined(fullProduct.vendorCode, fullProduct.vendor_code, ''),
            itemName: getFirstDefined(fullProduct.itemName, fullProduct.name, fullProduct.product_name, 'N/A'),
            unitCost: asNumber(item.unit_price),
            caseCost: asNumber(item.unit_price) * caseUnits,
            caseUnits: caseUnits,
            qty: qty.toFixed(2),
            caseQty: (qty / caseUnits).toFixed(2),
            sizePack: getFirstDefined(fullProduct.sizePack, [fullProduct.size_name, fullProduct.pack_name].filter(Boolean).join(',') || '-'),
            buyAsCase: false
          }
        })
        setItems(mappedItems)
      }
    } else {
      setPoId(createPoId())
      setIsReadOnly(false)
      setReceivedDate('')
    }
  }, [poData, products])

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === String(selectedProductId)) || null,
    [products, selectedProductId]
  )

  useEffect(() => {
    if (!selectedProduct) return
    setProductCodeInput(selectedProduct.vendorCode || '')
    setProductCodeLookupMessage('')
    setAddUnitCost(selectedProduct.lastCost.toFixed(2))
    setAddQty('0')
    setAddCaseQty('1')
    setBuyAsBottle(false)
  }, [selectedProduct])

  const handleProductCodeSubmit = () => {
    const normalizedCode = String(productCodeInput || '').trim().toLowerCase()
    if (!normalizedCode) {
      setProductCodeLookupMessage('')
      return
    }

    const matchedProduct = products.find((product) => {
      const vendorCode = String(product.vendorCode || '').trim().toLowerCase()
      const skuCode = String(product.sku || '').trim().toLowerCase()
      const upcCode = String(product.upc || '').trim().toLowerCase()
      return vendorCode === normalizedCode || skuCode === normalizedCode || upcCode === normalizedCode
    })

    if (matchedProduct) {
      setSelectedProductId(String(matchedProduct.id))
      setProductCodeLookupMessage('')
      return
    }

    setProductCodeLookupMessage('Product code not found.')
  }

  const handleQtyChange = (val) => {
    setAddQty(val)
    const q = asNumber(val)
    const u = asNumber(selectedProduct?.caseUnits, 1)
    setAddCaseQty((q / u).toFixed(2))
  }

  const handleCaseQtyChange = (val) => {
    setAddCaseQty(val)
    const cq = asNumber(val)
    const u = asNumber(selectedProduct?.caseUnits, 1)
    setAddQty((cq * u).toFixed(2))
  }

  const totalQty = useMemo(
    () => items.reduce((acc, item) => acc + asNumber(item.qty), 0),
    [items]
  )
  const selectedCaseUnits = Math.max(asNumber(selectedProduct?.caseUnits, 1), 1)
  const selectedCaseCost = asNumber(addUnitCost, selectedProduct?.lastCost) * selectedCaseUnits

  const totalAmount = useMemo(
    () =>
      items.reduce(
        (acc, item) =>
          acc + asNumber(item.qty) * asNumber(item.unitCost),
        0
      ),
    [items]
  )
  const allItemsSelected = items.length > 0 && selectedItemIds.length === items.length
  const hasSelectedItems = selectedItemIds.length > 0

  useEffect(() => {
    setSelectedItemIds((prev) => prev.filter((id) => items.some((item) => item.id === id)))
  }, [items])

  const updateItem = (id, field, value) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        if (field === 'caseQty') {
          const nextCaseQty = asNumber(value, 0)
          return {
            ...item,
            caseQty: value,
            qty: (asNumber(item.caseUnits, 1) * nextCaseQty).toFixed(2)
          }
        }
        return { ...item, [field]: value }
      })
    )
  }

  const handleAddItem = () => {
    if (!selectedProduct) return
    const alreadyExists = items.some((item) => String(item.productId) === String(selectedProduct.id))
    if (alreadyExists) {
      const skuValue = selectedProduct.sku || selectedProduct.id
      setDuplicateSku(String(skuValue))
      return
    }

    const isBuyAsCase = buyAsBottle
    const normalizedUnitCost = asNumber(addUnitCost, selectedProduct.lastCost)
    const normalizedCaseUnits = Math.max(asNumber(selectedProduct.caseUnits, 1), 1)
    const normalizedCaseQty = Math.max(asNumber(addCaseQty, 0), 0)
    const normalizedQty = Math.max(asNumber(addQty, 0), 0)
    const effectiveQty = isBuyAsCase ? normalizedQty : normalizedCaseQty * normalizedCaseUnits
    const effectiveCaseQty = isBuyAsCase ? 0 : normalizedCaseQty
    const unitCost = normalizedUnitCost
    const caseCost = normalizedUnitCost * normalizedCaseUnits

    if (!(effectiveQty > 0)) return

    setItems((prev) => [
      ...prev,
      {
        id: `${selectedProduct.id}-${Date.now()}`,
        productId: selectedProduct.id,
        sku: selectedProduct.sku,
        vendorCode: selectedProduct.vendorCode,
        itemName: selectedProduct.itemName,
        unitCost,
        caseCost,
        caseUnits: selectedProduct.caseUnits,
        qty: effectiveQty.toFixed(2),
        caseQty: effectiveCaseQty.toFixed(2),
        sizePack: selectedProduct.sizePack,
        buyAsCase: isBuyAsCase
      }
    ])

    // Clear selected product form after successful add
    setSelectedProductId('')
    setProductCodeInput('')
    setProductCodeLookupMessage('')
    setAddQty('')
    setAddUnitCost('')
    setAddCaseQty('')
    setBuyAsBottle(false)
  }

  const toggleSelectItem = (itemId) => {
    setSelectedItemIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    )
  }

  const toggleSelectAllItems = () => {
    setSelectedItemIds((prev) => (prev.length === items.length ? [] : items.map((item) => item.id)))
  }

  const handleRemoveSelectedItems = () => {
    if (!hasSelectedItems) return
    const selectedIds = new Set(selectedItemIds)
    setItems((prev) => prev.filter((item) => !selectedIds.has(item.id)))
    setSelectedItemIds([])
  }

  const handleRemoveAllItems = () => {
    if (items.length === 0) return
    setItems([])
    setSelectedItemIds([])
  }

  const handleSave = async () => {
    try {
      const payload = {
        po_number: String(poNumberValue || ''),
        po_id: String(poId || ''),
        vendor: Number(selectedVendor) || null,
        vendor_order_ref: vendorOrderNumber || '',
        address: address || '',
        ship_to: shipTo || '',
        ship_by: shipBy || '',
        status: poData?.status || 'Open',
        total_amount: totalAmount.toFixed(2),
        expected_date: poDate || null,
        items: items.map((item) => ({
          product: Number(item.productId),
          quantity_ordered: asNumber(item.qty),
          quantity_received: 0,
          unit_price: asNumber(getFirstDefined(item.unitCost, item.lastCost, 0)).toFixed(2)
        }))
      }

      if (id) {
        await patch(`/purchasing/orders/${id}/`, payload)
      } else {
        await post('/purchasing/orders/', payload)
      }
      navigate('/pos/purchase-orders')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="h-full min-h-0 flex flex-col">
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 pb-24 space-y-6">
      {(apiError || vendorsError || productsError) && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold">
          {apiError || vendorsError || productsError}
        </div>
      )}
      {duplicateSku && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/30" onClick={() => setDuplicateSku('')} />
          <div className="relative w-full max-w-[560px] rounded-md border border-slate-300 bg-white p-6 shadow-2xl">
            <div className="min-h-[170px] flex items-center justify-center text-center px-4">
              <p className="text-[18px] leading-relaxed font-medium text-slate-900">
                Item with sku '{duplicateSku}' already exist. please add another item.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setDuplicateSku('')}
              className="w-full h-12 rounded-sm bg-[#0284C7] text-white text-[18px] font-semibold hover:bg-[#0369A1] transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}

      <Card noPadding className="border-slate-200 shadow-sm mb-6 !rounded-lg overflow-visible">
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Select Vendor</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => !isReadOnly && setShowVendorModal(true)}
                  disabled={isReadOnly}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none flex items-center justify-between focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all disabled:bg-slate-50 disabled:text-slate-500 shadow-sm"
                >
                  <span className={selectedVendorLabel ? 'text-slate-700' : 'text-slate-400'}>
                    {selectedVendorLabel || 'Select a Vendor'}
                  </span>
                  <ChevronDown className="text-slate-400" size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-500 ml-0.5">PO Number</label>
              <input
                type="text"
                value={poNumberValue}
                readOnly
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-500 ml-0.5">PO ID</label>
              <input
                type="text"
                value={poId}
                readOnly
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none"
              />
            </div>
            <DatePickerField label="PO Date" value={poDate} onChange={setPoDate} disabled={isReadOnly} />
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Vendor Order #</label>
              <input
                type="text"
                value={vendorOrderNumber}
                onChange={(e) => setVendorOrderNumber(e.target.value)}
                placeholder="Enter Vendor Order #"
                disabled={isReadOnly}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all disabled:bg-slate-50 disabled:text-slate-500 shadow-inner"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Ship To</label>
              <div className="relative">
                <select
                  value={shipTo}
                  onChange={(e) => setShipTo(e.target.value)}
                  disabled={isReadOnly}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none appearance-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="">Select Ship To</option>
                  {SHIP_TO_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Ship By</label>
              <input
                type="text"
                value={shipBy}
                onChange={(e) => setShipBy(e.target.value)}
                placeholder="Enter Ship By"
                disabled={isReadOnly}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all disabled:bg-slate-50 disabled:text-slate-500 shadow-inner"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter Address"
                disabled={isReadOnly}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all disabled:bg-slate-50 disabled:text-slate-500 shadow-inner"
              />
            </div>
          </div>

          {isReadOnly && receivedDate && (
            <div className="max-w-[280px] flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Received Date</label>
              <div className="w-full h-9 px-3 rounded-lg border border-emerald-200 bg-emerald-50 text-[14px] font-bold text-emerald-700 flex items-center">
                {receivedDate}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              disabled={isReadOnly}
              className="w-full h-9 px-3 py-2 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all resize-none disabled:bg-slate-50 disabled:text-slate-500 shadow-inner"
            />
          </div>
        </div>
      </Card>

      {!isReadOnly && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card noPadding className="lg:col-span-2 border-slate-200 shadow-sm !rounded-lg overflow-visible">
            {/* ... Product selection logic ... */}
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3">
            <div className="flex flex-col gap-1.5 lg:col-span-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKU / UPC</label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowProductModal(true)}
                  className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none flex items-center justify-between focus:border-sky-500 transition-all shadow-sm"
                >
                  <span className={selectedProductLabel ? 'text-slate-700' : 'text-slate-400'}>
                    {selectedProductLabel || 'Select SKU / UPC'}
                  </span>
                  <ChevronDown className="text-slate-400" size={16} />
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-4">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Code</label>
              <input
                type="text"
                value={productCodeInput}
                onChange={(e) => {
                  setProductCodeInput(e.target.value)
                  if (productCodeLookupMessage) setProductCodeLookupMessage('')
                }}
                onKeyDown={(e) => {
                  if (e.key !== 'Enter') return
                  e.preventDefault()
                  handleProductCodeSubmit()
                }}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-700 outline-none"
              />
              {productCodeLookupMessage && (
                <span className="text-[11px] font-semibold text-rose-600">{productCodeLookupMessage}</span>
              )}
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Name</label>
              <input
                type="text"
                readOnly
                value={selectedProduct?.itemDisplay || selectedProduct?.itemName || ''}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-bold text-slate-600 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size</label>
              <input
                type="text"
                readOnly
                value={selectedProduct?.size || ''}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-600 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pack</label>
              <input
                type="text"
                readOnly
                value={selectedProduct?.pack || ''}
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-600 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Order Qty</label>
              <input
                type="text"
                readOnly
                value="0"
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Order Date</label>
              <input
                type="text"
                readOnly
                value=""
                className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-poppins text-sky-600">Quantity</label>
              <input
                type="number"
                step="0.01"
                value={addQty}
                onChange={(e) => handleQtyChange(e.target.value)}
                disabled={!buyAsBottle}
                className={`w-full h-9 px-3 rounded-lg text-[14px] font-bold text-slate-800 outline-none ${
                    buyAsBottle
                      ? 'border border-sky-200 bg-white focus:border-sky-500'
                      : 'border border-slate-200 bg-[#f9fafb] text-slate-500 cursor-not-allowed'
                  }`}
              />
            </div>
            <div className="flex flex-col gap-1.5 lg:col-span-3">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unit Cost</label>
              <input
                type="number"
                step="0.01"
                value={addUnitCost}
                onChange={(e) => setAddUnitCost(e.target.value)}
                disabled={!buyAsBottle}
                className={`w-full h-9 px-3 rounded-lg text-[14px] font-bold text-slate-800 outline-none ${
                  buyAsBottle
                    ? 'border border-sky-200 bg-white focus:border-sky-500'
                    : 'border border-slate-200 bg-[#f9fafb] text-slate-500 cursor-not-allowed'
                }`}
              />
            </div>
            <div className="flex items-end lg:col-span-3">
              <button
                onClick={handleAddItem}
                disabled={!selectedProduct}
                className="w-full h-9 rounded-lg bg-[#0EA5E9] text-white text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#0284C7] transition-all active:scale-95 shadow-md shadow-sky-500/10"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>
          </div>
        </Card>

        <Card noPadding className="border-slate-200 shadow-sm !rounded-lg">
          <div className="p-6 flex flex-col h-full">
            <div className="mb-auto grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Case Qty</span>
                <input
                  type="number"
                  step="0.01"
                  value={addCaseQty}
                  onChange={(e) => handleCaseQtyChange(e.target.value)}
                  disabled={buyAsBottle}
                  className={`w-full h-9 px-3 rounded-md text-right text-[14px] font-bold text-slate-800 outline-none ${
                    !buyAsBottle
                      ? 'border border-slate-200 bg-white focus:border-sky-500'
                      : 'border border-slate-200 bg-[#f9fafb] text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Case Cost</span>
                <div className="w-full h-9 px-3 rounded-md border border-slate-200 bg-[#f9fafb] text-right text-[14px] font-bold text-slate-700 flex items-center justify-end">
                  $ {selectedCaseCost.toFixed(2)}
                </div>
              </div>
              <div className="space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider">Case Units</span>
                <div className="w-full h-9 px-3 rounded-md border border-slate-200 bg-[#f9fafb] text-right text-[14px] font-bold text-slate-700 flex items-center justify-end">
                  {selectedCaseUnits.toFixed(0)}
                </div>
              </div>
              <div className="flex items-end pb-1">
                <label className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-700 select-none cursor-pointer">
                  <input
                    type="checkbox"
                    checked={buyAsBottle}
                    onChange={(e) => {
                      const checked = e.target.checked
                      setBuyAsBottle(checked)
                      if (checked) {
                        setAddCaseQty('0')
                      }
                    }}
                    className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                  />
                  Buy As Case
                </label>
              </div>
            </div>

            <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
              <div className="flex justify-between items-center text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                <span>Total</span>
                <span className="text-slate-800 font-black">$ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between items-center bg-[#f0f9ff]/50 p-4 rounded-xl border border-sky-100">
                <h3 className="text-[16px] font-black text-slate-800 tracking-tight font-poppins">Total</h3>
                <span className="text-2xl font-black text-sky-600 tracking-tighter">
                  $ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      )}

      {isReadOnly && (
        <div className="flex justify-end pt-4">
           <Card className="w-full lg:max-w-md border-emerald-100 bg-emerald-50/10 !rounded-xl">
             <div className="flex justify-between items-center text-emerald-800">
                <span className="text-sm font-black uppercase tracking-tight">Order Status</span>
                <span className="text-xs font-black px-4 py-1.5 bg-emerald-100 rounded-full">{poData?.status}</span>
             </div>
           </Card>
        </div>
      )}

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-6">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="bg-[#f9fafb] border-b border-slate-200">
              <tr>
                {!isReadOnly && (
                  <th className="px-4 py-3.5 text-center w-[48px]">
                    <input
                      type="checkbox"
                      checked={allItemsSelected}
                      onChange={toggleSelectAllItems}
                      aria-label="Select all items"
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                    />
                  </th>
                )}
                <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vendor Code</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Last Cost</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Case Units</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Quantity</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Line Total</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size/Pack</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productsLoading ? (
                <tr>
                  <td colSpan={isReadOnly ? 8 : 9} className="px-8 py-12 text-center text-slate-500 font-bold">
                    Loading products...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={isReadOnly ? 8 : 9} className="px-8 py-12 text-center text-slate-500 font-bold">
                    No items found from API.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    {!isReadOnly && (
                      <td className="px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={selectedItemIds.includes(item.id)}
                          onChange={() => toggleSelectItem(item.id)}
                          aria-label={`Select ${item.itemName}`}
                          className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 text-[13px] font-semibold text-slate-600">{item.sku}</td>
                    <td className="px-3 py-3 text-[13px] font-medium text-slate-500">{item.vendorCode || '-'}</td>
                    <td className="px-3 py-3 text-[14px] font-bold text-slate-700">{item.itemName}</td>
                    <td className="px-3 py-3 text-[14px] font-semibold text-slate-700 text-right">
                      {(
                        item.buyAsCase
                          ? asNumber(getFirstDefined(item.unitCost, item.lastCost, 0))
                          : asNumber(
                              getFirstDefined(
                                item.caseCost,
                                asNumber(getFirstDefined(item.unitCost, item.lastCost, 0)) * asNumber(item.caseUnits, 1)
                              )
                            )
                      ).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-[14px] font-semibold text-slate-700 text-center">{asNumber(item.caseUnits).toFixed(0)}</td>
                    <td className="px-3 py-3 text-[14px] font-semibold text-slate-700 text-center">{formatCompactNumber(item.qty, '0')}</td>
                    <td className="px-3 py-3 text-[14px] font-bold text-slate-700 text-right">
                      {(
                        item.buyAsCase
                          ? asNumber(item.qty) * asNumber(item.unitCost)
                          : asNumber(item.caseQty) *
                            asNumber(
                              getFirstDefined(
                                item.caseCost,
                                asNumber(getFirstDefined(item.unitCost, item.lastCost, 0)) * asNumber(item.caseUnits, 1)
                              )
                            )
                      ).toFixed(3)}
                    </td>
                    <td className="px-3 py-3 text-[13px] font-medium text-slate-500">{item.sizePack}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center gap-3 text-[12px] font-bold">
          {!isReadOnly ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRemoveSelectedItems}
                disabled={!hasSelectedItems}
                className="h-10 min-w-[136px] px-5 rounded-2xl border border-rose-200 bg-white text-rose-600 text-[13px] font-extrabold uppercase tracking-[2px] inline-flex items-center justify-center gap-2 hover:bg-rose-50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={14} strokeWidth={2.2} />
                Remove
              </button>
              <button
                type="button"
                onClick={handleRemoveAllItems}
                disabled={items.length === 0}
                className="h-10 min-w-[170px] px-5 rounded-2xl border border-rose-200 bg-white text-rose-600 text-[13px] font-extrabold uppercase tracking-[2px] inline-flex items-center justify-center gap-2 hover:bg-rose-50 transition-all disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Trash2 size={14} strokeWidth={2.2} />
                Remove All
              </button>
            </div>
          ) : (
            <div />
          )}
          <div className="flex gap-10 text-slate-600 uppercase tracking-wider">
            <span>Total Qty: <span className="text-slate-900 ml-1">{totalQty.toFixed(2)}</span></span>
            <span>Total: <span className="text-slate-900 ml-1">$ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
          </div>
        </div>
      </div>

      </div>

      <div className="sticky bottom-0 z-20 mt-4 border-t border-slate-200 bg-[#F8FAFC] pt-4">
        <div className="flex justify-between items-center">
          <button
            onClick={openCalculator}
            className="h-10 px-5 rounded-lg border border-slate-300 bg-white text-slate-600 text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-all active:scale-95"
          >
            <Calculator size={18} className="text-slate-400" />
            Calculator
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/pos/purchase-orders')}
              className="px-8 h-10 rounded-lg bg-slate-200 text-slate-700 text-[13px] font-bold uppercase tracking-wider hover:bg-slate-300 transition-all active:scale-95"
            >
              Close
            </button>
            {!isReadOnly && (
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-10 h-10 rounded-lg bg-[#0EA5E9] text-white text-[13px] font-bold uppercase tracking-wider hover:bg-[#0284C7] transition-all active:scale-95 shadow-md shadow-sky-500/20 disabled:opacity-50"
              >
                {saving ? 'Saving...' : id ? 'Update' : 'Save'}
              </button>
            )}
          </div>
        </div>
      </div>

      {showVendorModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Select Vendor</h3>
              <button
                type="button"
                onClick={() => {
                  setShowVendorModal(false)
                  setVendorSearch('')
                }}
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={vendorSearch}
                  onChange={(e) => setVendorSearch(e.target.value)}
                  placeholder="Search vendor..."
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="max-h-80 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
                {filteredVendorOptions.length === 0 ? (
                  <div className="px-4 py-6 text-sm font-bold text-slate-400 text-center">
                    No vendor found.
                  </div>
                ) : (
                  filteredVendorOptions.map((vendor) => (
                    <button
                      key={vendor.id}
                      type="button"
                      onClick={() => {
                        setSelectedVendor(String(vendor.id))
                        setAddress('')
                        setShowVendorModal(false)
                        setVendorSearch('')
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-sky-50 transition-all"
                    >
                      <div className="text-sm font-black text-slate-700">{vendor.name}</div>
                      <div className="text-xs font-bold text-slate-400">ID: {vendor.id}</div>
                      <div className="text-xs font-bold text-slate-400">Sales Person: {vendor.salesPerson || '-'}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showProductModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Select Product</h3>
              <button
                type="button"
                onClick={() => {
                  setShowProductModal(false)
                  setProductSearch('')
                }}
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search SKU / UPC..."
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 pr-10 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="max-h-80 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
                {filteredProductOptions.length === 0 ? (
                  <div className="px-4 py-6 text-sm font-bold text-slate-400 text-center">
                    No product found.
                  </div>
                ) : (
                  filteredProductOptions.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(String(product.id))
                        setShowProductModal(false)
                        setProductSearch('')
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-sky-50 transition-all"
                    >
                      <div className="text-sm font-black text-slate-700">{product.name}</div>
                      <div className="text-xs font-bold text-slate-400">{product.subText}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreatePurchaseOrder
