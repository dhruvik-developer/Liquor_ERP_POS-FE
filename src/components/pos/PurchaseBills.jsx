import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Search, RefreshCcw, Plus, Trash2, ChevronDown } from 'lucide-react'
import Loader from '../common/Loader'
import Card from '../common/Card'
import useFetch from '../../hooks/useFetch'

const PERIOD_DAYS = {
  'Last Month': 30,
  'Last 3 Months': 90,
  'Last 6 Months': 180
}

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')

const toDateValue = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDateTime = (value) => {
  const date = toDateValue(value)
  if (!date) return 'N/A'
  return date.toLocaleString('en-US')
}

const formatAmount = (value) => {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
}

const PurchaseBills = () => {
  const [filterPeriod, setFilterPeriod] = useState('Last Month')
  const [filterBy, setFilterBy] = useState('Vendor')
  const [filterValue, setFilterValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRow, setSelectedRow] = useState(null)

  const { data: responseData, loading, error, refetch } = useFetch('/purchasing/bills/')
  const { data: vendorsData } = useFetch('/people/vendors/')

  const { purchaseBills, totalBills } = React.useMemo(() => {
    if (Array.isArray(responseData)) {
      return { purchaseBills: responseData, totalBills: responseData.length }
    }

    if (Array.isArray(responseData?.results)) {
      return {
        purchaseBills: responseData.results,
        totalBills: Number(responseData.count) || responseData.results.length
      }
    }

    if (Array.isArray(responseData?.data?.results)) {
      return {
        purchaseBills: responseData.data.results,
        totalBills: Number(responseData.data.count) || responseData.data.results.length
      }
    }

    if (Array.isArray(responseData?.data)) {
      return {
        purchaseBills: responseData.data,
        totalBills: responseData.data.length
      }
    }

    return { purchaseBills: [], totalBills: 0 }
  }, [responseData])

  const mappedBills = React.useMemo(() => {
    const vendorList = Array.isArray(vendorsData)
      ? vendorsData
      : Array.isArray(vendorsData?.results)
      ? vendorsData.results
      : Array.isArray(vendorsData?.data?.results)
      ? vendorsData.data.results
      : Array.isArray(vendorsData?.data)
      ? vendorsData.data
      : []

    const vendorLookup = vendorList.reduce((acc, vendor) => {
      const id = String(getFirstDefined(vendor.id, vendor.vendor_id, '')).trim()
      const name = getFirstDefined(vendor.vendor_name, vendor.company_name, vendor.name, vendor.vendor_code)
      if (id && name) acc[id] = name
      return acc
    }, {})

    return purchaseBills.map((bill, index) => {
      const billNumber = getFirstDefined(
        bill.bill_number,
        bill.bill_no,
        bill.invoice_number,
        bill.number,
        bill.reference_number,
        bill.id
      )
      const billDateRaw = getFirstDefined(bill.bill_date, bill.bill_datetime, bill.date, bill.created_at)
      const dueDateRaw = getFirstDefined(bill.due_date, bill.due_datetime, bill.payment_due_date)
      const billVendorId = String(getFirstDefined(bill.vendor?.id, bill.vendor_id, bill.vendor, '')).trim()
      const vendorName = getFirstDefined(
        bill.vendor?.vendor_name,
        bill.vendor?.company_name,
        bill.vendor?.name,
        bill.vendor_name,
        vendorLookup[billVendorId],
        bill.vendor
      )
      const totalAmount = getFirstDefined(
        bill.total_amount,
        bill.total,
        bill.amount_total,
        bill.grand_total,
        bill.net_total
      )

      return {
        key: getFirstDefined(bill.id, bill.uuid, billNumber, index),
        id: billNumber || `BILL-${index + 1}`,
        dateRaw: billDateRaw,
        date: formatDateTime(billDateRaw),
        vendor: vendorName || 'N/A',
        total: formatAmount(totalAmount),
        dueDate: formatDateTime(dueDateRaw),
        note: getFirstDefined(bill.note, bill.notes, '')
      }
    })
  }, [purchaseBills, vendorsData])

  const displayedBills = React.useMemo(() => {
    return mappedBills.filter((bill) => {
      const date = toDateValue(bill.dateRaw)
      if (filterPeriod !== 'All') {
        const days = PERIOD_DAYS[filterPeriod]
        if (days && date) {
          const diffDays = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
          if (diffDays > days) return false
        }
      }

      const normalizedFilterValue = filterValue.trim().toLowerCase()
      if (normalizedFilterValue) {
        const filterTarget = (
          filterBy === 'Bill #'
            ? bill.id
            : bill.vendor
        )
          .toString()
          .toLowerCase()
        if (!filterTarget.includes(normalizedFilterValue)) return false
      }

      const normalizedSearch = searchQuery.trim().toLowerCase()
      if (!normalizedSearch) return true

      const combinedSearch = [bill.id, bill.vendor, bill.note, bill.total, bill.date, bill.dueDate]
        .join(' ')
        .toLowerCase()
      return combinedSearch.includes(normalizedSearch)
    })
  }, [mappedBills, filterPeriod, filterBy, filterValue, searchQuery])

  return (
    <div className="space-y-6">
      
      {/* Filter Criteria Section */}
      <Card className="!p-4 bg-white shadow-sm border border-slate-200">
        <div className="flex items-center gap-8">
          {/* Radio Group */}
          <div className="flex flex-col gap-1.5 min-w-max">
            <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">Filter Criteria</h3>
            <div className="flex items-center gap-5">
              {['Last Month', 'Last 3 Months', 'Last 6 Months', 'All'].map((period) => (
                <label key={period} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    filterPeriod === period ? 'border-sky-500' : 'border-slate-200 group-hover:border-slate-300'
                  }`}>
                    {filterPeriod === period && <div className="w-2 h-2 rounded-full bg-sky-500" />}
                  </div>
                  <input type="radio" className="hidden" name="period" checked={filterPeriod === period} onChange={() => setFilterPeriod(period)} />
                  <span className={`text-[13px] font-bold transition-colors ${
                    filterPeriod === period ? 'text-slate-800' : 'text-slate-500 group-hover:text-slate-800'
                  }`}>{period}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="h-10 w-px bg-slate-100 mx-2" />

          {/* Filter By Dropdown */}
          <div className="flex flex-col gap-1.5 w-48">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter By</label>
             <div className="relative">
                <select 
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 appearance-none cursor-pointer"
                >
                  <option>Vendor</option>
                  <option>Bill #</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
             </div>
          </div>

          {/* Filter Value */}
          <div className="flex flex-col gap-1.5 flex-1">
             <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter Value</label>
             <input
               type="text"
               value={filterValue}
               onChange={(e) => setFilterValue(e.target.value)}
               placeholder="Search Value"
               className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-inner"
             />
          </div>

          <div className="pt-6">
            <button className="h-11 px-6 rounded-xl border border-sky-400 bg-white text-sky-500 flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-sm hover:bg-sky-50 transition-all active:scale-95">
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>
      </Card>

      {/* Search & Actions Bar */}
      <Card className="!p-4 bg-white shadow-sm border border-slate-200">
        <div className="flex items-center justify-between gap-4">
           <div className="flex flex-col gap-1.5 flex-1 max-w-xl">
               <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">Search Criteria</h3>
              <div className="flex gap-2">
                 <input
                   type="text"
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="flex-1 h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-inner"
                 />
                 <button className="h-11 px-6 rounded-xl border border-sky-400 bg-white text-sky-500 flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-sm hover:bg-sky-50 transition-all active:scale-95">
                    <Search size={16} />
                    Search
                 </button>
              </div>
           </div>

           <div className="flex items-center gap-3 pt-4">
              <button className="h-11 px-6 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all shadow-sm active:scale-95">
                 Export To CSV
              </button>
              <button
                onClick={refetch}
                className="h-11 px-6 rounded-xl bg-slate-100 text-slate-600 text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all shadow-sm active:scale-95"
              >
                 <RefreshCcw size={16} />
                 Refresh
              </button>
              <Link to="/pos/purchase-bills/create">
                <button className="h-11 px-6 rounded-xl bg-emerald-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95">
                  <Plus size={18} />
                  Add
                </button>
              </Link>
              <button className="h-11 px-6 rounded-xl bg-rose-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95">
                 <Trash2 size={18} />
                 Delete
              </button>
           </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="overflow-auto flex-1 scrollbar-hide">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill #</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Vendor</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Amt.</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Due Date</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-5 py-8 text-center text-[#64748B]">
                    <Loader size={48} className="mx-auto" />
                    <p className="mt-2 font-medium">Loading bills...</p>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="6" className="px-8 py-10">
                    <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-center font-bold">
                      {error}
                    </div>
                  </td>
                </tr>
              ) : displayedBills.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center">
                    <p className="text-slate-500 font-bold">No purchase bills found.</p>
                  </td>
                </tr>
              ) : (
                displayedBills.map((bill, index) => {
                  const isSelected = selectedRow === index
                  return (
                    <tr 
                      key={bill.key}
                      onClick={() => setSelectedRow(index)}
                      className={`hover:bg-sky-50 transition-colors cursor-pointer ${
                        index % 2 !== 0 ? 'bg-slate-50/30' : ''
                      } ${isSelected ? 'shadow-[inset_4px_0_0_#0EA5E9] bg-sky-50/50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-sky-500 hover:underline">{bill.id}</span>
                      </td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-600">{bill.date}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-sky-500 hover:underline">{bill.vendor}</span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-slate-700">{bill.total}</td>
                      <td className="px-6 py-4 text-xs font-bold text-slate-500">{bill.dueDate}</td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-400">{bill.note}</td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-white border-t border-slate-100">
          <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
             Total Purchase Bills : {totalBills || displayedBills.length}
          </span>
        </div>
      </div>
    </div>
  )
}

export default PurchaseBills
