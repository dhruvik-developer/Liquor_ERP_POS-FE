import React, { useEffect, useMemo, useRef, useState } from 'react'
import StyledDropdown from '../common/StyledDropdown'
import { useNavigate } from 'react-router-dom'
import { 
  Save, 
  Plus, 
  Trash2, 
  Calculator, 
  ChevronDown,
  Search,
  X,
  MoreHorizontal
} from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'
import { useCalculator } from '../../context/CalculatorContext'
import useApi from '../../hooks/useApi'
import useFetch from '../../hooks/useFetch'

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

const collectNonEmptyStrings = (values) =>
  values
    .map((value) => (value === undefined || value === null ? '' : String(value).trim()))
    .filter(Boolean)

const asNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
}

const normalizeMatchValue = (value) => String(value ?? '').trim().toLowerCase()

const isSameBillItem = (left, right) => {
  const leftIsLooseUnitsOnly = Boolean(left?.isLooseUnitsOnly)
  const rightIsLooseUnitsOnly = Boolean(right?.isLooseUnitsOnly)
  if (leftIsLooseUnitsOnly !== rightIsLooseUnitsOnly) return false

  const leftProductId = getFirstDefined(left?.productId, left?.product_id, null)
  const rightProductId = getFirstDefined(right?.productId, right?.product_id, null)
  if (leftProductId !== null && rightProductId !== null) {
    return String(leftProductId) === String(rightProductId)
  }

  const leftSku = normalizeMatchValue(left?.sku)
  const rightSku = normalizeMatchValue(right?.sku)
  if (leftSku && rightSku) {
    return leftSku === rightSku
  }

  const leftName = normalizeMatchValue(left?.itemName)
  const rightName = normalizeMatchValue(right?.itemName)
  if (!leftName || !rightName) return false

  const leftSizePack = normalizeMatchValue(left?.sizePack)
  const rightSizePack = normalizeMatchValue(right?.sizePack)
  if (leftSizePack && rightSizePack) {
    return leftName === rightName && leftSizePack === rightSizePack
  }

  return leftName === rightName
}

const isProductInactive = (product) => {
  if (!product) return false
  if (product.isInactive === true) return true
  if (product.item_is_inactive === true) return true
  if (product.is_active === false) return true

  const status = String(getFirstDefined(product.status, product.item_status, product.active_status, '')).trim().toLowerCase()
  return status === 'inactive'
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

const createDefaultDueDate = () => {
  const date = new Date()
  date.setDate(date.getDate() + 30)
  return toInputDate(date)
}

const normalizeCurrency = (value) => asNumber(value, 0).toFixed(2)
const getUnitQuantityForPayload = (item) => {
  const qty = asNumber(item?.qty, 0)
  const bpc = asNumber(item?.bpc, 1)
  return qty * (bpc > 0 ? bpc : 1)
}
const getFreeQuantity = (item) => asNumber(getFirstDefined(item?.freeQty, item?.frQty, item?.free_qty, 0), 0)
const formatQuantity = (value) => {
  const numeric = asNumber(value, 0)
  return Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2)
}

const formatMoneyLabel = (value) => `$${normalizeCurrency(value)}`
const formatPercentLabel = (value) => `${asNumber(value, 0).toFixed(2)}%`

const getOrderItems = (order) => {
  if (!order) return []
  if (Array.isArray(order.items)) return order.items
  if (Array.isArray(order.line_items)) return order.line_items
  if (Array.isArray(order.order_items)) return order.order_items
  if (Array.isArray(order.lines)) return order.lines
  return []
}

const normalizeOrderLineItem = (line, lineIndex, orderId, productsById = new Map()) => {
  const rawProduct = line?.product
  const lineProductId = getFirstDefined(line?.product_id, typeof rawProduct === 'number' ? rawProduct : null)
  const lookupProduct = productsById.get(String(lineProductId ?? '')) || {}
  const product = typeof rawProduct === 'object' && rawProduct !== null
    ? { ...lookupProduct, ...rawProduct }
    : lookupProduct

  const qty = asNumber(
    getFirstDefined(line.quantity_ordered, line.quantity, line.qty, line.order_qty, line.ordered_qty, 0),
    0
  )
  const bpc = asNumber(
    getFirstDefined(line.case_units, line.bpc, line.units_per_case, line.units_in_case, product.case_units, product.units_in_case, 1),
    1
  )
  const cost = asNumber(
    getFirstDefined(line.unit_price, line.unit_cost, line.cost, line.price, product.unitCost, product.cost, 0),
    0
  )
  const disc = asNumber(getFirstDefined(line.discount, line.discount_amount, 0), 0)
  const amount = asNumber(getFirstDefined(line.amount, line.total_amount), qty * cost - disc)

  const size = getFirstDefined(line.size_name, line.size, product.size?.name, product.size_name, product.size, '')
  const pack = getFirstDefined(line.pack_name, line.pack, product.pack?.name, product.pack_name, product.pack, '')
  const sizePack = [size, pack].filter(Boolean).join(' / ') || '-'

  return {
    sr: lineIndex + 1,
    lineItemId: getFirstDefined(line.id, line.item_id, null),
    productId: getFirstDefined(line.product_id, lineProductId, product.id, null),
    sku: getFirstDefined(
      line.sku,
      line.product_sku,
      line.item_sku,
      line.upc,
      line.barcode,
      product.sku,
      product.upc,
      product.barcode,
      '-'
    ),
    vendorCode: getFirstDefined(
      line.vendor_code,
      line.vendor_item_code,
      line.vendor_sku,
      line.item_code,
      product.vendorCode,
      product.vendor_code,
      product.supplier_code,
      product.code,
      '-'
    ),
    itemName: getFirstDefined(
      line.item_name,
      line.product_name,
      line.item_description,
      line.description,
      product.itemName,
      product.name,
      product.item_name,
      product.product_name,
      'N/A'
    ),
    sizePack,
    case: asNumber(getFirstDefined(line.case_qty, line.cases, line.case_count, qty), qty),
    bpc,
    qty,
    isLooseUnitsOnly: false,
    cost,
    disc,
    amount,
    rip: asNumber(getFirstDefined(line.rip, line.return_invoice_price, 0), 0),
    freeQty: asNumber(getFirstDefined(line.free_qty, line.freeQty, line.fr_qty, 0), 0),
    unitCost: cost,
    unitQty: asNumber(getFirstDefined(line.unit_qty, line.unit_quantity), getUnitQuantityForPayload({ qty, bpc })),
    orderKey: orderId
  }
}

