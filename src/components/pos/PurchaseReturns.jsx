import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Filter, 
  Search, 
  Download, 
  RefreshCcw, 
  Plus, 
  Pencil,
  Trash2,
  ChevronDown,
  Check
} from 'lucide-react'
import Loader from '../common/Loader'
import Card from '../common/Card'
import useFetch from '../../hooks/useFetch'

const getFirstDefined = (...values) => values.find((value) => value !== undefined && value !== null && value !== '')
const toDateValue = (value) => {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const formatDate = (value) => {
  const date = toDateValue(value)
  if (!date) return 'N/A'
  return date.toLocaleDateString('en-US')
}

const formatAmount = (value) => {
  const amount = Number(value)
  return `$${Number.isFinite(amount) ? amount.toFixed(2) : '0.00'}`
}

const FILTER_BY_OPTIONS = ['SKU/UPC', 'Product Code', 'Vendor', 'Date Range', 'Status']

const PurchaseReturns = () => {
  const navigate = useNavigate()
  const [filterPeriod, setFilterPeriod] = useState('Last Month')
  const [filterBy, setFilterBy] = useState('Vendor')
  const [filterValue, setFilterValue] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isFilterByOpen, setIsFilterByOpen] = useState(false)
  const filterByRef = useRef(null)

  const { data: responseData, loading, error, refetch } = useFetch('/purchasing/returns/')
  const { data: vendorsData } = useFetch('/people/vendors/')

  const purchaseReturns = React.useMemo(() => {
    if (Array.isArray(responseData)) return responseData
    if (Array.isArray(responseData?.results)) return responseData.results
    if (Array.isArray(responseData?.data?.results)) return responseData.data.results
    if (Array.isArray(responseData?.data)) return responseData.data
    return []
  }, [responseData])

  const mappedReturns = React.useMemo(() => {
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
      const id = String(getFirstDefined(vendor?.id, vendor?.vendor_id, '')).trim()
      const name = getFirstDefined(vendor?.vendor_name, vendor?.company_name, vendor?.name, vendor?.vendor_code)
      if (id && name) acc[id] = name
      return acc
    }, {})

    return purchaseReturns.map((ret, index) => {
      const vendorId = String(getFirstDefined(ret?.vendor?.id, ret?.vendor_id, ret?.vendor, '')).trim()
      const vendorName = getFirstDefined(
        ret?.vendor?.vendor_name,
        ret?.vendor?.company_name,
        ret?.vendor?.name,
        ret?.vendor_name,
        vendorLookup[vendorId],
        typeof ret?.vendor === 'string' ? ret.vendor : null
      )
      const totalAmount = getFirstDefined(
        ret?.total_payable,
        ret?.sub_total,
        ret?.total_amount,
        ret?.grand_total,
        ret?.net_total
      )
      const paidStatus = getFirstDefined(ret?.paid_status, ret?.payment_status, ret?.status_label, 'Open')

      return {
        key: getFirstDefined(ret?.id, ret?.uuid, ret?.return_bill_number, index),
        billNo: getFirstDefined(ret?.return_bill_number, ret?.return_number, ret?.bill_id, `RET-${ret?.id ?? index + 1}`),
        date: formatDate(getFirstDefined(ret?.return_date, ret?.created_at)),
        vendor: vendorName || 'N/A',
        status: getFirstDefined(ret?.status, 'Committed'),
        total: formatAmount(totalAmount),
        dueDate: formatDate(getFirstDefined(ret?.due_date, ret?.payment_due_date)),
        paidStatus
      }
    })
  }, [purchaseReturns, vendorsData])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!filterByRef.current?.contains(event.target)) {
        setIsFilterByOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsFilterByOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  return (
    <div className="space-y-6">
      
      {/* Filter Criteria Section */}
      <Card noPadding className="border-slate-200 shadow-sm overflow-visible">
        <div className="p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-8">
           {/* Left side: Title + Radios */}
           <div className="flex flex-col gap-4 min-w-fit">
              <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">Filter Criteria</h3>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                {['Last Month', 'Last 3 Months', 'Last 6 Months', 'All'].map((period) => (
                  <label key={period} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      filterPeriod === period ? 'border-[#0EA5E9] bg-white' : 'border-slate-300 group-hover:border-slate-400'
                    }`}>
                      {filterPeriod === period && <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />}
                    </div>
                    <input type="radio" className="hidden" name="period" checked={filterPeriod === period} onChange={() => setFilterPeriod(period)} />
                    <span className={`text-[13px] font-bold transition-colors ${
                      filterPeriod === period ? 'text-slate-900' : 'text-slate-400 group-hover:text-slate-600'
                    }`}>{period}</span>
                  </label>
                ))}
              </div>
           </div>

           {/* Right side: Filters */}
           <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 flex-1 xl:max-w-3xl items-end">
               <div className="sm:col-span-4 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter By</label>
                  <div ref={filterByRef} className="relative">
                     <button
                       type="button"
                       onClick={() => setIsFilterByOpen((current) => !current)}
                       className={`w-full h-11 px-4 rounded-xl border text-[14px] font-bold outline-none transition-all shadow-inner flex items-center justify-between ${
                         isFilterByOpen
                           ? 'border-sky-500 bg-white ring-4 ring-sky-500/10'
                           : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300'
                       }`}
                     >
                       <span className="truncate">{filterBy}</span>
                       <ChevronDown
                         className={`text-slate-400 transition-transform ${isFilterByOpen ? 'rotate-180' : ''}`}
                         size={16}
                       />
                     </button>

                     {isFilterByOpen && (
                       <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
                         <div className="py-2">
                           {FILTER_BY_OPTIONS.map((option) => {
                             const isActive = option === filterBy
                             return (
                               <button
                                 key={option}
                                 type="button"
                                 onClick={() => {
                                   setFilterBy(option)
                                   setIsFilterByOpen(false)
                                 }}
                                 className={`flex w-full items-center justify-between px-4 py-3 text-left text-[14px] font-bold transition-all ${
                                   isActive
                                     ? 'bg-sky-50 text-sky-600'
                                     : 'text-slate-700 hover:bg-slate-50'
                                 }`}
                               >
                                 <span>{option}</span>
                                 {isActive && <Check size={16} className="text-sky-500" />}
                               </button>
                             )
                           })}
                         </div>
                       </div>
                     )}
                  </div>
               </div>
               <div className="sm:col-span-5 flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter Value</label>
                  <input 
                    type="text" 
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                    placeholder={`Enter ${filterBy.toLowerCase()}`}
                  />
               </div>
              <div className="sm:col-span-3">
                 <button className="w-full h-11 rounded-xl bg-white border-2 border-[#0EA5E9] text-[#0EA5E9] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-sky-50 transition-all shadow-sm active:scale-95">
                    <Filter size={16} />
                    Filter
                 </button>
              </div>
           </div>
        </div>
      </Card>

      {/* Search & Actions Bar */}
      <Card noPadding className="border-slate-200 shadow-sm overflow-visible">
         <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            {/* Left side: Search */}
            <div className="flex flex-col gap-4 flex-1 max-w-2xl">
               <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins">Search Criteria</h3>
               <div className="flex gap-3">
                  <div className="relative flex-1">
                     <input 
                       type="text" 
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                       className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                       placeholder=""
                     />
                  </div>
                  <button className="h-11 px-8 rounded-xl border-2 border-[#0EA5E9]/30 text-[#0EA5E9] text-xs font-black uppercase tracking-widest flex items-center gap-2 hover:bg-sky-50 transition-all active:scale-95">
                     <Search size={16} />
                     Search
                  </button>
               </div>
            </div>

            {/* Right side: Actions */}
            <div className="flex items-center gap-3 flex-wrap justify-end lg:pt-8">
               <button className="h-10 px-5 rounded-xl bg-slate-100/50 text-slate-500 text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 border border-slate-200">
                  Export To CSV
               </button>
               <button
                 type="button"
                 onClick={refetch}
                 className="h-10 px-5 rounded-xl bg-slate-100/50 text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200"
               >
                  <RefreshCcw size={16} />
                  Refresh
               </button>
               <div className="hidden sm:block h-8 w-px bg-slate-200 mx-1" />
               <button 
                 onClick={() => navigate('/pos/purchase-return/create')}
                 className="h-10 px-6 rounded-xl bg-[#10B981] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition-all active:scale-95"
               >
                  <Plus size={16} />
                  Add
               </button>
               <button className="h-10 px-6 rounded-xl bg-[#F43F5E] text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-all active:scale-95">
                  <Trash2 size={16} />
                  Delete
               </button>
            </div>
         </div>
      </Card>

      {/* Table Section */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
         <div className="overflow-x-auto scrollbar-hide flex-1">
            <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Bill #</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Bill Date</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Vendor</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Status</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Total Amt.</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Due Date</th>
                     <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Paid Status</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-10">
                        <div className="flex flex-col items-center justify-center">
                          <Loader size={48} className="mx-auto" />
                          <p className="mt-2 text-[#64748B] font-medium tracking-tight">Loading purchase returns...</p>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-10">
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-center font-bold">
                          {error}
                        </div>
                      </td>
                    </tr>
                  ) : mappedReturns.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-8 py-16 text-center">
                        <p className="text-slate-500 font-bold">No purchase returns found.</p>
                      </td>
                    </tr>
                  ) : (
                    mappedReturns.map((record) => (
                      <tr 
                        key={record.key} 
                        className="hover:bg-sky-50/30 transition-colors group cursor-pointer"
                      >
                         <td className="px-8 py-5 text-sm font-black text-sky-500 hover:underline tracking-tight">
                            {record.billNo}
                         </td>
                         <td className="px-8 py-5 text-sm font-bold text-slate-500">{record.date}</td>
                         <td className="px-8 py-5 text-sm font-black text-slate-700">
                            {record.vendor}
                         </td>
                         <td className="px-8 py-5 text-sm font-bold text-slate-400">{record.status}</td>
                         <td className="px-8 py-5 text-sm font-black text-slate-700 text-right">{record.total}</td>
                         <td className="px-8 py-5 text-sm font-bold text-slate-400">{record.dueDate}</td>
                         <td className="px-8 py-5">
                            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-rose-50 text-rose-500 border border-rose-100">
                              {record.paidStatus}
                            </span>
                         </td>
                      </tr>
                    ))
                  )}
               </tbody>
            </table>
         </div>

         <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
               Total Purchase Returns : {mappedReturns.length}
            </span>
         </div>
      </div>
    </div>
  )
}

export default PurchaseReturns
