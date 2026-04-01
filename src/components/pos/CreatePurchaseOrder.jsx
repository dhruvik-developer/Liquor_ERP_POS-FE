import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Calculator, Trash2, Plus } from 'lucide-react'
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

const toInputDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const createPoIdentity = (ordersCount) => {
  const nextNumber = String((Number(ordersCount) || 0) + 1)
  const now = new Date()
  const stamp = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`
  return {
    poNumber: nextNumber,
    poId: `POR${stamp}`
  }
}

const CreatePurchaseOrder = () => {
  const { openCalculator } = useCalculator()
  const navigate = useNavigate()

  const [poDate, setPoDate] = useState(toInputDate(new Date()))
  const [selectedVendor, setSelectedVendor] = useState('')
  const [vendorOrderNumber, setVendorOrderNumber] = useState('')
  const [address, setAddress] = useState('')
  const [note, setNote] = useState('')
  const [poNumber, setPoNumber] = useState('')
  const [poId, setPoId] = useState('')
  const [items, setItems] = useState([])

  const [selectedProductId, setSelectedProductId] = useState('')
  const [addQty, setAddQty] = useState('')
  const [addUnitCost, setAddUnitCost] = useState('')
  const [addCaseQty, setAddCaseQty] = useState('')

  const { data: vendorsData, loading: vendorsLoading, error: vendorsError } = useFetch('/people/vendors/')
  const { data: productsData, loading: productsLoading, error: productsError } = useFetch('/inventory/products/')
  const { data: ordersData } = useFetch('/purchasing/orders/')

  const { post, loading: saving, error: apiError } = useApi()

  const vendors = useMemo(() => {
    if (Array.isArray(vendorsData)) return vendorsData
    if (Array.isArray(vendorsData?.results)) return vendorsData.results
    if (Array.isArray(vendorsData?.data?.results)) return vendorsData.data.results
    if (Array.isArray(vendorsData?.data)) return vendorsData.data
    return []
  }, [vendorsData])

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
      const caseUnits = asNumber(getFirstDefined(product.case_units, product.bpc, product.units_per_case, product.pack_quantity, 1), 1)
      const unitCost = asNumber(
        getFirstDefined(
          product.last_cost,
          product.cost_price,
          product.cost,
          product.cost_pricing?.unit_price,
          product.unit_price,
          0
        ),
        0
      )

      return {
        id: getFirstDefined(product.id, product.product_id, index + 1),
        sku: getFirstDefined(product.sku, product.barcode, product.upc, '-'),
        vendorCode: getFirstDefined(product.vendor_code, product.supplier_code, product.code, ''),
        itemName: getFirstDefined(product.name, product.product_name, product.title, 'N/A'),
        lastCost: unitCost,
        caseUnits,
        sizePack: sizePack || '-',
        stock: asNumber(getFirstDefined(product.stock_quantity, product.quantity, 0)),
        unitPrice: asNumber(getFirstDefined(product.retail_price, product.price, 0))
      }
    })
  }, [productsData])

  const ordersCount = useMemo(() => {
    if (Array.isArray(ordersData)) return ordersData.length
    if (Array.isArray(ordersData?.results)) return Number(ordersData.count) || ordersData.results.length
    if (Array.isArray(ordersData?.data?.results)) return Number(ordersData.data.count) || ordersData.data.results.length
    if (Array.isArray(ordersData?.data)) return ordersData.data.length
    return 0
  }, [ordersData])

  useEffect(() => {
    if (!poNumber || !poId) {
      const identity = createPoIdentity(ordersCount)
      setPoNumber(identity.poNumber)
      setPoId(identity.poId)
    }
  }, [ordersCount, poNumber, poId])

  useEffect(() => {
    const selectedVendorData = vendors.find((vendor) => String(vendor.id) === String(selectedVendor))
    if (!selectedVendorData) return

    const vendorAddress = getFirstDefined(
      selectedVendorData.address,
      selectedVendorData.street_address,
      selectedVendorData.billing_address,
      selectedVendorData.city
    )
    setAddress(vendorAddress || '')
  }, [selectedVendor, vendors])

  const selectedProduct = useMemo(
    () => products.find((product) => String(product.id) === String(selectedProductId)) || null,
    [products, selectedProductId]
  )

  useEffect(() => {
    if (!selectedProduct) return
    setAddUnitCost(selectedProduct.lastCost.toFixed(2))
    if (!addQty) setAddQty(selectedProduct.caseUnits.toFixed(2))
    if (!addCaseQty) setAddCaseQty('1')
  }, [selectedProduct, addQty, addCaseQty])

  const totalQty = useMemo(
    () => items.reduce((acc, item) => acc + asNumber(item.qty), 0),
    [items]
  )
  const totalAmount = useMemo(
    () => items.reduce((acc, item) => acc + asNumber(item.lastCost) * asNumber(item.caseQty), 0),
    [items]
  )

  const deleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const updateItem = (id, field, value) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const handleAddItem = () => {
    if (!selectedProduct) return
    const normalizedQty = asNumber(addQty)
    const normalizedCaseQty = asNumber(addCaseQty)
    const normalizedCost = asNumber(addUnitCost, selectedProduct.lastCost)

    setItems((prev) => {
      const existing = prev.find((item) => String(item.productId) === String(selectedProduct.id))
      if (existing) {
        return prev.map((item) =>
          item.id === existing.id
            ? {
                ...item,
                qty: (asNumber(item.qty) + normalizedQty).toFixed(2),
                caseQty: (asNumber(item.caseQty) + normalizedCaseQty).toString(),
                lastCost: normalizedCost
              }
            : item
        )
      }

      return [
        ...prev,
        {
          id: `${selectedProduct.id}-${Date.now()}`,
          productId: selectedProduct.id,
          sku: selectedProduct.sku,
          vendorCode: selectedProduct.vendorCode,
          itemName: selectedProduct.itemName,
          lastCost: normalizedCost,
          caseUnits: selectedProduct.caseUnits,
          qty: normalizedQty.toFixed(2),
          caseQty: normalizedCaseQty.toString(),
          sizePack: selectedProduct.sizePack
        }
      ]
    })
  }

  const handleSave = async () => {
    try {
      await post('/purchasing/orders/', {
        po_number: String(poNumber || ''),
        vendor: Number(selectedVendor) || null,
        vendor_order_ref: vendorOrderNumber || '',
        items: items.map((item) => ({
          product: Number(item.productId),
          quantity_ordered: asNumber(item.qty),
          unit_price: asNumber(item.lastCost).toFixed(2)
        }))
      })
      navigate('/pos/purchase-orders')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {(apiError || vendorsError || productsError) && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold">
          {apiError || vendorsError || productsError}
        </div>
      )}

      <Card noPadding className="border-slate-200 shadow-sm mb-6 !rounded-lg overflow-visible">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Select Vendor</label>
            <div className="relative">
              <select
                value={selectedVendor}
                onChange={(e) => setSelectedVendor(e.target.value)}
                className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none appearance-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
              >
                <option value="">Select a Vendor</option>
                {vendors.map((vendor) => (
                  <option key={vendor.id} value={vendor.id}>
                    {vendor.company_name || vendor.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">PO Number</label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">PO ID</label>
            <input
              type="text"
              value={poId}
              onChange={(e) => setPoId(e.target.value)}
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none"
            />
          </div>
          <DatePickerField label="PO Date" value={poDate} onChange={setPoDate} />

          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Vendor Order #</label>
            <input
              type="text"
              value={vendorOrderNumber}
              onChange={(e) => setVendorOrderNumber(e.target.value)}
              placeholder="Enter Vendor Order #"
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter Address"
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>

          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Note</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note..."
              className="w-full h-[38px] px-3 py-2 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all resize-none"
            />
          </div>
        </div>
      </Card>

      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-6">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left border-collapse table-auto">
            <thead className="bg-[#f9fafb] border-b border-slate-200">
              <tr>
                <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vendor Code</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Last Cost</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Case Units</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Quantity</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Case Qty</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Line Total</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size/Pack</th>
                <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {productsLoading ? (
                <tr>
                  <td colSpan="10" className="px-8 py-12 text-center text-slate-500 font-bold">
                    Loading products...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan="10" className="px-8 py-12 text-center text-slate-500 font-bold">
                    No items found from API.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="px-4 py-3 text-[13px] font-semibold text-slate-600">{item.sku}</td>
                    <td className="px-3 py-3 text-[13px] font-medium text-slate-500">{item.vendorCode || '-'}</td>
                    <td className="px-3 py-3 text-[14px] font-bold text-slate-700">{item.itemName}</td>
                    <td className="px-3 py-3 text-[14px] font-semibold text-slate-700 text-right">{asNumber(item.lastCost).toFixed(2)}</td>
                    <td className="px-3 py-3 text-[14px] font-semibold text-slate-700 text-center">{asNumber(item.caseUnits).toFixed(0)}</td>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 h-8 rounded border border-slate-200 bg-white text-center text-[13px] font-bold text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                        value={item.qty}
                        onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-3 text-center">
                      <input
                        type="number"
                        step="0.01"
                        className="w-20 h-8 rounded border border-slate-200 bg-white text-center text-[13px] font-bold text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                        value={item.caseQty}
                        onChange={(e) => updateItem(item.id, 'caseQty', e.target.value)}
                      />
                    </td>
                    <td className="px-3 py-3 text-[14px] font-bold text-slate-700 text-right">
                      {(asNumber(item.lastCost) * asNumber(item.caseQty)).toFixed(2)}
                    </td>
                    <td className="px-3 py-3 text-[13px] font-medium text-slate-500">{item.sizePack}</td>
                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => deleteItem(item.id)}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center text-[12px] font-bold">
          <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-500 transition-all">
            Custom Fields
          </button>
          <div className="flex gap-10 text-slate-600 uppercase tracking-wider">
            <span>Total Qty: <span className="text-slate-900 ml-1">{totalQty.toFixed(2)}</span></span>
            <span>Total: <span className="text-slate-900 ml-1">$ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card noPadding className="lg:col-span-2 border-slate-200 shadow-sm !rounded-lg overflow-visible">
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKU / UPC</label>
              <div className="relative">
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none appearance-none focus:border-sky-500"
                >
                  <option value="">Select SKU / UPC</option>
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.sku}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
              </div>
            </div>
            <div className="lg:col-span-3 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Code</label>
              <input
                type="text"
                value={selectedProduct?.vendorCode || ''}
                readOnly
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-700 outline-none"
              />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Name</label>
              <input
                type="text"
                readOnly
                value={selectedProduct?.itemName || ''}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-bold text-slate-600 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size</label>
              <input
                type="text"
                readOnly
                value={(selectedProduct?.sizePack || '').split(',')[0] || ''}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-600 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pack</label>
              <input
                type="text"
                readOnly
                value={(selectedProduct?.sizePack || '').split(',')[1] || ''}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-600 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Order Qty</label>
              <input
                type="text"
                readOnly
                value="0"
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Order Date</label>
              <input
                type="text"
                readOnly
                value=""
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-poppins text-sky-600">Quantity</label>
              <input
                type="number"
                step="0.01"
                value={addQty}
                onChange={(e) => setAddQty(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-sky-200 bg-white text-[14px] font-bold text-slate-800 outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unit Cost</label>
              <input
                type="number"
                step="0.01"
                value={addUnitCost}
                onChange={(e) => setAddUnitCost(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-800 outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Case Qty</label>
              <input
                type="number"
                step="0.01"
                value={addCaseQty}
                onChange={(e) => setAddCaseQty(e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-800 outline-none focus:border-sky-500"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleAddItem}
                disabled={!selectedProduct}
                className="w-full h-10 rounded-lg bg-[#0EA5E9] text-white text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#0284C7] transition-all active:scale-95 shadow-md shadow-sky-500/10"
              >
                <Plus size={18} />
                Add Item
              </button>
            </div>
          </div>
        </Card>

        <Card noPadding className="border-slate-200 shadow-sm !rounded-lg">
          <div className="p-6 flex flex-col h-full">
            <div className="grid grid-cols-2 gap-6 mb-auto">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Stock</span>
                <span className="text-xl font-black text-slate-800">{asNumber(selectedProduct?.stock).toFixed(0)}</span>
              </div>
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unit Price</span>
                <span className="text-xl font-black text-slate-800">$ {asNumber(selectedProduct?.unitPrice).toFixed(2)}</span>
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

      <div className="flex justify-between items-center mt-8 border-t border-slate-200 pt-6">
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
          <button
            onClick={handleSave}
            disabled={saving || vendorsLoading || productsLoading}
            className="px-10 h-10 rounded-lg bg-[#0EA5E9] text-white text-[13px] font-bold uppercase tracking-wider hover:bg-[#0284C7] transition-all active:scale-95 shadow-md shadow-sky-500/20 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CreatePurchaseOrder
