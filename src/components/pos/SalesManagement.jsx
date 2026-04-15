import React, { useState } from 'react'
import { 
  Search, 
  X
} from 'lucide-react'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'
import Loader from '../common/Loader'
import useFetch from '../../hooks/useFetch'
import { formatDateTime } from '../../utils/dateUtils'


const SalesManagement = () => {
  const [startDate, setStartDate] = useState('2025-11-26')
  const [endDate, setEndDate] = useState('2025-11-26')
  const [activeTab, setActiveTab] = useState('list')

  const { data: salesOrdersData, loading, error } = useFetch('/sales/orders/')
  const salesOrders = Array.isArray(salesOrdersData) ? salesOrdersData : salesOrdersData?.results || []

  const mappedSales = React.useMemo(() => {
    return salesOrders.map(sale => ({
       id: sale.id || `SO-${sale.id}`,
       receipt: sale.order_number || sale.receipt_number || sale.id || '-',
       date: sale.created_at ? formatDateTime(sale.created_at) : sale.order_date ? formatDateTime(sale.order_date) : 'N/A',

       amount: Number(sale.total_amount || 0),
       items: Array.isArray(sale.items) ? sale.items.length : 0
    }))
  }, [salesOrders])

  const dummyReturnData = [
    {
       id: 1,
       order_number: 'R-SO-SEED-2604061321-001',
       created_at: '2026-04-06T14:30:00Z',
       total_amount: '45.00',
       items: [{}, {}]
    },
    {
       id: 2,
       order_number: 'R-SO-SEED-2604061321-002',
       created_at: '2026-04-05T10:15:00Z',
       total_amount: '120.50',
       items: [{}]
    }
  ];

  const mappedReturns = React.useMemo(() => {
    return dummyReturnData.map(sale => ({
       id: sale.id || `RET-${sale.id}`,
       receipt: sale.order_number || sale.receipt_number || sale.id || '-',
       date: sale.created_at ? formatDateTime(sale.created_at) : 'N/A',

       amount: Number(sale.total_amount || 0),
       items: Array.isArray(sale.items) ? sale.items.length : 0
    }))
  }, [])

  const currentData = activeTab === 'list' ? mappedSales : mappedReturns;
  const currentLoading = activeTab === 'list' ? loading : false;
  const currentError = activeTab === 'list' ? error : null;

  return (
    <div className="space-y-6">
      
      {/* Tabs Section */}
      <div className="flex flex-wrap items-center gap-6 sm:gap-10 mb-6 border-b border-slate-200">
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

      <div className="flex flex-col gap-6">
          {/* Filter Section (Top Card) */}
          <Card noPadding className="border-slate-200 shadow-sm !rounded-lg overflow-visible">
            <div className="grid grid-cols-1 gap-x-8 gap-y-6 p-4 sm:p-6 xl:grid-cols-12 xl:p-8">
              
              {/* Left Side - Date Range */}
              <div className="space-y-4 pt-1 xl:col-span-4">
                  <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins mb-2">Date Range</h3>
                 <div className="grid grid-cols-1 gap-4">
                    <DatePickerField 
                      value={startDate}
                      onChange={setStartDate}
                    />
                    <DatePickerField 
                      value={endDate}
                      onChange={setEndDate}
                    />
                 </div>
              </div>

              {/* Right Side - Item */}
              <div className="flex flex-col gap-4 pt-1 xl:col-span-8">
                  <h3 className="text-[15px] font-black text-slate-800 tracking-tight font-poppins mb-2">Item</h3>
                 <div className="grid grid-cols-1 gap-4 2xl:grid-cols-2">
                    <div className="flex min-w-0 flex-col gap-3 sm:flex-row">
                       <input 
                         type="text" 
                         placeholder="SKU/UPC"
                         className="h-[42px] min-w-0 flex-1 px-4 rounded-xl border border-slate-200 bg-[#f9fafb] text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-sm"
                       />
                       <button className="h-[42px] w-full rounded-xl border border-[#0EA5E9] bg-white px-4 text-[12px] font-black uppercase tracking-widest text-[#0EA5E9] transition-all hover:bg-sky-50 active:scale-95 shadow-sm sm:w-auto sm:whitespace-nowrap">
                          Select Item
                       </button>
                    </div>
                    <div className="flex min-w-0 flex-col gap-3 xl:flex-row">
                       <input 
                         type="text" 
                         placeholder="Item Name"
                         className="h-[42px] min-w-0 flex-1 px-4 rounded-xl border border-slate-200 bg-[#f9fafb] text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-sm"
                       />
                       <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:flex xl:flex-nowrap">
                          <button className="flex h-[42px] w-full items-center justify-center gap-2 rounded-xl bg-[#0EA5E9] px-6 text-[12px] font-black uppercase tracking-widest text-white transition-all hover:bg-[#0284C7] active:scale-95 shadow-lg shadow-sky-500/20 sm:min-w-[140px]">
                             <Search size={18} />
                             Search
                          </button>
                          <button className="flex h-[42px] w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-6 text-[12px] font-black uppercase tracking-widest text-slate-500 transition-all hover:bg-slate-50 active:scale-95 shadow-sm sm:min-w-[120px]">
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
                      {currentLoading ? (
                        <tr>
                          <td colSpan="5" className="px-5 py-8 text-center text-[#64748B]">
                            <Loader size={48} className="mx-auto" />
                            <p className="mt-2 font-medium text-[#64748B]">
                              Loading {activeTab === 'list' ? 'sales history' : 'return history'}...
                            </p>
                          </td>
                        </tr>
                      ) : currentError ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center font-bold text-rose-500">
                             {currentError}
                          </td>
                        </tr>
                      ) : currentData.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-10 text-center font-bold text-slate-500">
                             No {activeTab === 'list' ? 'sales' : 'returns'} found.
                          </td>
                        </tr>
                      ) : (
                        currentData.map((sale, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors group">
                             <td className="px-6 py-4 text-[14px] font-bold text-sky-600 cursor-pointer hover:underline">{sale.id}</td>
                             <td className="px-6 py-4 text-[14px] font-bold text-sky-600 cursor-pointer hover:underline">{sale.receipt}</td>
                             <td className="px-6 py-4 text-[14px] font-semibold text-slate-600">{sale.date}</td>
                             <td className="px-6 py-4 text-[15px] font-black text-slate-800 text-right">{sale.amount.toFixed(2)}</td>
                             <td className="px-6 py-4 text-[14px] font-bold text-slate-600 text-center">{sale.items}</td>
                          </tr>
                        ))
                      )}
                   </tbody>
                </table>
             </div>
          </div>
        </div>
    </div>
  )
}

export default SalesManagement
