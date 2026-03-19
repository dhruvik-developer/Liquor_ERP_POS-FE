import React, { useState } from 'react'
import { 
  Calendar, 
  Search, 
  X, 
  ChevronDown,
  Clock,
  LayoutGrid,
  History,
  Info
} from 'lucide-react'
import Card from '../common/Card'

const SalesManagement = () => {
  const [activeTab, setActiveTab] = useState('list')
  const [salesData, setSalesData] = useState([
    { id: '573353', receipt: '04253307806768', date: '26-Nov-25 09:41 PM', amount: 183.29, items: 4 },
    { id: '573352', receipt: '03253307800178', date: '26-Nov-25 09:40 PM', amount: 25.73, items: 2 },
    { id: '573351', receipt: '04253307601225', date: '26-Nov-25 09:07 PM', amount: 65.06, items: 4 },
    { id: '573350', receipt: '04253307577895', date: '26-Nov-25 09:03 PM', amount: 4.01, items: 1 },
    { id: '573349', receipt: '04253307576041', date: '26-Nov-25 09:02 PM', amount: 4.01, items: 1 },
    { id: '573348', receipt: '03253307567151', date: '26-Nov-25 09:01 PM', amount: 126.33, items: 8 },
    { id: '573347', receipt: '04253307560251', date: '26-Nov-25 09:00 PM', amount: 71.92, items: 3 },
  ])

  return (
    <div className="space-y-6">
      
      {/* Tabs Section */}
      <div className="flex items-center gap-10 mb-6 border-b border-slate-200">
        <button 
          onClick={() => setActiveTab('list')}
          className={`pb-3 text-[15px] font-bold transition-all relative ${
            activeTab === 'list' 
              ? 'text-[#0EA5E9]' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Sales List
          {activeTab === 'list' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0EA5E9] rounded-t-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('return')}
          className={`pb-3 text-[15px] font-bold transition-all relative ${
            activeTab === 'return' 
              ? 'text-[#0EA5E9]' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Sales Return
          {activeTab === 'return' && (
            <div className="absolute bottom-0 left-0 w-full h-[3px] bg-[#0EA5E9] rounded-t-full" />
          )}
        </button>
      </div>

      {activeTab === 'list' ? (
        <div className="flex flex-col gap-6">
          {/* Filter Section (Top Card) */}
          <Card noPadding className="border-slate-200 shadow-sm !rounded-lg overflow-visible">
            <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-6">
              
              {/* Left Side - Date Range */}
              <div className="lg:col-span-4 space-y-4 pt-1">
                  <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins mb-2">Date Range</h3>
                 <div className="grid grid-cols-1 gap-4">
                    <div className="relative">
                      <input 
                        type="text" 
                        defaultValue="11/26/2025"
                        className="w-full h-[42px] px-4 rounded-xl border border-slate-200 bg-[#f9fafb] text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all pr-12 shadow-sm"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                    <div className="relative">
                      <input 
                        type="text" 
                        defaultValue="11/26/2025"
                        className="w-full h-[42px] px-4 rounded-xl border border-slate-200 bg-[#f9fafb] text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all pr-12 shadow-sm"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                 </div>
              </div>

              {/* Right Side - Item */}
              <div className="lg:col-span-8 flex flex-col gap-4 pt-1">
                  <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins mb-2">Item</h3>
                 <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="flex gap-2">
                       <input 
                         type="text" 
                         placeholder="SKU/UPC"
                         className="flex-1 h-[42px] px-4 rounded-xl border border-slate-200 bg-[#f9fafb] text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-sm"
                       />
                       <button className="h-[42px] px-4 rounded-xl border border-[#0EA5E9] bg-white text-[#0EA5E9] text-[12px] font-black uppercase tracking-widest hover:bg-sky-50 transition-all active:scale-95 shadow-sm whitespace-nowrap">
                          Select Item
                       </button>
                    </div>
                    <div className="flex gap-3">
                       <input 
                         type="text" 
                         placeholder="Item Name"
                         className="flex-1 h-[42px] px-4 rounded-xl border border-slate-200 bg-[#f9fafb] text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-sm"
                       />
                       <div className="flex gap-2">
                          <button className="h-[42px] px-8 rounded-xl bg-[#0EA5E9] text-white text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0284C7] transition-all active:scale-95 shadow-lg shadow-sky-500/20">
                             <Search size={18} />
                             Search
                          </button>
                          <button className="h-[42px] px-6 rounded-xl border border-slate-200 bg-white text-slate-500 text-[12px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                             <X size={18} />
                             Clear
                          </button>
                       </div>
                    </div>
                 </div>
              </div>
            </div>
          </Card>

          {/* Table Section */}
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col">
             <div className="overflow-x-auto scrollbar-hide">
                <table className="w-full text-left border-collapse table-auto">
                   <thead className="bg-[#f9fafb] border-b border-slate-200">
                      <tr>
                         <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">TR. ID</th>
                         <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Receipt #</th>
                         <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider">Transaction Date</th>
                         <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                         <th className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wider text-center">Items</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {salesData.map((sale) => (
                        <tr key={sale.id} className="hover:bg-slate-50 transition-colors group">
                           <td className="px-6 py-4 text-[14px] font-bold text-sky-600 cursor-pointer hover:underline">{sale.id}</td>
                           <td className="px-6 py-4 text-[14px] font-bold text-sky-600 cursor-pointer hover:underline">{sale.receipt}</td>
                           <td className="px-6 py-4 text-[14px] font-semibold text-slate-600">{sale.date}</td>
                           <td className="px-6 py-4 text-[15px] font-black text-slate-800 text-right">{sale.amount.toFixed(2)}</td>
                           <td className="px-6 py-4 text-[14px] font-bold text-slate-600 text-center">{sale.items}</td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
      ) : (
        /* Sales Return Tab (Temporary Placeholder) */
        <div className="flex-1 min-h-[500px] flex items-center justify-center bg-white rounded-lg border border-dashed border-slate-200">
           <div className="flex flex-col items-center gap-4 text-center">
              <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center text-slate-300">
                 <History size={40} />
              </div>
              <div>
                 <h3 className="text-[18px] font-black text-slate-400 tracking-tight">Sales Return feature coming soon...</h3>
                 <p className="text-[14px] font-medium text-slate-300 mt-1">We're working hard to bring you the return management system.</p>
              </div>
           </div>
        </div>
      )}
    </div>
  )
}

export default SalesManagement
