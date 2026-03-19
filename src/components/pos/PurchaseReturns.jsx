import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Filter, 
  Search, 
  Download, 
  RefreshCcw, 
  Plus, 
  Trash2,
  ChevronDown
} from 'lucide-react'
import Card from '../common/Card'

const PurchaseReturns = () => {
  const navigate = useNavigate()
  const [filterPeriod, setFilterPeriod] = useState('Last Month')
  const [searchQuery, setSearchQuery] = useState('')

  const returnsData = [
    { billNo: '3776357', date: '11/11/2025 12:42', vendor: 'Peerless', status: 'Committed', total: '$24.60', dueDate: '', paidStatus: 'Open' },
    { billNo: '0170053', date: '11/05/2025 01:00', vendor: 'High Grade', status: 'Committed', total: '$270.24', dueDate: '', paidStatus: 'Open' },
    { billNo: '3772057', date: '11/04/2025 01:42', vendor: 'Peerless', status: 'Committed', total: '$46.98', dueDate: '', paidStatus: 'Open' },
    { billNo: '3769358', date: '10/28/2025 11:30', vendor: 'Peerless', status: 'Committed', total: '$74.40', dueDate: '', paidStatus: 'Open' },
    { billNo: '3765328', date: '10/21/2025 12:31', vendor: 'Peerless', status: 'Committed', total: '$61.36', dueDate: '', paidStatus: 'Open' },
    { billNo: '0160259', date: '10/15/2025 02:01', vendor: 'High Grade', status: 'Committed', total: '$66.40', dueDate: '', paidStatus: 'Open' },
    { billNo: '3762016', date: '10/14/2025 11:35', vendor: 'Peerless', status: 'Committed', total: '$131.50', dueDate: '', paidStatus: 'Open' },
  ]

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
                 <div className="relative group">
                    <select className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 focus:bg-white transition-all shadow-inner">
                      <option>Vendor</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                 </div>
              </div>
              <div className="sm:col-span-5 flex flex-col gap-1.5">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Filter Value</label>
                 <input 
                   type="text" 
                   className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                   placeholder=""
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
               <button className="h-10 px-5 rounded-xl bg-slate-100/50 text-slate-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-200 transition-all active:scale-95 border border-slate-200">
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
                  {returnsData.map((record, idx) => (
                    <tr 
                      key={idx} 
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
                  ))}
               </tbody>
            </table>
         </div>

         <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100">
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">
               Total Purchase Returns : 82
            </span>
         </div>
      </div>
    </div>
  )
}

export default PurchaseReturns
