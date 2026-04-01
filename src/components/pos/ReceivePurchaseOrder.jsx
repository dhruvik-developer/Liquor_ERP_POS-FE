import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Calculator, Save, CheckCircle2 } from 'lucide-react'
import Loader from '../common/Loader'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'
import { useCalculator } from '../../context/CalculatorContext'
import useApi from '../../hooks/useApi'
import useFetch from '../../hooks/useFetch'

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

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

const ReceivePurchaseOrder = () => {
  const { openCalculator } = useCalculator()
  const navigate = useNavigate()
  const today = toInputDate(new Date())

  const [selectedVendorKey, setSelectedVendorKey] = useState('')
  const [selectedPoId, setSelectedPoId] = useState('')
  const [billId, setBillId] = useState('')
  const [poDate, setPoDate] = useState('')
  const [receiveDate, setReceiveDate] = useState(today)
  const [billDate, setBillDate] = useState(today)
  const [dueDate, setDueDate] = useState(createDefaultDueDate())
  const [vendorContact, setVendorContact] = useState('')
  const [vendorOrderNumber, setVendorOrderNumber] = useState('')
  const [purchaseBillNumber, setPurchaseBillNumber] = useState('')
  const [note, setNote] = useState('')
  const [items, setItems] = useState([])
  const [otherCharges, setOtherCharges] = useState(0)

  const { post, loading: isSaving, error: apiError } = useApi()
  const { data: responseData, loading, error } = useFetch('/purchasing/orders/')

  const purchaseOrders = useMemo(() => {
    if (Array.isArray(responseData)) return responseData
    if (Array.isArray(responseData?.results)) return responseData.results
    if (Array.isArray(responseData?.data?.results)) return responseData.data.results
    if (Array.isArray(responseData?.data)) return responseData.data
    return []
  }, [responseData])

  const normalizedOrders = useMemo(() => {
    return purchaseOrders.map((order, index) => {
      const vendorName = getFirstDefined(
        order.vendor?.company_name,
        order.vendor?.name,
        order.vendor_name,
        order.vendor,
        'N/A'
      )
      const vendorKey = String(getFirstDefined(order.vendor?.id, order.vendor_id, vendorName, `vendor-${index}`))
      const orderId = String(getFirstDefined(order.id, order.pk, order.uuid, `order-${index}`))
      const orderItems = Array.isArray(order.items)
        ? order.items
        : Array.isArray(order.line_items)
        ? order.line_items
        : Array.isArray(order.order_items)
        ? order.order_items
        : Array.isArray(order.lines)
        ? order.lines
        : []

      return {
        key: orderId,
        vendorKey,
        vendorName,
        poNumber: getFirstDefined(order.po_number, order.po_no, order.order_number, order.number, orderId),
        billId: getFirstDefined(order.bill_id, order.purchase_bill_id, order.receiving_bill_id, ''),
        poDate: getFirstDefined(order.order_date, order.po_date, order.date, order.created_at, ''),
        vendorOrderNumber: getFirstDefined(order.vendor_order_number, order.vendor_order_no, ''),
        vendorContact: getFirstDefined(
          order.vendor?.contact_name,
          order.vendor?.contact_person,
          order.vendor?.phone,
          order.vendor_contact,
          vendorName
        ),
        note: getFirstDefined(order.note, order.notes, ''),
        purchaseBillNumber: getFirstDefined(order.purchase_bill_number, order.bill_number, ''),
        purchaseBillDate: getFirstDefined(order.purchase_bill_date, order.bill_date, order.updated_at, ''),
        dueDate: getFirstDefined(order.due_date, ''),
        items: orderItems.map((line, itemIndex) => {
          const product = line.product || {}
          const caseUnits = asNumber(getFirstDefined(line.case_units, line.bpc, line.units_per_case, product.case_units, 1), 1)
          const orderQty = asNumber(
            getFirstDefined(line.quantity_ordered, line.order_qty, line.ordered_qty, line.quantity, line.qty, 0),
            0
          )
          const alreadyReceivedQty = asNumber(
            getFirstDefined(line.received_qty, line.received_quantity, line.quantity_received, 0),
            0
          )
          const unitCost = asNumber(getFirstDefined(line.cost, line.unit_cost, line.unit_price, product.cost, 0), 0)
          const caseCost = asNumber(getFirstDefined(line.case_cost, unitCost * caseUnits), 0)
          const lineItemId = getFirstDefined(line.id, line.item_id, null)
          const productId = getFirstDefined(line.product_id, product.id, null)

          return {
            id: `${orderId}-${itemIndex}`,
            lineItemId,
            productId,
            sku: getFirstDefined(line.sku, product.sku, product.upc, product.barcode, '-'),
            description: getFirstDefined(line.item_description, line.description, product.name, product.item_name, 'N/A'),
            sizePack: getFirstDefined(line.size_pack, product.size_pack, product.pack_size, '-'),
            cost: unitCost,
            caseCost,
            caseUnits,
            orderQty,
            alreadyReceivedQty,
            received: 0,
            selected: false
          }
        })
      }
    })
  }, [purchaseOrders])

  const vendorOptions = useMemo(() => {
    const seen = new Set()
    return normalizedOrders.filter((order) => {
      if (seen.has(order.vendorKey)) return false
      seen.add(order.vendorKey)
      return true
    })
  }, [normalizedOrders])

  const filteredOrders = useMemo(() => {
    if (!selectedVendorKey) return normalizedOrders
    return normalizedOrders.filter((order) => order.vendorKey === selectedVendorKey)
  }, [normalizedOrders, selectedVendorKey])

  const selectedOrder = useMemo(
    () => filteredOrders.find((order) => order.key === selectedPoId) || null,
    [filteredOrders, selectedPoId]
  )

  useEffect(() => {
    if (normalizedOrders.length === 0) return
    if (!selectedVendorKey) {
      setSelectedVendorKey(normalizedOrders[0].vendorKey)
    }
  }, [normalizedOrders, selectedVendorKey])

  useEffect(() => {
    if (filteredOrders.length === 0) {
      setSelectedPoId('')
      return
    }
    if (!filteredOrders.some((order) => order.key === selectedPoId)) {
      setSelectedPoId(filteredOrders[0].key)
    }
  }, [filteredOrders, selectedPoId])

  useEffect(() => {
    if (!selectedOrder) {
      setBillId('')
      setPoDate('')
      setVendorContact('')
      setVendorOrderNumber('')
      setPurchaseBillNumber('')
      setNote('')
      setItems([])
      return
    }

    setBillId(selectedOrder.billId)
    setPoDate(toInputDate(selectedOrder.poDate) || today)
    setVendorContact(selectedOrder.vendorContact || selectedOrder.vendorName)
    setVendorOrderNumber(selectedOrder.vendorOrderNumber || '')
    setPurchaseBillNumber(selectedOrder.purchaseBillNumber || '')
    setBillDate(toInputDate(selectedOrder.purchaseBillDate) || today)
    setDueDate(toInputDate(selectedOrder.dueDate) || createDefaultDueDate())
    setNote(selectedOrder.note || '')
    setItems(selectedOrder.items)
  }, [selectedOrder, today])

  const totals = useMemo(() => {
    const totalReceived = items.reduce((acc, item) => acc + asNumber(item.received), 0)
    const subTotal = items.reduce((acc, item) => acc + asNumber(item.received) * asNumber(item.caseCost), 0)
    return {
      totalReceived,
      subTotal,
      totalPayable: subTotal + asNumber(otherCharges)
    }
  }, [items, otherCharges])

  const handleReceivedChange = (id, value) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id !== id
          ? item
          : (() => {
              const numericValue = Math.trunc(asNumber(value, 0))
              const maxReceivable = Math.max(Math.trunc(asNumber(item.orderQty) - asNumber(item.alreadyReceivedQty)), 0)
              const clamped = Math.min(Math.max(numericValue, 0), maxReceivable)
              return {
                ...item,
                received: clamped,
                selected: clamped > 0 ? true : item.selected
              }
            })()
      )
    )
  }

  const toggleSelect = (id) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item)))
  }

  const handleSave = async () => {
    if (!selectedOrder) return

    const selectedItems = items.filter((item) => item.selected && Math.trunc(asNumber(item.received)) > 0)
    if (selectedItems.length === 0) return

    try {
      const payloadItems = selectedItems
        .map((item) => {
          const receivedQuantity = Math.trunc(asNumber(item.received))
          const itemId = Number(item.lineItemId)
          const productId = Number(item.productId)

          if (!(receivedQuantity > 0)) return null

          if (Number.isFinite(itemId) && itemId > 0) {
            return { item_id: itemId, received_quantity: receivedQuantity }
          }

          if (Number.isFinite(productId) && productId > 0) {
            return { product_id: productId, received_quantity: receivedQuantity }
          }

          return null
        })
        .filter(Boolean)

      if (payloadItems.length === 0) return

      await post(`/purchasing/orders/${selectedOrder.key}/receive/`, {
        items: payloadItems
      })
      navigate('/pos/purchase-orders')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {(apiError || error) && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold">
          {apiError || error}
        </div>
      )}

      <Card noPadding className="border-slate-200 shadow-sm mb-6 !rounded-lg overflow-visible">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Bill ID</label>
            <input
              type="text"
              readOnly
              value={billId}
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Select Vendor</label>
            <div className="relative">
              <select
                value={selectedVendorKey}
                onChange={(e) => setSelectedVendorKey(e.target.value)}
                className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none appearance-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
              >
                {vendorOptions.map((vendor) => (
                  <option key={vendor.vendorKey} value={vendor.vendorKey}>
                    {vendor.vendorName}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Select PO</label>
            <div className="relative">
              <select
                value={selectedPoId}
                onChange={(e) => setSelectedPoId(e.target.value)}
                className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none appearance-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
              >
                {filteredOrders.map((order) => (
                  <option key={order.key} value={order.key}>
                    {order.poNumber}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <DatePickerField label="PO Date" value={poDate} onChange={setPoDate} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Vendor Contact</label>
            <input
              type="text"
              readOnly
              value={vendorContact}
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Vendor Order #</label>
            <input
              type="text"
              value={vendorOrderNumber}
              onChange={(e) => setVendorOrderNumber(e.target.value)}
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>

          <DatePickerField label="Receive Date" value={receiveDate} onChange={setReceiveDate} />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Purchase Bill #</label>
            <input
              type="text"
              value={purchaseBillNumber}
              onChange={(e) => setPurchaseBillNumber(e.target.value)}
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>
          <DatePickerField label="Purchase Bill Date" value={billDate} onChange={setBillDate} />

          <div className="flex items-center gap-3 pt-4">
            <div className="w-5 h-5 rounded border-2 border-[#0EA5E9] bg-[#0EA5E9] flex items-center justify-center shrink-0 shadow-sm">
              <CheckCircle2 size={14} className="text-white" />
            </div>
            <div className="flex-1">
              <DatePickerField label="Due Date" value={dueDate} onChange={setDueDate} />
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-[38px] px-3 py-2 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all resize-none"
            />
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div className="overflow-x-auto scrollbar-hide flex-1">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="bg-[#f9fafb] border-b border-slate-200">
              <tr>
                <th className="px-5 py-4 w-12 text-center">
                  <div className="w-4 h-4 rounded border-2 border-slate-200 bg-white m-auto" />
                </th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Description</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size/Pack</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Cost</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Case Cost</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Case Units</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Order Qty</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Received</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Remaining</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Total Qty</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Landing Cost</th>
                <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="13" className="px-8 py-10">
                    <div className="flex flex-col items-center justify-center">
                      <Loader size={48} className="mx-auto" />
                      <p className="mt-2 text-[#64748B] font-medium tracking-tight">Loading order details...</p>
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="13" className="px-8 py-16 text-center text-slate-500 font-bold">
                    No purchase order items found.
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const remainingQty = Math.max(
                    asNumber(item.orderQty) - asNumber(item.alreadyReceivedQty) - asNumber(item.received),
                    0
                  )
                  const totalQty = asNumber(item.received) * asNumber(item.caseUnits)
                  const lineAmount = asNumber(item.received) * asNumber(item.caseCost)
                  return (
                    <tr
                      key={item.id}
                      className={`hover:bg-slate-50 transition-colors ${item.selected ? 'bg-sky-50/50' : index % 2 !== 0 ? 'bg-slate-50/20' : ''}`}
                    >
                      <td className="px-5 py-3.5 text-center">
                        <div
                          onClick={() => toggleSelect(item.id)}
                          className={`w-4 h-4 rounded border-2 m-auto flex items-center justify-center cursor-pointer transition-all ${
                            item.selected ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white'
                          }`}
                        >
                          {item.selected && <CheckCircle2 size={12} className="text-white" />}
                        </div>
                      </td>
                      <td className="px-3 py-3.5 text-[13px] font-semibold text-slate-600">{item.sku}</td>
                      <td className="px-3 py-3.5 text-[14px] font-bold text-slate-700">{item.description}</td>
                      <td className="px-3 py-3.5 text-[13px] font-medium text-slate-500">{item.sizePack}</td>
                      <td className="px-3 py-3.5 text-[14px] font-semibold text-slate-700 text-right">{asNumber(item.cost).toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-[14px] font-semibold text-slate-700 text-right">{asNumber(item.caseCost).toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-[14px] font-semibold text-slate-700 text-center">{asNumber(item.caseUnits).toFixed(0)}</td>
                      <td className="px-3 py-3.5 text-[14px] font-semibold text-slate-700 text-right">{asNumber(item.orderQty).toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-center">
                        <input
                          type="number"
                          step="1"
                          min="0"
                          className="w-16 h-[30px] rounded border border-yellow-200 bg-yellow-50 text-center text-[13px] font-bold text-slate-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 transition-all"
                          value={item.received}
                          onChange={(e) => handleReceivedChange(item.id, e.target.value)}
                        />
                      </td>
                      <td className="px-3 py-3.5 text-[13px] font-semibold text-slate-400 text-right">{remainingQty.toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-[13px] font-semibold text-slate-400 text-right">{totalQty.toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-[14px] font-bold text-slate-700 text-right">{asNumber(item.caseCost).toFixed(2)}</td>
                      <td className="px-3 py-3.5 text-[14px] font-bold text-slate-900 text-right">{lineAmount.toFixed(2)}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mt-6">
        <div>
          <button
            onClick={openCalculator}
            className="h-10 px-5 rounded-lg border border-slate-300 bg-white text-slate-600 text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-all active:scale-95 shadow-sm"
          >
            <Calculator size={18} className="text-slate-400" />
            Calculator
          </button>
        </div>

        <div className="w-full lg:max-w-md space-y-3">
          <div className="flex justify-between items-center px-2">
            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Total Received :</span>
            <div className="w-[200px] h-[36px] px-3 rounded-lg border border-slate-100 bg-[#f9fafb] flex items-center justify-end text-[14px] font-bold text-slate-700">
              {totals.totalReceived.toFixed(2)}
            </div>
          </div>
          <div className="flex justify-between items-center px-2">
            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Sub Total :</span>
            <div className="w-[200px] h-[36px] px-3 rounded-lg border border-slate-100 bg-[#f9fafb] flex items-center justify-end text-[14px] font-bold text-slate-700">
              $ {totals.subTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="flex justify-between items-center px-2">
            <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Other Charges :</span>
            <input
              type="number"
              step="0.01"
              className="w-[200px] h-[36px] px-3 rounded-lg border border-slate-200 bg-white text-right text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-inner"
              value={otherCharges}
              onChange={(e) => setOtherCharges(asNumber(e.target.value))}
            />
          </div>

          <div className="bg-[#E0F2FE] border-l-4 border-[#0EA5E9] rounded-lg px-6 py-4 flex justify-between items-center shadow-sm">
            <h3 className="text-[16px] font-bold text-[#0369A1] uppercase tracking-wide">Total Payable :</h3>
            <span className="text-2xl font-black text-[#0369A1]">
              $ {totals.totalPayable.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end items-center gap-4 mt-8 border-t border-slate-200 pt-6">
        <button
          onClick={() => navigate('/pos/purchase-orders')}
          className="px-6 h-[42px] rounded-lg bg-slate-200 text-slate-700 text-[13px] font-bold uppercase tracking-wider hover:bg-slate-300 transition-all active:scale-95"
        >
          Close
        </button>
        <button
          onClick={handleSave}
          disabled={isSaving || !selectedOrder}
          className="px-10 h-[42px] rounded-lg bg-[#0EA5E9] text-white text-[13px] font-bold uppercase tracking-wider hover:bg-[#0284C7] transition-all active:scale-95 shadow-md shadow-sky-500/20 flex items-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {isSaving ? 'Saving...' : 'Save'}
        </button>
      </div>
    </div>
  )
}

export default ReceivePurchaseOrder