const CreatePurchaseBill = () => {
  const { openCalculator } = useCalculator()
  const navigate = useNavigate()
  const today = toInputDate(new Date())
  const [billDate, setBillDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [deliveryDate, setDeliveryDate] = useState('')
  const [salesPerson, setSalesPerson] = useState('')
  const [invoiceNumber, setInvoiceNumber] = useState('')
  const [note, setNote] = useState('')
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [selectedOrderId, setSelectedOrderId] = useState('')
  const [billItems, setBillItems] = useState([])
  const [charges, setCharges] = useState({
    tax1: 0,
    tax2: 0,
    tax3: 0,
    discountFees: 0,
    depositFees: 0,
    returnDeposit: 0,
    overhead: 0
  })
  const [selectedSkuValue, setSelectedSkuValue] = useState('')
  const [itemNameInput, setItemNameInput] = useState('')
  const [isSkuModalOpen, setIsSkuModalOpen] = useState(false)
  const [skuSearch, setSkuSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [itemQty, setItemQty] = useState('')
  const [itemBpc, setItemBpc] = useState('')
  const [itemFreeQty, setItemFreeQty] = useState('')
  const [itemCaseCost, setItemCaseCost] = useState('')
  const [itemUnitCost, setItemUnitCost] = useState('')
  const [itemDiscount, setItemDiscount] = useState('')
  const [isLooseUnitsOnly, setIsLooseUnitsOnly] = useState(false)
  const [looseUnitsValue, setLooseUnitsValue] = useState('0')
  const [selectedBillItemIndex, setSelectedBillItemIndex] = useState(null)
  const itemsTableRef = useRef(null)
  const previousItemCountRef = useRef(0)
  
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [isSalesPersonModalOpen, setIsSalesPersonModalOpen] = useState(false)
  const [isInvoiceRequiredModalOpen, setIsInvoiceRequiredModalOpen] = useState(false)
  const [vendorSearch, setVendorSearch] = useState('')
  
  const { post, loading, error: apiError } = useApi()
  const { data: vendorsData, loading: vendorsLoading, error: vendorsError } = useFetch('/people/vendors/')
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useFetch('/purchasing/orders/')
  const { data: billsData, error: billsError } = useFetch('/purchasing/bills/')
  const { data: productsData, loading: productsLoading, error: productsError } = useFetch('/inventory/products/')
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
    return vendorOptions.find((v) => String(v.id) === String(selectedVendorId))?.name || ''
  }, [vendorOptions, selectedVendorId])
  const selectedVendor = useMemo(
    () => vendorOptions.find((v) => String(v.id) === String(selectedVendorId)) || null,
    [vendorOptions, selectedVendorId]
  )
  const selectedVendorSalesPersons = useMemo(() => {
    if (!selectedVendor) return []

    const rawSalesPersons = Array.isArray(selectedVendor.sales_person_contact_details)
      ? selectedVendor.sales_person_contact_details
      : Array.isArray(selectedVendor.sales_persons)
        ? selectedVendor.sales_persons
        : []

    const normalizedSalesPersons = rawSalesPersons
      .map((person, index) => {
        const firstName = String(getFirstDefined(person?.first_name, person?.firstName, '')).trim()
        const lastName = String(getFirstDefined(person?.last_name, person?.lastName, '')).trim()
        const fullName = `${firstName} ${lastName}`.trim() || String(getFirstDefined(person?.name, person?.sales_person, '')).trim()
        const phone = String(getFirstDefined(person?.phone, person?.mobile, person?.cell_phone, '')).trim()
        const email = String(getFirstDefined(person?.email, '')).trim()

        return {
          id: String(getFirstDefined(person?.id, person?.sales_person_id, index + 1)),
          fullName,
          phone,
          email
        }
      })
      .filter((person) => person.fullName || person.phone || person.email)

    if (normalizedSalesPersons.length > 0) return normalizedSalesPersons

    const fallbackName = String(
      getFirstDefined(selectedVendor.salesPerson, selectedVendor.sales_person, selectedVendor.contact_name, selectedVendor.contact_person, '')
    ).trim()
    const fallbackPhone = String(
      getFirstDefined(selectedVendor.phone, selectedVendor.phone_1, selectedVendor.phone_2, selectedVendor.cell_phone, '')
    ).trim()
    const fallbackEmail = String(getFirstDefined(selectedVendor.email, '')).trim()

    if (!fallbackName && !fallbackPhone && !fallbackEmail) return []

    return [
      {
        id: `vendor-${selectedVendor.id}`,
        fullName: fallbackName || 'Sales Person',
        phone: fallbackPhone,
        email: fallbackEmail
      }
    ]
  }, [selectedVendor])

  const purchaseOrders = useMemo(() => {
    if (Array.isArray(ordersData)) return ordersData
    if (Array.isArray(ordersData?.results)) return ordersData.results
    if (Array.isArray(ordersData?.data?.results)) return ordersData.data.results
    if (Array.isArray(ordersData?.data)) return ordersData.data
    return []
  }, [ordersData])
  const purchaseBills = useMemo(() => {
    if (Array.isArray(billsData)) return billsData
    if (Array.isArray(billsData?.results)) return billsData.results
    if (Array.isArray(billsData?.data?.results)) return billsData.data.results
    if (Array.isArray(billsData?.data)) return billsData.data
    return []
  }, [billsData])
  const products = useMemo(() => {
    const source = Array.isArray(productsData)
      ? productsData
      : Array.isArray(productsData?.results)
      ? productsData.results
      : Array.isArray(productsData?.data?.results)
      ? productsData.data.results
      : Array.isArray(productsData?.data)
      ? productsData.data
      : []

    return source.map((product, index) => {
      const stockInfoUpc = Array.isArray(product?.stock_information?.enter_upcs)
        ? product.stock_information.enter_upcs[0]
        : product?.stock_information?.enter_upcs

      const skuValue = String(
        getFirstDefined(product.sku, product.barcode, product.upc, stockInfoUpc, product.id, `SKU-${index + 1}`)
      )
      const itemName = String(getFirstDefined(product.name, product.product_name, product.title, 'N/A'))
      const vendorCode = String(getFirstDefined(product.vendor_code, product.supplier_code, product.code, '-'))
      const size = getFirstDefined(product.size?.name, product.size_name, product.size, '')
      const pack = getFirstDefined(product.pack?.name, product.pack_name, product.pack, '')
      const sizePack = [size, pack].filter(Boolean).join(' / ') || '-'
      const unitsInCase = asNumber(
        getFirstDefined(product.units_in_case, product.case_units, product.bpc, product.units_per_case, product.pack_quantity, 1),
        1
      )
      const unitCost = asNumber(
        getFirstDefined(product.cost_pricing?.unit_cost, product.unit_cost, product.last_cost, product.cost, 0),
        0
      )
      const caseCost = asNumber(getFirstDefined(product.case_cost, product.cost_pricing?.case_cost, unitCost * unitsInCase), unitCost * unitsInCase)
      const margin = asNumber(getFirstDefined(product.cost_pricing?.margin, product.margin, 0), 0)
      const markup = asNumber(getFirstDefined(product.cost_pricing?.markup, product.markup, 0), 0)

      return {
        id: getFirstDefined(product.id, product.product_id, index + 1),
        sku: skuValue,
        itemName,
        vendorCode,
        sizePack,
        unitsInCase,
        caseCost,
        unitCost,
        margin,
        markup,
        isInactive: product.item_is_inactive === true || product.is_active === false
      }
    })
  }, [productsData])
  const filteredProducts = useMemo(() => {
    const activeProducts = products.filter((product) => !isProductInactive(product))
    const q = String(skuSearch || '').trim().toLowerCase()
    if (!q) return activeProducts
    return activeProducts.filter((product) =>
      `${product.sku} ${product.itemName}`.toLowerCase().includes(q)
    )
  }, [products, skuSearch])
  const productsById = useMemo(() => {
    const map = new Map()
    products.forEach((product) => {
      const key = String(getFirstDefined(product.id, product.product_id, '')).trim()
      if (key) map.set(key, product)
    })
    return map
  }, [products])
  const billedOrderKeys = useMemo(() => {
    const keys = new Set()

    purchaseBills.forEach((bill) => {
      const billVendorId = String(bill.vendor?.id ?? bill.vendor_id ?? bill.vendor ?? '').trim()
      const billOrderIdValues = collectNonEmptyStrings([
        bill.purchase_order_id,
        bill.purchase_order,
        bill.order_id,
        bill.order,
        bill.po_id
      ])
      const billPoNumberValues = collectNonEmptyStrings([bill.po_number, bill.purchase_order_number, bill.order_number])

      billOrderIdValues.forEach((value) => {
        keys.add(`id:${value}`)
      })

      billPoNumberValues.forEach((value) => {
        keys.add(`po:${value}`)
        if (billVendorId) keys.add(`vendor-po:${billVendorId}:${value}`)
      })
    })

    return keys
  }, [purchaseBills])

  const normalizedOrders = useMemo(() => {
    return purchaseOrders.map((order, index) => {
      const orderId = String(getFirstDefined(order.id, order.pk, order.uuid, order.po_id, `order-${index}`))
      const vendorId = String(getFirstDefined(order.vendor?.id, order.vendor_id, order.vendor, ''))
      const poNumber = String(getFirstDefined(order.po_number, order.order_number, order.po_no, orderId))
      const status = String(getFirstDefined(order.status, order.po_status, order.overall_status, '')).trim().toLowerCase()
      const items = getOrderItems(order).map((line, lineIndex) => normalizeOrderLineItem(line, lineIndex, orderId, productsById))

      return {
        ...order,
        key: orderId,
        vendorId,
        poNumber,
        status,
        items,
        billDate: getFirstDefined(order.bill_date, order.purchase_bill_date, order.updated_at, order.created_at),
        dueDate: getFirstDefined(order.due_date),
        deliveryDate: getFirstDefined(order.delivery_date, order.expected_date, order.received_date),
        salesPerson: getFirstDefined(order.sales_person, order.salesperson, order.created_by?.name, ''),
        note: getFirstDefined(order.note, order.notes, ''),
        invoiceNumber: getFirstDefined(order.invoice_number, order.vendor_invoice, ''),
        tax1: asNumber(getFirstDefined(order.tax_1, order.tax1, order.tax_amount_1, 0), 0),
        tax2: asNumber(getFirstDefined(order.tax_2, order.tax2, order.tax_amount_2, 0), 0),
        tax3: asNumber(getFirstDefined(order.tax_3, order.tax3, order.tax_amount_3, 0), 0),
        discountFees: asNumber(getFirstDefined(order.discount_fees, order.discount, order.discount_amount, 0), 0),
        depositFees: asNumber(getFirstDefined(order.deposit_fees, order.deposit, 0), 0),
        returnDeposit: asNumber(getFirstDefined(order.return_deposit, 0), 0),
        overhead: asNumber(getFirstDefined(order.overhead, order.other_charges, 0), 0)
      }
    })
  }, [purchaseOrders, productsById])

  const fullyReceivedOrders = useMemo(() => {
    if (!selectedVendorId) return []
    const vendorId = String(selectedVendorId)
    return normalizedOrders.filter((order) => {
      const status = order.status
      const orderVendorId = order.vendorId
      if (!(status === 'fully received' && orderVendorId === vendorId)) return false

      const orderIdValues = collectNonEmptyStrings([order.key])
      const orderPoNumberValues = collectNonEmptyStrings([order.poNumber])

      const hasExistingBill = orderIdValues.some((value) => billedOrderKeys.has(`id:${value}`)) ||
        orderPoNumberValues.some(
          (value) => billedOrderKeys.has(`vendor-po:${vendorId}:${value}`) || billedOrderKeys.has(`po:${value}`)
        )

      return !hasExistingBill
    })
  }, [normalizedOrders, selectedVendorId, billedOrderKeys])

  const selectedOrder = useMemo(
    () => fullyReceivedOrders.find((order) => String(order.key) === String(selectedOrderId)) || null,
    [fullyReceivedOrders, selectedOrderId]
  )

  useEffect(() => {
    if (!selectedOrder) {
      setBillItems([])
      setBillDate('')
      setDueDate('')
      setDeliveryDate('')
      setSalesPerson('')
      setInvoiceNumber('')
      setNote('')
      setCharges({
        tax1: 0,
        tax2: 0,
        tax3: 0,
        discountFees: 0,
        depositFees: 0,
        returnDeposit: 0,
        overhead: 0
      })
      return
    }

    setBillItems(selectedOrder.items)
    setBillDate(toInputDate(selectedOrder.billDate) || today)
    setDueDate(toInputDate(selectedOrder.dueDate) || createDefaultDueDate())
    setDeliveryDate(toInputDate(selectedOrder.deliveryDate))
    setSalesPerson(selectedOrder.salesPerson || '')
    setInvoiceNumber(selectedOrder.invoiceNumber || '')
    setNote(selectedOrder.note || '')
    setCharges({
      tax1: selectedOrder.tax1,
      tax2: selectedOrder.tax2,
      tax3: selectedOrder.tax3,
      discountFees: selectedOrder.discountFees,
      depositFees: selectedOrder.depositFees,
      returnDeposit: selectedOrder.returnDeposit,
      overhead: selectedOrder.overhead
    })
  }, [selectedOrder, today])

  const subTotal = useMemo(
    () => billItems.reduce((acc, item) => acc + asNumber(item.amount, asNumber(item.qty) * asNumber(item.cost) - asNumber(item.disc)), 0),
    [billItems]
  )

  const totalPayable = useMemo(() => {
    return (
      subTotal +
      asNumber(charges.tax1) +
      asNumber(charges.tax2) +
      asNumber(charges.tax3) +
      asNumber(charges.depositFees) +
      asNumber(charges.overhead) -
      asNumber(charges.discountFees) -
      asNumber(charges.returnDeposit)
    )
  }, [subTotal, charges])

  const totals = useMemo(
    () => ({
      items: billItems.length,
      totalQty: billItems.reduce((acc, item) => acc + asNumber(item.qty), 0),
      totalUnitQty: billItems.reduce((acc, item) => acc + asNumber(item.qty) * asNumber(item.bpc), 0)
    }),
    [billItems]
  )
  const itemNetCost = useMemo(
    () => (isLooseUnitsOnly ? asNumber(itemUnitCost, 0) : asNumber(itemCaseCost, 0)),
    [isLooseUnitsOnly, itemUnitCost, itemCaseCost]
  )
  const displayedCaseCostValue = isLooseUnitsOnly ? itemUnitCost : itemCaseCost
  const netQtyValue = useMemo(() => {
    if (isLooseUnitsOnly) return asNumber(looseUnitsValue, 0)
    return asNumber(itemQty, 0) * asNumber(itemBpc, 0)
  }, [itemQty, itemBpc, isLooseUnitsOnly, looseUnitsValue])
  const lineTotalValue = useMemo(() => {
    const unitCost = asNumber(itemUnitCost, 0)
    if (isLooseUnitsOnly) return asNumber(looseUnitsValue, 0) * unitCost
    return asNumber(itemQty, 0) * asNumber(itemBpc, 0) * unitCost
  }, [itemQty, itemBpc, itemUnitCost, isLooseUnitsOnly, looseUnitsValue])
  const currentCostValue = asNumber(selectedProduct?.unitCost, 0)
  const currentMarginValue = asNumber(selectedProduct?.margin, 0)
  const currentMarkupValue = asNumber(selectedProduct?.markup, 0)

  const handleSave = async () => {
    try {
      if (billItems.length === 0 || !selectedVendorId) return
      if (!String(invoiceNumber || '').trim()) {
        setIsInvoiceRequiredModalOpen(true)
        return
      }

      const isBillFromPurchaseOrder = Boolean(selectedOrder)
      const parsedPurchaseOrderId = Number(selectedOrder?.key)
      const purchaseOrderId = !isBillFromPurchaseOrder
        ? null
        : Number.isFinite(parsedPurchaseOrderId) && String(selectedOrder?.key).trim() !== ''
        ? parsedPurchaseOrderId
        : selectedOrder?.key

      const payload = {
        vendor: Number(selectedVendorId) || null,
        purchase_order: purchaseOrderId,
        sales_person: salesPerson || '',
        bill_number: invoiceNumber || '',
        invoice_number: invoiceNumber || '',
        bill_date: billDate,
        due_date: dueDate,
        delivery_date: deliveryDate || null,
        note: note || '',
        tax_1: asNumber(charges.tax1).toFixed(2),
        tax_2: asNumber(charges.tax2).toFixed(2),
        tax_3: asNumber(charges.tax3).toFixed(2),
        discount_fees: asNumber(charges.discountFees).toFixed(2),
        deposit_fees: asNumber(charges.depositFees).toFixed(2),
        return_deposit: asNumber(charges.returnDeposit).toFixed(2),
        overhead: asNumber(charges.overhead).toFixed(2),
        sub_total: subTotal.toFixed(2),
        total_amount: totalPayable.toFixed(2)
      }

      if (!isBillFromPurchaseOrder) {
        payload.items_detail = billItems
          .map((item) => ({
            product: Number(item.productId) || null,
            quantity_ordered: getUnitQuantityForPayload(item),
            quantity_received: getUnitQuantityForPayload(item),
            unit_price: asNumber(item.cost).toFixed(2)
          }))
          .filter((item) => item.product)
      }

      await post('/purchasing/bills/', payload)

      navigate('/pos/purchase-bills')
    } catch(err) {
      console.error(err)
    }
  }

  const handleSelectProductFromPopup = (product) => {
    setSelectedSkuValue(product?.sku || '')
    setItemNameInput(product?.itemName || '')
    setSelectedProduct(product || null)
    setItemQty('1')
    setItemBpc(String(asNumber(product?.unitsInCase, 1)))
    setItemCaseCost(normalizeCurrency(product?.caseCost))
    setItemUnitCost(normalizeCurrency(product?.unitCost))
    setItemDiscount('0')
    setIsLooseUnitsOnly(false)
    setLooseUnitsValue('0')
    setIsSkuModalOpen(false)
    setSkuSearch('')
  }

  const handleAddSelectedItem = () => {
    if (!selectedProduct) return

    const qtyValue = isLooseUnitsOnly ? asNumber(looseUnitsValue, 0) : asNumber(itemQty, 0)
    if (qtyValue <= 0) return

    const bpcValue = isLooseUnitsOnly ? 1 : asNumber(itemBpc, 1)
    const caseValue = isLooseUnitsOnly ? 0 : asNumber(itemQty, 0)
    const discountValue = asNumber(itemDiscount, 0)
    const amountValue = asNumber(lineTotalValue, 0)
    const freeQtyValue = asNumber(itemFreeQty, 0)

    const row = {
      sr: billItems.length + 1,
      lineItemId: null,
      productId: selectedProduct.id ?? null,
      sku: selectedSkuValue || selectedProduct.sku || '-',
      vendorCode: selectedProduct.vendorCode || '-',
      itemName: itemNameInput || selectedProduct.itemName || 'N/A',
      sizePack: selectedProduct.sizePack || '-',
      case: caseValue,
      bpc: bpcValue,
      qty: qtyValue,
      isLooseUnitsOnly,
      cost: asNumber(itemUnitCost, 0),
      disc: discountValue,
      amount: amountValue,
      rip: 0,
      freeQty: freeQtyValue,
      unitCost: asNumber(itemUnitCost, 0),
      unitQty: getUnitQuantityForPayload({ qty: qtyValue, bpc: bpcValue }),
      orderKey: null
    }

    let nextSelectedIndex = 0
    setBillItems((prev) => {
      const existingIndex = prev.findIndex((item) => isSameBillItem(item, row))
      if (existingIndex === -1) {
        nextSelectedIndex = prev.length
        return [...prev, row]
      }

      nextSelectedIndex = existingIndex
      return prev.map((item, idx) => {
        if (idx !== existingIndex) return item

        const mergedQty = asNumber(item.qty, 0) + qtyValue
        const mergedCase = asNumber(item.case, 0) + caseValue
        const mergedDisc = asNumber(item.disc, 0) + discountValue
        const mergedAmount = asNumber(item.amount, 0) + amountValue
        const mergedFreeQty = getFreeQuantity(item) + freeQtyValue
        const mergedUnitQty = getUnitQuantityForPayload({ qty: mergedQty, bpc: asNumber(item.bpc, 0) > 0 ? asNumber(item.bpc, 0) : bpcValue })

        return {
          ...item,
          qty: mergedQty,
          case: mergedCase,
          bpc: asNumber(item.bpc, 0) > 0 ? asNumber(item.bpc, 0) : bpcValue,
          cost: asNumber(itemUnitCost, 0),
          disc: mergedDisc,
          amount: mergedAmount,
          freeQty: mergedFreeQty,
          unitCost: asNumber(itemUnitCost, 0),
          unitQty: mergedUnitQty
        }
      })
    })
    setSelectedBillItemIndex(nextSelectedIndex)
    setSelectedProduct(null)
    setSelectedSkuValue('')
    setItemNameInput('')
    setItemQty('')
    setItemBpc('')
    setItemFreeQty('')
    setItemCaseCost('')
    setItemUnitCost('')
    setItemDiscount('')
    setIsLooseUnitsOnly(false)
    setLooseUnitsValue('0')
  }

  const handleRemoveItem = () => {
    if (selectedBillItemIndex === null) return
    setBillItems((prev) =>
      prev
        .filter((_, idx) => idx !== selectedBillItemIndex)
        .map((item, idx) => ({ ...item, sr: idx + 1 }))
    )
    setSelectedBillItemIndex(null)
  }

  const handleRemoveAllItems = () => {
    setBillItems([])
    setSelectedBillItemIndex(null)
  }

  const handleSelectSalesPerson = (person) => {
    setSalesPerson(person?.fullName || '')
    setIsSalesPersonModalOpen(false)
  }

  useEffect(() => {
    if (selectedBillItemIndex === null) return
    if (selectedBillItemIndex >= billItems.length) {
      setSelectedBillItemIndex(null)
    }
  }, [billItems.length, selectedBillItemIndex])

  useEffect(() => {
    const previousCount = previousItemCountRef.current
    if (billItems.length > previousCount && billItems.length > 4 && itemsTableRef.current) {
      itemsTableRef.current.scrollTo({ top: itemsTableRef.current.scrollHeight, behavior: 'smooth' })
    }
    previousItemCountRef.current = billItems.length
  }, [billItems.length])

  useEffect(() => {
    if (isLooseUnitsOnly) {
      setLooseUnitsValue('1')
      setItemQty('0')
      return
    }
    setLooseUnitsValue('0')
    setItemQty('1')
  }, [isLooseUnitsOnly])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="text-[24px] font-bold text-slate-800 tracking-tight font-poppins">Create Purchase Bill</h1>
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => navigate('/pos/purchase-bills')} 
            className="px-6 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Close
          </button>
          <button 
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="px-8 h-10 rounded-xl bg-[#0EA5E9] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0284C7] transition-all active:scale-95 shadow-lg shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Bill Info Card */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
           <div className="lg:col-span-3 space-y-1.5 flex flex-col">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Vendor</label>
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => setIsVendorModalOpen(true)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none flex items-center justify-between focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                >
                  <span className={selectedVendorLabel ? 'text-slate-700' : 'text-slate-400'}>
                    {selectedVendorLabel || 'Select vendor'}
                  </span>
                  <ChevronDown className="text-slate-400" size={16} />
                </button>
              </div>
           </div>
           
           <div className="lg:col-span-3 space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice #</label>
              <input 
                type="text" 
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                placeholder=""
              />
           </div>

           <div className="lg:col-span-4 flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Person</label>
                <input
                  type="text"
                  value={salesPerson}
                  onChange={(e) => setSalesPerson(e.target.value)}
                  placeholder="Enter sales person"
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <button
                type="button"
                onClick={() => setIsSalesPersonModalOpen(true)}
                disabled={!selectedVendorId}
                className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-sky-500 hover:text-sky-500 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <MoreHorizontal size={20} />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-8">
            <DatePickerField 
               label="Bill Date"
               value={billDate}
               onChange={setBillDate}
               required
            />
            <DatePickerField 
               label="Due Date"
               value={dueDate}
               onChange={setDueDate}
               required
            />
             <DatePickerField 
                label="Delivery Date"
                value={deliveryDate}
                onChange={setDeliveryDate}
             />
             <div className="space-y-1.5 flex flex-col justify-end">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Fully Received PO</label>
              <div className="relative group">
                <StyledDropdown
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  disabled={!selectedVendorId || ordersLoading}
                  triggerClassName="border-slate-200 bg-slate-50 !text-slate-700 !font-bold rounded-xl !h-11 shadow-inner"
                  placeholder={!selectedVendorId ? 'Select vendor first' : ordersLoading ? 'Loading orders...' : 'Select fully received order'}
                >
                  <option value="">
                    {!selectedVendorId ? 'Select vendor first' : ordersLoading ? 'Loading orders...' : 'Select fully received order'}
                  </option>
                  {fullyReceivedOrders.map((order) => (
                    <option key={order.key} value={order.key}>
                      {order.poNumber || `PO #${order.key}`}
                    </option>
                  ))}
                </StyledDropdown>
              </div>
            </div>
            <div className="space-y-1.5 flex flex-col justify-end">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Note</label>
              <input 
                type="text" 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Enter note..."
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Item Selection Column */}
        <div className="lg:col-span-8 flex flex-col">
           <Card noPadding className="border-slate-200 flex-1 overflow-hidden">
              <div className="h-14 border-b border-slate-100 flex items-center px-8 bg-slate-50/50">
                 <div className="relative h-full flex items-center">
                    <span className="text-[11px] font-black text-sky-500 uppercase tracking-widest">Item Selection</span>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500" />
                 </div>
              </div>

              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-2 space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU / UPC</label>
                       <div className="relative group">
                          <button
                            type="button"
                            onClick={() => setIsSkuModalOpen(true)}
                            className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-left text-[13px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                          >
                            {selectedSkuValue || 'Select SKU / UPC'}
                          </button>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                       </div>
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                       <input
                         type="text"
                         value={itemQty}
                         onChange={(e) => setItemQty(e.target.value)}
                         disabled={isLooseUnitsOnly}
                         className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner disabled:opacity-50 disabled:cursor-not-allowed"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">BPC</label>
                       <input
                         type="text"
                         value={itemBpc}
                         onChange={(e) => setItemBpc(e.target.value)}
                         className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Free Qty</label>
                       <input
                         type="text"
                         value={itemFreeQty}
                         onChange={(e) => setItemFreeQty(e.target.value)}
                         className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Line Total</label>
                       <div className="relative">
                          <input
                            type="text"
                            value={normalizeCurrency(lineTotalValue)}
                            readOnly
                            className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-400 outline-none"
                          />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-6 gap-6 items-end">
                    <div className="col-span-2 space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
                       <input
                         type="text"
                         value={itemNameInput}
                         onChange={(e) => setItemNameInput(e.target.value)}
                         placeholder="Enter item name"
                         className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="flex items-center gap-2 pb-3">
                       <button
                         type="button"
                         onClick={() => setIsLooseUnitsOnly((prev) => !prev)}
                         className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all group ${
                           isLooseUnitsOnly ? 'border-sky-500' : 'border-slate-200 hover:border-sky-500'
                         }`}
                       >
                          <div className={`w-2.5 h-2.5 rounded-full transition-all ${isLooseUnitsOnly ? 'bg-sky-500' : 'bg-transparent group-hover:bg-sky-500/30'}`} />
                       </button>
                       <span className="text-[12px] font-bold text-slate-500">Loose bottles/Units only</span>
                       <input
                         type="text"
                         value={looseUnitsValue}
                         onChange={(e) => setLooseUnitsValue(e.target.value)}
                         disabled={!isLooseUnitsOnly}
                         placeholder="Loose qty"
                         className="w-24 h-8 rounded-lg border border-slate-200 bg-slate-50 px-2 text-xs font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                       />
                    </div>
                    <div className="col-span-2 invisible" />
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 text-right">Net Qty</label>
                       <input
                         type="text"
                         value={asNumber(netQtyValue, 0).toFixed(2)}
                         readOnly
                         className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 text-center text-sm font-bold text-slate-400 outline-none"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-12 gap-8 items-start">
                    <div className="col-span-8 grid grid-cols-2 gap-x-8 gap-y-6">
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Case Cost</label>
                          <div className="relative">
                             <input
                               type="text"
                               value={displayedCaseCostValue}
                               onChange={(e) => {
                                 if (isLooseUnitsOnly) {
                                   setItemUnitCost(e.target.value)
                                 } else {
                                   setItemCaseCost(e.target.value)
                                 }
                               }}
                               className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                             />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Cost</label>
                          <div className="relative">
                             <input
                               type="text"
                               value={itemUnitCost}
                               onChange={(e) => setItemUnitCost(e.target.value)}
                               className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                             />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Unit Cost</label>
                          <div className="relative">
                             <input type="text" value={normalizeCurrency(currentCostValue)} readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-400 outline-none" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Case Cost</label>
                          <div className="relative">
                             <input type="text" value={normalizeCurrency(asNumber(selectedProduct?.caseCost, 0))} readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-400 outline-none" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount</label>
                          <div className="relative">
                             <input
                               type="text"
                               value={itemDiscount}
                               onChange={(e) => setItemDiscount(e.target.value)}
                               className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                             />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Net Cost</label>
                          <div className="relative">
                             <input type="text" value={normalizeCurrency(itemNetCost)} readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-400 outline-none" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 font-bold">$</span>
                          </div>
                       </div>
                    </div>

                    <div className="col-span-4 space-y-4">
                       <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-3">
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curr Cost:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">{selectedProduct ? formatMoneyLabel(currentCostValue) : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curr Margin:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">{selectedProduct ? formatPercentLabel(currentMarginValue) : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curr Markup:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">{selectedProduct ? formatPercentLabel(currentMarkupValue) : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale Price:</span>
                              <span className="text-[12px] font-black text-slate-800 tracking-tight transition-colors group-hover:text-sky-500 underline decoration-sky-500/30">-</span>
                          </div>
                       </div>

                       <div className="p-5 rounded-2xl bg-white border border-slate-100 space-y-3 shadow-sm">
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Cost:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">{selectedProduct ? formatMoneyLabel(itemNetCost) : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margin:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">{selectedProduct ? formatPercentLabel(currentMarginValue) : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Markup:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">{selectedProduct ? formatPercentLabel(currentMarkupValue) : '-'}</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested Price:</span>
                              <span className="text-[12px] font-black text-slate-800 tracking-tight transition-colors group-hover:text-sky-500">-</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={handleAddSelectedItem}
                      className="h-11 px-8 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95"
                    >
                       <Plus size={18} />
                       Add Item
                    </button>
                 </div>
              </div>
           </Card>
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-4">
            <Card noPadding className="h-full border-slate-200 flex flex-col">
               <div className="h-14 border-b border-slate-100 flex items-center px-8 bg-slate-50/50">
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Summary</h2>
               </div>
               
               <div className="p-8 space-y-4 flex-1">
                 {[
                    { label: 'Sub Total', value: formatMoneyLabel(subTotal) },
                    { label: 'Tax 1', value: formatMoneyLabel(charges.tax1) },
                    { label: 'Tax 2', value: formatMoneyLabel(charges.tax2) },
                    { label: 'Tax 3', value: formatMoneyLabel(charges.tax3) },
                    { label: 'Discount (Fees)', value: formatMoneyLabel(charges.discountFees) },
                    { label: 'Deposit (Fees)', value: formatMoneyLabel(charges.depositFees) },
                    { label: 'Return Deposit', value: formatMoneyLabel(charges.returnDeposit), isRed: true },
                    { label: 'Overhead', value: formatMoneyLabel(charges.overhead) },
                 ].map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                       <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</span>
                       <span className={`text-sm font-black ${row.isRed ? 'text-rose-500' : 'text-slate-700'}`}>{row.value}</span>
                    </div>
                 ))}
                 
                 <div className="h-px bg-slate-100 my-6" />
                 
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-sky-500 tracking-tight font-poppins">Total Payable</h3>
                    <span className="text-[28px] font-black text-sky-500 tracking-tight">{formatMoneyLabel(totalPayable)}</span>
                 </div>

                 <div className="grid grid-cols-3 gap-6 pt-8">
                    <div className="text-center space-y-1">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Qty</div>
                        <div className="text-2xl font-black text-slate-800">{totals.totalQty}</div>
                    </div>
                    <div className="text-center space-y-1 border-x border-slate-100 px-4">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Unit Qty</div>
                        <div className="text-2xl font-black text-slate-800">{totals.totalUnitQty}</div>
                    </div>
                    <div className="text-center space-y-1">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</div>
                        <div className="text-2xl font-black text-slate-800">{totals.items}</div>
                    </div>
                 </div>
              </div>

              <div className="px-8 pb-8 pt-8">
                 <button 
                  type="button"
                  onClick={openCalculator}
                  className="w-full h-12 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                    <Calculator size={18} className="text-slate-400" />
                    Calculator
                 </button>
              </div>
            </Card>
        </div>
      </div>

      {/* Items Table Section */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
         <div className="h-14 border-b border-slate-100 flex items-center px-8 bg-slate-50/50">
            <h2 className="text-[11px] font-black text-slate-400 tracking-widest">Items Detail</h2>
         </div>
         <div ref={itemsTableRef} className="overflow-auto scrollbar-hide flex-1 max-h-[320px]">
            <table className="w-max min-w-full text-left border-collapse">
               <thead className="bg-[#F8FAFC] border-b border-slate-100">
                  <tr>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">Sr #</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">SKU</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">Vendor Code</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">Item Name</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">Size\Pack</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">Case</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">BPC</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">Qty</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">Cost</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">Disc</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap">Amount</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap text-right">RIP</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap text-right">Fr Qty</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap text-right">Unit Cost</th>
                     <th className="sticky top-0 z-10 bg-[#F8FAFC] px-6 py-4 text-[10px] font-black text-slate-400 tracking-widest whitespace-nowrap text-right">Unit Qty</th>
                  </tr>
               </thead>
                <tbody className="divide-y divide-slate-50">
                  {billItems.length === 0 ? (
                    <tr>
                      <td colSpan="15" className="px-6 py-10 text-center text-sm font-bold text-slate-400">
                        No items added yet.
                      </td>
                    </tr>
                  ) : (
                    billItems.map((item, idx) => (
                      <tr
                        key={idx}
                        onClick={() => setSelectedBillItemIndex(idx)}
                        className={`transition-colors cursor-pointer ${selectedBillItemIndex === idx ? 'bg-sky-50' : 'hover:bg-sky-50'}`}
                      >
                         <td className="px-6 py-5 text-sm font-bold text-slate-400">{item.sr}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-600 tracking-tight">{item.sku}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-600">{item.vendorCode}</td>
                         <td className="px-6 py-5 text-sm font-black text-slate-700">{item.itemName}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-500">{item.sizePack}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700 text-center">
                           <input
                             type="checkbox"
                             readOnly
                             checked={!Boolean(item.isLooseUnitsOnly)}
                             className="h-4 w-4 accent-slate-700 pointer-events-none"
                             aria-label="Case mode"
                           />
                         </td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700">{asNumber(item.bpc).toFixed(2)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-sky-500">{formatQuantity(item.qty)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700">${asNumber(item.cost).toFixed(2)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700">{asNumber(item.disc).toFixed(2)}</td>
                         <td className="px-6 py-5 text-sm font-black text-slate-800">${asNumber(item.amount).toFixed(2)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-400 text-right">${item.rip.toFixed(2)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700 text-right">{getFreeQuantity(item).toFixed(0)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700 text-right">${asNumber(getFirstDefined(item.unitCost, item.cost, 0)).toFixed(2)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700 text-right">{asNumber(getFirstDefined(item.unitQty, getUnitQuantityForPayload(item), 0)).toFixed(2)}</td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>

         <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-start">
            <div className="flex items-center gap-3">
               <button
                 type="button"
                 onClick={handleRemoveItem}
                 disabled={selectedBillItemIndex === null}
                 className="h-10 px-6 rounded-xl border border-rose-100 bg-white text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <Trash2 size={16} />
                  Remove
                </button>
               <button
                 type="button"
                 onClick={handleRemoveAllItems}
                 disabled={billItems.length === 0}
                 className="h-10 px-6 rounded-xl border border-rose-100 bg-white text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                  <Trash2 size={16} />
                  Remove All
                </button>
             </div>
         </div>
      </div>


      {isSkuModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-3xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Select SKU / UPC</h3>
              <button
                type="button"
                onClick={() => {
                  setIsSkuModalOpen(false)
                  setSkuSearch('')
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
                  value={skuSearch}
                  onChange={(e) => setSkuSearch(e.target.value)}
                  placeholder="Search SKU / UPC or item name..."
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 pr-11 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 transition-all"
                />
                <Search size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 px-4 py-3 bg-slate-50 border-b border-slate-100">
                  <div className="col-span-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">SKU / UPC</div>
                  <div className="col-span-7 text-[10px] font-black text-slate-400 uppercase tracking-widest">Item Name</div>
                </div>
                <div className="max-h-[380px] overflow-y-auto">
                  {productsLoading ? (
                    <div className="px-4 py-8 text-center text-sm font-bold text-slate-400">Loading products...</div>
                  ) : filteredProducts.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm font-bold text-slate-400">No products found.</div>
                  ) : (
                    filteredProducts.map((product) => (
                      <button
                        key={`${product.id}-${product.sku}`}
                        type="button"
                        onClick={() => handleSelectProductFromPopup(product)}
                        className="w-full grid grid-cols-12 px-4 py-3 text-left border-b border-slate-50 hover:bg-sky-50 transition-colors"
                      >
                        <div className="col-span-5 text-sm font-bold text-slate-700">{product.sku}</div>
                        <div className="col-span-7 text-sm font-bold text-slate-600">{product.itemName}</div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isVendorModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Select Vendor</h3>
              <button
                type="button"
                onClick={() => {
                  setIsVendorModalOpen(false)
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
                        setSelectedVendorId(String(vendor.id))
                        setSelectedOrderId('')
                        setIsSalesPersonModalOpen(false)
                        setIsVendorModalOpen(false)
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

      {isSalesPersonModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Sales Person Details</h3>
                <p className="text-xs font-bold text-slate-400 mt-1">{selectedVendorLabel || 'Selected vendor'}</p>
              </div>
              <button
                type="button"
                onClick={() => setIsSalesPersonModalOpen(false)}
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6">
              {selectedVendorSalesPersons.length === 0 ? (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-400">
                  No sales person details found for this vendor.
                </div>
              ) : (
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {selectedVendorSalesPersons.map((person, index) => (
                    <button
                      key={person.id}
                      type="button"
                      onClick={() => handleSelectSalesPerson(person)}
                      className="w-full rounded-xl border border-slate-200 bg-white px-5 py-4 text-left hover:border-sky-300 hover:bg-sky-50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="text-sm font-black text-slate-700">
                            {person.fullName || `Sales Person ${index + 1}`}
                          </div>
                          <div className="mt-2 space-y-1 text-xs font-bold text-slate-400">
                            <div>Phone: {person.phone || '-'}</div>
                            <div>Email: {person.email || '-'}</div>
                          </div>
                        </div>
                        <div className="text-[11px] font-black uppercase tracking-widest text-sky-500">
                          Select
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {isInvoiceRequiredModalOpen && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
            <div className="h-14 border-b border-slate-100 px-6 flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-700 uppercase tracking-widest">Invoice Required</h3>
              <button
                type="button"
                onClick={() => setIsInvoiceRequiredModalOpen(false)}
                className="h-9 w-9 rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50 transition-all flex items-center justify-center"
              >
                <X size={16} />
              </button>
            </div>
            <div className="px-6 py-6 space-y-5">
              <p className="text-sm font-bold text-slate-600 leading-6">
                A purchase bill cannot be generated without an invoice number. Please enter the invoice number and try again.
              </p>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setIsInvoiceRequiredModalOpen(false)}
                  className="h-10 px-5 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest hover:bg-sky-600 transition-all active:scale-95 shadow-lg shadow-sky-500/20"
                >
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CreatePurchaseBill
