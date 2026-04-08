import React, { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ChevronDown, 
  Search, 
  Calculator, 
  Save, 
  X,
  Trash2,
  CheckCircle2,
  RefreshCcw
} from 'lucide-react'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'
import StyledDropdown from '../common/StyledDropdown'
import { useCalculator } from '../../context/CalculatorContext'
import useApi from '../../hooks/useApi'
import useFetch from '../../hooks/useFetch'

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')
const toSearchValue = (value) => String(value ?? '').trim().toLowerCase()
const toInputDate = (value) => {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
const roundToTwo = (value) => {
  const num = Number(value) || 0
  return Math.round((num + Number.EPSILON) * 100) / 100
}
const toFixedTwoString = (value) => roundToTwo(value).toFixed(2)
const reindexItems = (list) => list.map((item, index) => ({ ...item, sr: index + 1 }))

const CreatePurchaseReturn = () => {
  const { openCalculator } = useCalculator()
  const navigate = useNavigate()
  const today = toInputDate(new Date())
  const [returnDate, setReturnDate] = useState(today)
  const [billDate, setBillDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [items, setItems] = useState([])

  const totalReturns = useMemo(
    () => items.reduce((acc, item) => acc + (Number(item.qtyReturn) || 0), 0),
    [items]
  )
  const subTotal = useMemo(
    () => items.reduce((acc, item) => acc + (item.unitCost * (Number(item.qtyReturn) || 0)), 0),
    [items]
  )
  const [otherCharges, setOtherCharges] = useState(0)
  const [selectedVendorId, setSelectedVendorId] = useState('')
  const [selectedBillId, setSelectedBillId] = useState('')
  const [vendorSearch, setVendorSearch] = useState('')
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false)
  const [vendorContact, setVendorContact] = useState('')
  const [billInternalId, setBillInternalId] = useState('')
  const [returnBillNumber, setReturnBillNumber] = useState('')
  const [invoiceSearchValue, setInvoiceSearchValue] = useState('')
  const [invoiceSearchMessage, setInvoiceSearchMessage] = useState('')
  const [paidStatus, setPaidStatus] = useState('Paid')
  const [note, setNote] = useState('')

  const selectedItemsCount = useMemo(
    () => items.filter((item) => item.selected).length,
    [items]
  )
  const allItemsSelected = items.length > 0 && selectedItemsCount === items.length
  const someItemsSelected = selectedItemsCount > 0 && selectedItemsCount < items.length

  const handleReturnChange = (lineKey, val) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.lineKey === lineKey ? { ...item, qtyReturn: val } : item
      )
    )
  }

  const toggleSelect = (lineKey) => {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.lineKey === lineKey ? { ...item, selected: !item.selected } : item
      )
    )
  }

  const toggleSelectAll = () => {
    const nextSelectedState = !allItemsSelected
    setItems((currentItems) =>
      currentItems.map((item) => ({ ...item, selected: nextSelectedState }))
    )
  }

  const resetPurchaseReturnForm = () => {
    setReturnDate(today)
    setBillDate('')
    setDueDate('')
    setItems([])
    setOtherCharges(0)
    setSelectedVendorId('')
    setSelectedBillId('')
    setVendorContact('')
    setBillInternalId('')
    setReturnBillNumber('')
    setInvoiceSearchValue('')
    setInvoiceSearchMessage('')
    setPaidStatus('Paid')
    setNote('')
  }

  const handleRemoveSelected = () => {
    if (selectedItemsCount === 0) return
    const remainingItems = reindexItems(items.filter((item) => !item.selected))
    if (remainingItems.length === 0) {
      resetPurchaseReturnForm()
      return
    }
    setItems(remainingItems)
  }

  const handleRemoveAll = () => {
    if (items.length === 0) return
    resetPurchaseReturnForm()
  }

  const { post, loading, error: apiError } = useApi()
  const { data: billsData, loading: billsLoading, error: billsError } = useFetch('/purchasing/bills/')
  const { data: vendorsData, error: vendorsError } = useFetch('/people/vendors/')
  const { data: productsData, error: productsError } = useFetch('/inventory/products/')

  const purchaseBills = useMemo(() => {
    if (Array.isArray(billsData)) return billsData
    if (Array.isArray(billsData?.results)) return billsData.results
    if (Array.isArray(billsData?.data?.results)) return billsData.data.results
    if (Array.isArray(billsData?.data)) return billsData.data
    return []
  }, [billsData])

  const vendors = useMemo(() => {
    if (Array.isArray(vendorsData)) return vendorsData
    if (Array.isArray(vendorsData?.results)) return vendorsData.results
    if (Array.isArray(vendorsData?.data?.results)) return vendorsData.data.results
    if (Array.isArray(vendorsData?.data)) return vendorsData.data
    return []
  }, [vendorsData])

  const vendorsById = useMemo(() => {
    const map = new Map()
    vendors.forEach((vendor, index) => {
      const vendorId = String(getFirstDefined(vendor?.id, vendor?.vendor_id, '')).trim()
      if (!vendorId) return
      map.set(vendorId, {
        id: vendorId,
        name: String(getFirstDefined(vendor?.vendor_name, vendor?.company_name, vendor?.name, `Vendor ${index + 1}`)).trim(),
        contact: String(
          getFirstDefined(
            vendor?.contact_name,
            vendor?.contact_person,
            vendor?.phone,
            vendor?.email,
            vendor?.company_name,
            ''
          )
        ).trim()
      })
    })
    return map
  }, [vendors])

  const products = useMemo(() => {
    if (Array.isArray(productsData)) return productsData
    if (Array.isArray(productsData?.results)) return productsData.results
    if (Array.isArray(productsData?.data?.results)) return productsData.data.results
    if (Array.isArray(productsData?.data)) return productsData.data
    return []
  }, [productsData])

  const productsById = useMemo(() => {
    const map = new Map()
    products.forEach((product) => {
      const productId = String(getFirstDefined(product?.id, product?.product_id, '')).trim()
      if (!productId) return
      const size = getFirstDefined(product?.size?.name, product?.size_name, product?.size, '')
      const pack = getFirstDefined(product?.pack?.name, product?.pack_name, product?.pack, '')
      map.set(productId, {
        sku: String(getFirstDefined(product?.sku, product?.barcode, product?.upc, '-')),
        description: String(getFirstDefined(product?.item_name, product?.name, product?.product_name, 'N/A')),
        sizePack: [size, pack].filter(Boolean).join(' / ') || '-'
      })
    })
    return map
  }, [products])

  const vendorOptions = useMemo(() => {
    const lookup = new Map()

    purchaseBills.forEach((bill) => {
      const vendorId = String(getFirstDefined(bill?.vendor?.id, bill?.vendor_id, bill?.vendor, '')).trim()
      if (!vendorId) return

      const vendorFromPeople = vendorsById.get(vendorId)
      const billSalesPerson = String(getFirstDefined(bill?.sales_person, bill?.salesperson, '')).trim()

      if (lookup.has(vendorId)) {
        if (billSalesPerson && !lookup.get(vendorId).salesPerson) {
          lookup.set(vendorId, { ...lookup.get(vendorId), salesPerson: billSalesPerson })
        }
        return
      }

      const vendorName = String(
        getFirstDefined(
          vendorFromPeople?.name,
          bill?.vendor?.vendor_name,
          bill?.vendor?.company_name,
          bill?.vendor?.name,
          bill?.vendor_name,
          `Vendor ${vendorId}`
        )
      ).trim()

      const vendorContact = String(
        getFirstDefined(
          vendorFromPeople?.contact,
          bill?.vendor?.contact_name,
          bill?.vendor?.contact_person,
          bill?.vendor?.phone,
          bill?.vendor?.email,
          ''
        )
      ).trim()

      lookup.set(vendorId, {
        id: vendorId,
        name: vendorName || `Vendor ${vendorId}`,
        contact: vendorContact,
        salesPerson: billSalesPerson || '-'
      })
    })

    return Array.from(lookup.values()).sort((a, b) => a.name.localeCompare(b.name))
  }, [purchaseBills, vendorsById])

  const filteredVendorOptions = useMemo(() => {
    const query = String(vendorSearch || '').trim().toLowerCase()
    if (!query) return vendorOptions
    return vendorOptions.filter((vendor) => `${vendor.name} ${vendor.id} ${vendor.salesPerson}`.toLowerCase().includes(query))
  }, [vendorOptions, vendorSearch])

  const filteredBills = useMemo(() => {
    if (!selectedVendorId) return []
    return purchaseBills.filter((bill) => String(getFirstDefined(bill?.vendor?.id, bill?.vendor_id, bill?.vendor, '')).trim() === selectedVendorId)
  }, [purchaseBills, selectedVendorId])

  const selectedVendorLabel = useMemo(() => {
    return vendorOptions.find((vendor) => vendor.id === selectedVendorId)?.name || ''
  }, [vendorOptions, selectedVendorId])

  const getBillValue = (bill, index = 0) =>
    String(getFirstDefined(bill?.id, bill?.bill_id, bill?.invoice_number, `bill-${index}`))

  const mapBillItems = (bill) => {
    if (!Array.isArray(bill?.items_detail)) return []
    return bill.items_detail.map((line, idx) => ({
      lineKey: `${String(getFirstDefined(line.id, line.item_id, line.product, 'line')).trim() || 'line'}-${idx}`,
      id: getFirstDefined(line.id, line.item_id, idx + 1),
      productId: getFirstDefined(line.product, line.product_id, null),
      sr: idx + 1,
      selected: false,
      sku: String(
        getFirstDefined(
          line.sku,
          line.barcode,
          line.upc,
          productsById.get(String(getFirstDefined(line.product, line.product_id, '')))?.sku,
          '-'
        )
      ),
      description: String(
        getFirstDefined(
          line.item_name,
          line.description,
          productsById.get(String(getFirstDefined(line.product, line.product_id, '')))?.description,
          'N/A'
        )
      ),
      sizePack: String(
        getFirstDefined(
          line.size_pack,
          line.sizePack,
          line.size,
          productsById.get(String(getFirstDefined(line.product, line.product_id, '')))?.sizePack,
          '-'
        )
      ),
      unitCost: Number(getFirstDefined(line.unit_price, line.unit_cost, line.cost, 0)) || 0,
      qtyReceived: Number(getFirstDefined(line.quantity_received, line.qty, line.quantity, 0)) || 0,
      qtyReturn: Number(getFirstDefined(line.quantity_received, line.qty, line.quantity, 0)) || 0,
      landingCost: Number(getFirstDefined(line.landing_cost, line.unit_price, line.unit_cost, line.cost, 0)) || 0,
      amount:
        Number(getFirstDefined(line.amount, line.total_amount, null)) ||
        (Number(getFirstDefined(line.unit_price, line.unit_cost, line.cost, 0)) || 0) *
          (Number(getFirstDefined(line.quantity_received, line.qty, line.quantity, 0)) || 0)
    }))
  }

  const applySelectedBill = (bill) => {
    if (!bill) {
      resetPurchaseReturnForm()
      return
    }

    const vendorId = String(getFirstDefined(bill?.vendor?.id, bill?.vendor_id, bill?.vendor, '')).trim()
    const vendorFromPeople = vendorsById.get(vendorId)
    const vendorContactValue = String(
      getFirstDefined(
        vendorFromPeople?.contact,
        bill?.vendor?.contact_name,
        bill?.vendor?.contact_person,
        bill?.vendor?.phone,
        bill?.vendor?.email,
        ''
      )
    ).trim()

    setSelectedVendorId(vendorId)
    setVendorContact(vendorContactValue)
    setSelectedBillId(getBillValue(bill))
    setBillInternalId(String(getFirstDefined(bill.id, bill.bill_id, '') || ''))
    setReturnBillNumber(String(getFirstDefined(bill.invoice_number, bill.bill_number, bill.bill_no, bill.id, '') || ''))
    setBillDate(String(getFirstDefined(bill.bill_date, bill.date, bill.created_at, '') || ''))
    setDueDate(String(getFirstDefined(bill.due_date, '') || ''))
    setItems(mapBillItems(bill))
  }

  const selectVendorFromModal = (vendor) => {
    const nextVendorId = String(vendor?.id || '').trim()
    setSelectedVendorId(nextVendorId)
    setVendorContact(vendor?.contact || '')
    setSelectedBillId('')
    setBillInternalId('')
    setReturnBillNumber('')
    setItems([])
    setIsVendorModalOpen(false)
    setVendorSearch('')
  }

  const handleBillChange = (event) => {
    const nextBillId = event.target.value
    const selectedBill = filteredBills.find((bill) => String(getFirstDefined(bill.id, bill.bill_id, bill.invoice_number, '')) === nextBillId)
    applySelectedBill(selectedBill)
    setInvoiceSearchMessage(selectedBill ? 'Bill loaded successfully.' : 'Selected bill not found.')
  }

  const handleInvoiceSearch = () => {
    const query = toSearchValue(invoiceSearchValue)
    if (!query) {
      setInvoiceSearchMessage('Please enter invoice number or bill id.')
      return
    }

    const exactMatch = purchaseBills.find((bill) => {
      const candidates = [
        bill?.invoice_number,
        bill?.bill_number,
        bill?.bill_no,
        bill?.id,
        bill?.bill_id
      ]
      return candidates.some((value) => toSearchValue(value) === query)
    })

    const partialMatch = purchaseBills.find((bill) => {
      const combined = [
        bill?.invoice_number,
        bill?.bill_number,
        bill?.bill_no,
        bill?.id,
        bill?.bill_id,
        bill?.vendor_name,
        bill?.vendor?.vendor_name,
        bill?.vendor?.company_name,
        bill?.vendor?.name
      ]
      return combined.some((value) => toSearchValue(value).includes(query))
    })

    const matchedBill = exactMatch || partialMatch
    if (!matchedBill) {
      setInvoiceSearchMessage('No matching purchase bill found.')
      return
    }

    applySelectedBill(matchedBill)
    setInvoiceSearchMessage('Matching bill found and loaded.')
  }

  const handleSave = async () => {
    const payloadItems = items

    if (payloadItems.length === 0) {
      return
    }

    const roundedOtherCharges = roundToTwo(otherCharges)
    const roundedSubTotal = roundToTwo(subTotal)
    const roundedTotalPayable = roundToTwo(roundedSubTotal + roundedOtherCharges)

    const payload = {
      vendor_id: selectedVendorId || 1,
      bill_id: billInternalId || selectedBillId || null,
      return_bill_number: returnBillNumber || null,
      return_date: returnDate,
      bill_date: billDate || null,
      due_date: dueDate || null,
      paid_status: paidStatus,
      note,
      other_charges: toFixedTwoString(roundedOtherCharges),
      total_returns: totalReturns,
      sub_total: toFixedTwoString(roundedSubTotal),
      total_payable: toFixedTwoString(roundedTotalPayable),
      items: payloadItems.map((item) => ({
        product_id: item.productId ?? item.id,
        quantity_received: item.qtyReceived,
        quantity_returned: Number(item.qtyReturn) || 0,
        unit_price: toFixedTwoString(item.unitCost),
        landing_cost: toFixedTwoString(item.landingCost)
      }))
    }

    try {
      await post('/purchasing/returns/', payload)
      navigate('/pos/purchase-return')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      {(apiError || billsError || vendorsError || productsError) && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold">
          {apiError || billsError || vendorsError || productsError}
        </div>
      )}
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-black text-slate-800 tracking-tight">Create Purchase Return</h2>
        </div>

        <Card noPadding className="border-slate-200 shadow-sm !rounded-lg overflow-visible bg-white p-6 lg:p-8">
          <div className="space-y-6">
            {/* Grid Form Section */}
            <div className="space-y-6">
              {/* Row 1: Search Inv, Select Vendor, Select Bill, ID */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 ml-0.5">Search Inv *</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Search..."
                      value={invoiceSearchValue}
                      onChange={(e) => setInvoiceSearchValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleInvoiceSearch()
                        }
                      }}
                      className="flex-1 h-[42px] px-4 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={handleInvoiceSearch}
                      className="w-[42px] h-[42px] flex-shrink-0 rounded-lg bg-[#0EA5E9] text-white flex items-center justify-center hover:bg-[#0284C7] transition-all active:scale-95 shadow-lg shadow-sky-500/20"
                      title="Search"
                    >
                      <Search size={18} />
                    </button>
                  </div>
                  {invoiceSearchMessage && (
                    <p className="text-[11px] font-bold text-slate-500 ml-0.5">{invoiceSearchMessage}</p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 ml-0.5">Select Vendor</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsVendorModalOpen(true)}
                      className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all cursor-pointer flex items-center justify-between"
                    >
                      <span className={`truncate ${selectedVendorLabel ? 'text-slate-700' : 'text-slate-400'}`}>
                        {selectedVendorLabel || (billsLoading ? 'Loading...' : 'Select Vendor')}
                      </span>
                      <ChevronDown className="text-slate-400 flex-shrink-0" size={18} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 ml-0.5">Select Bill</label>
                  <StyledDropdown
                    value={selectedBillId}
                    onChange={handleBillChange}
                    disabled={!selectedVendorId}
                    triggerClassName="!h-[42px] border-slate-200 !text-slate-700 !font-bold"
                    placeholder="Select Bill"
                  >
                    {filteredBills.map((bill, index) => {
                      const optionValue = getBillValue(bill, index)
                      const optionLabel = getFirstDefined(
                        bill.invoice_number,
                        bill.bill_number,
                        bill.bill_no,
                        bill.id,
                        `Bill ${index + 1}`
                      )
                      return (
                        <option key={optionValue} value={optionValue}>
                          {optionLabel}
                        </option>
                      )
                    })}
                  </StyledDropdown>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 ml-0.5">ID</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={selectedVendorId}
                    className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-[#f8fafc] text-[14px] font-bold text-slate-400 outline-none"
                  />
                </div>
              </div>

              {/* Row 2: Vendor Contact, Bill ID, Return Bill, Return Date, Bill Date */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 ml-0.5">Vendor Contact</label>
                  <input 
                    type="text" 
                    readOnly
                    value={vendorContact}
                    className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-[#f8fafc] text-[14px] font-bold text-slate-400 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 ml-0.5">Bill ID</label>
                  <input 
                    type="text" 
                    readOnly
                    value={billInternalId}
                    className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-[#f8fafc] text-[14px] font-bold text-slate-400 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 ml-0.5">Return Bill *</label>
                  <input 
                    type="text" 
                    readOnly
                    value={returnBillNumber}
                    className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-[#f8fafc] text-[14px] font-bold text-slate-400 outline-none"
                  />
                </div>
                <DatePickerField 
                  label="Return Date"
                  value={returnDate}
                  onChange={setReturnDate}
                />
                <DatePickerField 
                  label="Bill Date"
                  value={billDate}
                  onChange={setBillDate}
                />
              </div>

              {/* Row 3: Due Date, Paid Status, Note */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <DatePickerField 
                  label="Due Date"
                  value={dueDate}
                  onChange={setDueDate}
                />
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-400 ml-0.5">Paid Status</label>
                  <StyledDropdown
                    value={paidStatus}
                    onChange={(e) => setPaidStatus(e.target.value)}
                    triggerClassName="!h-[42px] border-slate-200 !text-slate-700 !font-bold"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Unpaid">Unpaid</option>
                  </StyledDropdown>
                </div>
                <div className="lg:col-span-2 flex flex-col gap-1.5">
                   <label className="text-[12px] font-bold text-slate-400 ml-0.5">Note</label>
                   <textarea
                     value={note}
                     onChange={(e) => setNote(e.target.value)}
                     className="w-full h-[42px] px-4 py-2 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all resize-none shadow-sm"
                   ></textarea>
                </div>
              </div>
            </div>


          </div>
        </Card>

        {/* Table Section */}
        <Card noPadding className="border-slate-200 shadow-sm !rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto scrollbar-hide">
             <table className="w-full text-left border-collapse table-auto">
                <thead className="bg-[#f9fafb] border-b border-slate-200">
                   <tr>
                      <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">SR #</th>
                      <th className="px-4 py-4 w-12 text-center">
                         <button
                           type="button"
                           onClick={toggleSelectAll}
                           aria-label={allItemsSelected ? 'Deselect all items' : 'Select all items'}
                           aria-checked={someItemsSelected ? 'mixed' : allItemsSelected}
                           className={`w-4 h-4 rounded border-2 m-auto flex items-center justify-center transition-all ${
                             allItemsSelected
                               ? 'border-sky-500 bg-sky-500'
                               : someItemsSelected
                                 ? 'border-sky-500 bg-white'
                                 : 'border-slate-300 bg-white'
                           }`}
                         >
                            {allItemsSelected ? (
                              <CheckCircle2 size={12} className="text-white" />
                            ) : someItemsSelected ? (
                              <span className="block h-[2px] w-2 rounded-full bg-sky-500" />
                            ) : null}
                         </button>
                      </th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">SKU</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Item Description</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Size/Pack</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Unit Cost</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Qty. Received</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Qty. Return</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Landing Cost</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {items.map((item) => {
                     const rowAmount = item.unitCost * (Number(item.qtyReturn) || 0)
                     return (
                     <tr 
                       key={item.lineKey} 
                       className="group hover:bg-slate-50 transition-colors"
                     >
                        <td className="px-4 py-4 text-[13px] font-bold text-slate-400 text-center">{item.sr}</td>
                        <td className="px-4 py-4 text-center">
                           <div 
                             onClick={() => toggleSelect(item.lineKey)}
                             className={`w-4 h-4 rounded border-2 m-auto flex items-center justify-center cursor-pointer transition-all ${
                               item.selected ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white'
                             }`}
                           >
                              {item.selected && <CheckCircle2 size={12} className="text-white" />}
                           </div>
                        </td>
                        <td className="px-3 py-4 text-[13px] font-bold text-slate-600">{item.sku}</td>
                        <td className="px-3 py-4 text-[13px] font-black text-slate-800 uppercase tracking-tight">{item.description}</td>
                        <td className="px-3 py-4 text-[13px] font-bold text-slate-500">{item.sizePack}</td>
                        <td className="px-3 py-4 text-[14px] font-black text-slate-800 text-right">{item.unitCost.toFixed(2)}</td>
                        <td className="px-3 py-4 text-[14px] font-black text-slate-800 text-center">{item.qtyReceived.toFixed(2)}</td>
                        <td className="px-3 py-4 text-center">
                           <input 
                             type="text" 
                             className="w-[80px] h-[34px] rounded border border-yellow-200 bg-yellow-50 text-center text-[13px] font-black text-slate-800 outline-none focus:border-yellow-400 transition-all"
                             value={Number(item.qtyReturn || 0).toFixed(2)}
                             onChange={(e) => handleReturnChange(item.lineKey, e.target.value)}
                           />
                        </td>
                        <td className="px-3 py-4 text-[14px] font-black text-slate-800 text-right">{item.landingCost.toFixed(2)}</td>
                        <td className="px-3 py-4 text-[14px] font-black text-slate-800 text-right">{rowAmount.toFixed(2)}</td>
                     </tr>
                   )})}
                </tbody>
             </table>
          </div>
        </Card>

        {/* Action Buttons & Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
           {/* Left side actions */}
           <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handleRemoveSelected}
                disabled={selectedItemsCount === 0}
                className={`h-[40px] px-5 rounded-[16px] border bg-white text-[12px] font-black uppercase tracking-[0.24em] flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
                  selectedItemsCount > 0
                    ? 'border-rose-200 text-[#E11D48] hover:bg-rose-50'
                    : 'border-rose-100 text-[#FDA4AF]'
                }`}
              >
                 <Trash2 size={15} strokeWidth={2.2} />
                 Remove
              </button>
              <button
                type="button"
                onClick={handleRemoveAll}
                disabled={items.length === 0}
                className={`h-[40px] px-5 rounded-[16px] border bg-white text-[12px] font-black uppercase tracking-[0.24em] flex items-center gap-2 transition-all active:scale-95 shadow-sm ${
                  items.length > 0
                    ? 'border-rose-200 text-[#E11D48] hover:bg-rose-50'
                    : 'border-rose-100 text-[#FDA4AF]'
                }`}
              >
                 <Trash2 size={15} strokeWidth={2.2} />
                 Remove All
              </button>
              <button 
                onClick={openCalculator}
                className="h-[44px] px-6 rounded-lg border-2 border-slate-200 bg-white text-slate-600 text-[12px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-all active:scale-95 shadow-sm">
                 <Calculator size={18} />
                 Calculator
              </button>
           </div>

           {/* Right side summary */}
           <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="flex justify-between items-center">
                 <span className="text-[14px] font-bold text-slate-500">Total Returns:</span>
                 <div className="w-[120px] h-[42px] px-4 rounded-lg bg-[#f8fafc] flex items-center justify-end text-[16px] font-black text-slate-800 bg-slate-50 border border-slate-100 italic">
                    {totalReturns}
                 </div>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[14px] font-bold text-slate-500">Sub Total:</span>
                 <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-lg font-black italic">$</span>
                    <div className="w-[160px] h-[42px] px-4 rounded-lg bg-[#f8fafc] flex items-center justify-end text-[16px] font-black text-slate-800 bg-slate-50 border border-slate-100 italic">
                       {subTotal.toFixed(2)}
                    </div>
                 </div>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[14px] font-bold text-slate-500">Other Charges:</span>
                 <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-lg font-black italic">$</span>
                    <input 
                      type="text" 
                      className="w-[160px] h-[42px] px-4 rounded-lg border border-slate-200 bg-white text-right text-[16px] font-black text-slate-800 outline-none focus:border-sky-500 transition-all shadow-inner italic"
                      value={otherCharges.toFixed(2)}
                      onChange={(e) => setOtherCharges(Number(e.target.value) || 0)}
                    />
                 </div>
              </div>

              <div className="bg-[#E0F2FE] border border-sky-100 rounded-lg px-8 py-5 flex justify-between items-center shadow-sm -mx-2">
                 <h3 className="text-[16px] font-black text-[#0EA5E9] uppercase tracking-wider">Total Payable:</h3>
                 <div className="flex items-center gap-4">
                    <span className="text-sky-400 text-2xl font-black italic">$</span>
                    <span className="text-3xl font-black text-[#0EA5E9] tracking-tight">
                       {(subTotal + otherCharges).toFixed(2)}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end items-center gap-4 pt-4">
           <button 
             onClick={handleSave}
             disabled={loading}
             className="h-[48px] px-12 rounded-lg bg-[#0EA5E9] text-white text-[14px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0284C7] transition-all active:scale-95 shadow-xl shadow-sky-500/20 disabled:opacity-50"
           >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save'}
           </button>
           <button 
             onClick={() => navigate('/pos/purchase-return')}
             className="h-[48px] px-12 rounded-lg bg-[#334155] text-white text-[14px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#1e293b] transition-all active:scale-95 shadow-lg shadow-slate-500/10"
           >
              <X size={20} />
              Close
           </button>
        </div>

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
                    No vendor found from purchase bills.
                  </div>
                ) : (
                  filteredVendorOptions.map((vendor) => (
                    <button
                      key={vendor.id}
                      type="button"
                      onClick={() => selectVendorFromModal(vendor)}
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

      </div>
  )
}

export default CreatePurchaseReturn
