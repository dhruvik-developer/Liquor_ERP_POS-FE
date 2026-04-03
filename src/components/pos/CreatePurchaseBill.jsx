import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save, 
  Plus, 
  Trash2, 
  Calculator, 
  Upload, 
  ChevronDown,
  X,
  Settings,
  MoreHorizontal
} from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'
import { useCalculator } from '../../context/CalculatorContext'
import useApi from '../../hooks/useApi'
import useFetch from '../../hooks/useFetch'
import { postStockAdjustments } from '../../services/stockAdjustments'

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

const collectNonEmptyStrings = (values) =>
  values
    .map((value) => (value === undefined || value === null ? '' : String(value).trim()))
    .filter(Boolean)

const asNumber = (value, fallback = 0) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : fallback
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

const formatMoneyLabel = (value) => `$${normalizeCurrency(value)}`

const getOrderItems = (order) => {
  if (!order) return []
  if (Array.isArray(order.items)) return order.items
  if (Array.isArray(order.line_items)) return order.line_items
  if (Array.isArray(order.order_items)) return order.order_items
  if (Array.isArray(order.lines)) return order.lines
  return []
}

const normalizeOrderLineItem = (line, lineIndex, orderId) => {
  const product = line.product || {}
  const qty = asNumber(
    getFirstDefined(line.quantity_ordered, line.quantity, line.qty, line.order_qty, line.ordered_qty, 0),
    0
  )
  const bpc = asNumber(getFirstDefined(line.case_units, line.bpc, line.units_per_case, product.case_units, 1), 1)
  const cost = asNumber(getFirstDefined(line.unit_price, line.unit_cost, line.cost, line.price, product.cost, 0), 0)
  const disc = asNumber(getFirstDefined(line.discount, line.discount_amount, 0), 0)
  const amount = asNumber(getFirstDefined(line.amount, line.total_amount), qty * cost - disc)

  const size = getFirstDefined(product.size?.name, product.size_name, line.size, '')
  const pack = getFirstDefined(product.pack?.name, product.pack_name, line.pack, '')
  const sizePack = [size, pack].filter(Boolean).join(' / ') || '-'

  return {
    sr: lineIndex + 1,
    lineItemId: getFirstDefined(line.id, line.item_id, null),
    productId: getFirstDefined(line.product_id, product.id, null),
    sku: getFirstDefined(line.sku, product.sku, product.upc, product.barcode, '-'),
    vendorCode: getFirstDefined(line.vendor_code, product.vendor_code, product.supplier_code, '-'),
    itemName: getFirstDefined(line.item_name, line.item_description, line.description, product.name, product.item_name, 'N/A'),
    sizePack,
    case: asNumber(getFirstDefined(line.case_qty, line.cases, line.case_count, qty), qty),
    bpc,
    qty,
    cost,
    disc,
    amount,
    rip: asNumber(getFirstDefined(line.rip, line.return_invoice_price, 0), 0),
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
  const [stockSyncError, setStockSyncError] = useState('')
  const [charges, setCharges] = useState({
    tax1: 0,
    tax2: 0,
    tax3: 0,
    discountFees: 0,
    depositFees: 0,
    returnDeposit: 0,
    overhead: 0
  })
  
  const { post, loading, error: apiError } = useApi()
  const { data: vendorsData, loading: vendorsLoading, error: vendorsError } = useFetch('/people/vendors/')
  const { data: ordersData, loading: ordersLoading, error: ordersError } = useFetch('/purchasing/orders/')
  const { data: billsData, error: billsError } = useFetch('/purchasing/bills/')
  const vendors = useMemo(() => {
    if (Array.isArray(vendorsData)) return vendorsData
    if (Array.isArray(vendorsData?.results)) return vendorsData.results
    if (Array.isArray(vendorsData?.data?.results)) return vendorsData.data.results
    if (Array.isArray(vendorsData?.data)) return vendorsData.data
    return []
  }, [vendorsData])
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
      const items = getOrderItems(order).map((line, lineIndex) => normalizeOrderLineItem(line, lineIndex, orderId))

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
  }, [purchaseOrders])

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

  const handleSave = async () => {
    let billSaved = false
    try {
      setStockSyncError('')
      if (billItems.length === 0 || !selectedVendorId) return

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
            quantity_ordered: asNumber(item.qty),
            quantity_received: asNumber(item.qty),
            unit_price: asNumber(item.cost).toFixed(2)
          }))
          .filter((item) => item.product)
      }

      await post('/purchasing/bills/', payload)
      billSaved = true

      if (!isBillFromPurchaseOrder) {
        await postStockAdjustments({
          post,
          entries: billItems.map((item) => ({
            product: Number(item.productId),
            quantity: Math.trunc(asNumber(item.qty) * Math.max(asNumber(item.bpc, 1), 1))
          })),
          adjustmentType: 'add',
          reason: 'Direct Purchase Bill',
          note: `Bill ${invoiceNumber || '-'} dated ${billDate || today}`
        })
      }

      navigate('/pos/purchase-bills')
    } catch(err) {
      if (billSaved) {
        setStockSyncError('Purchase bill save ho gaya, lekin stock adjustment sync nahi ho paya. Please inventory adjustments check karein.')
      }
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {(stockSyncError || apiError || vendorsError || ordersError || billsError) && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold">
          {stockSyncError || apiError || vendorsError || ordersError || billsError}
        </div>
      )}
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="text-[24px] font-bold text-slate-800 tracking-tight font-poppins">Create Purchase Bill</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/pos/purchase-bills')} 
            className="px-6 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Close
          </button>
          <button 
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
                <select
                  value={selectedVendorId}
                  onChange={(e) => {
                    setSelectedVendorId(e.target.value)
                    setSelectedOrderId('')
                  }}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                >
                  <option value="">Select vendor</option>
                  {vendorsLoading ? (
                    <option value="" disabled>
                      Loading vendors...
                    </option>
                  ) : (
                    vendors.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.vendor_name || vendor.company_name || vendor.name || `Vendor ${vendor.id}`}
                      </option>
                    ))
                  )}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
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
              <button className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-sky-500 hover:text-sky-500 transition-all shadow-sm active:scale-95">
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
                <select
                  value={selectedOrderId}
                  onChange={(e) => setSelectedOrderId(e.target.value)}
                  disabled={!selectedVendorId || ordersLoading}
                  className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 focus:bg-white transition-all shadow-inner disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!selectedVendorId ? 'Select vendor first' : ordersLoading ? 'Loading orders...' : 'Select fully received order'}
                  </option>
                  {fullyReceivedOrders.map((order) => (
                    <option key={order.key} value={order.key}>
                      {order.poNumber || `PO #${order.key}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
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
                       <input 
                         type="text" 
                         defaultValue=""
                         className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                        />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                       <input type="text" defaultValue="" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">BPC</label>
                       <input type="text" defaultValue="" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Free Qty</label>
                       <input type="text" defaultValue="" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Line Total</label>
                       <div className="relative">
                          <input type="text" defaultValue="" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-6 gap-6 items-end">
                    <div className="col-span-2 space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
                       <div className="relative group">
                           <select className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 focus:bg-white transition-all shadow-inner">
                             <option value="">Select item</option>
                           </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                       </div>
                    </div>
                    <div className="flex items-center gap-2 pb-3">
                       <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center cursor-pointer transition-all hover:border-sky-500 group">
                          <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-sky-500/30" />
                       </div>
                       <span className="text-[12px] font-bold text-slate-500">Loose bottles/Units only</span>
                    </div>
                    <div className="col-span-2 invisible" />
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 text-right">Net Qty</label>
                       <input type="text" defaultValue="" readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 text-center text-sm font-bold text-slate-400 outline-none" />
                    </div>
                 </div>

                 <div className="grid grid-cols-12 gap-8 items-start">
                    <div className="col-span-8 grid grid-cols-2 gap-x-8 gap-y-6">
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Case Cost</label>
                          <div className="relative">
                             <input type="text" defaultValue="" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Cost</label>
                          <div className="relative">
                             <input type="text" defaultValue="" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Unit Cost</label>
                          <div className="relative">
                             <input type="text" defaultValue="" readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-400 outline-none" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Case Cost</label>
                          <div className="relative">
                             <input type="text" defaultValue="" readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-400 outline-none" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount</label>
                          <div className="relative">
                             <input type="text" defaultValue="" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Net Cost</label>
                          <div className="relative">
                             <input type="text" defaultValue="" readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-400 outline-none" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 font-bold">$</span>
                          </div>
                       </div>
                    </div>

                    <div className="col-span-4 space-y-4">
                       <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-3">
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curr Cost:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">-</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curr Margin:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">-</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curr Markup:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">-</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale Price:</span>
                              <span className="text-[12px] font-black text-slate-800 tracking-tight transition-colors group-hover:text-sky-500 underline decoration-sky-500/30">-</span>
                          </div>
                       </div>

                       <div className="p-5 rounded-2xl bg-white border border-slate-100 space-y-3 shadow-sm">
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Cost:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">-</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margin:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">-</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Markup:</span>
                              <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">-</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested Price:</span>
                              <span className="text-[12px] font-black text-slate-800 tracking-tight transition-colors group-hover:text-sky-500">-</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-end pt-4">
                    <button className="h-11 px-8 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95">
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

              <div className="pt-8">
                 <button 
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
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Items Detail</h2>
         </div>
         <div className="overflow-x-auto scrollbar-hide flex-1">
            <table className="w-full text-left border-collapse">
               <thead className="bg-[#F8FAFC] border-b border-slate-100">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">SR #</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">SKU</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Vendor Code</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Item Name</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Size/Pack</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Case</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">BPC</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Qty</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Cost</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Disc</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Amount</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">RIP</th>
                  </tr>
               </thead>
                <tbody className="divide-y divide-slate-50">
                  {billItems.length === 0 ? (
                    <tr>
                      <td colSpan="12" className="px-6 py-10 text-center text-sm font-bold text-slate-400">
                        No items added yet.
                      </td>
                    </tr>
                  ) : (
                    billItems.map((item, idx) => (
                      <tr key={idx} className="hover:bg-sky-50 transition-colors">
                         <td className="px-6 py-5 text-sm font-bold text-slate-400">{item.sr}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-600 tracking-tight">{item.sku}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-600">{item.vendorCode}</td>
                         <td className="px-6 py-5 text-sm font-black text-slate-700">{item.itemName}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-500">{item.sizePack}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.case}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700">{asNumber(item.bpc).toFixed(2)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-sky-500">{asNumber(item.qty).toFixed(2)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700">${asNumber(item.cost).toFixed(3)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-700">{asNumber(item.disc).toFixed(3)}</td>
                         <td className="px-6 py-5 text-sm font-black text-slate-800">${asNumber(item.amount).toFixed(3)}</td>
                         <td className="px-6 py-5 text-sm font-bold text-slate-400 text-right">${item.rip.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>

         <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <button className="h-10 px-6 rounded-xl border border-rose-100 bg-white text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 transition-all shadow-sm active:scale-95">
                  <Trash2 size={16} />
                  Remove
               </button>
               <button className="h-10 px-6 rounded-xl border border-rose-100 bg-white text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 transition-all shadow-sm active:scale-95">
                  <Trash2 size={16} />
                  Remove All
               </button>
            </div>
            
            <div className="flex items-center gap-3">
               <button className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  <Upload size={16} className="text-slate-400" />
                  Load CSV
               </button>
               <button className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  <Settings size={16} className="text-slate-400" />
                  Custom Fields
               </button>
            </div>
         </div>
      </div>
    </div>
  )
}

export default CreatePurchaseBill
