import React from 'react'
import { AlertCircle, ShoppingCart, Search, Filter, ArrowUpRight } from 'lucide-react'
import Card from '../common/Card'
import Button from '../common/Button'
import Input from '../common/Input'

const LowStockReport = () => {
  const items = [
    { id: '10432', name: 'Hennessy VS 750ml', stock: 2, threshold: 12, vendor: 'Allied Beverages', status: 'Critical' },
    { id: '10582', name: 'Red Bull 8.4oz 24pk', stock: 5, threshold: 10, vendor: 'High Grade', status: 'Warning' },
    { id: '20491', name: 'Grey Goose 1.75L', stock: 1, threshold: 6, vendor: 'Fedway', status: 'Critical' },
    { id: '30482', name: 'Bud Light 12pk Cans', stock: 8, threshold: 15, vendor: 'OH Brewing', status: 'Warning' },
    { id: '15920', name: 'Jack Daniels 1L', stock: 0, threshold: 12, vendor: 'Empire Merchants', status: 'Out of Stock' },
  ]

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-auto pb-8 pr-2">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
           <div className="h-14 w-14 bg-rose-50 rounded-lg flex items-center justify-center text-rose-500 border border-rose-100">
              <AlertCircle size={32} />
           </div>
           <div>
              <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">Low Stock Alerts</h1>
              <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">Replenishment Priority Queue</p>
           </div>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="gap-2 text-[#64748B]">
              <Filter size={18} />
              Filter Vendor
           </Button>
           <Button className="gap-2 px-8">
              <ShoppingCart size={18} />
              Auto-generate PO
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <SummaryCard label="Out of Stock" value="5" color="text-rose-600" bg="bg-rose-50" />
         <SummaryCard label="Critical Level" value="12" color="text-amber-600" bg="bg-amber-50" />
         <SummaryCard label="Warning Level" value="28" color="text-[#0EA5E9]" bg="bg-[#0EA5E90D]" />
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Product Details</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Curr. Stock</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Threshold</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Main Vendor</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Urgency</th>
                <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {items.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-6 py-4">
                     <p className="font-bold text-[#1E293B]">{item.name}</p>
                     <p className="text-[11px] text-[#94A3B8] font-medium tracking-wide">ID: {item.id}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <span className={`text-[16px] font-black ${item.stock === 0 ? 'text-rose-600' : 'text-[#1E293B]'}`}>{item.stock}</span>
                  </td>
                  <td className="px-6 py-4 text-center font-bold text-[#64748B] italic">{item.threshold}</td>
                  <td className="px-6 py-4 font-bold text-[#0EA5E9] hover:underline cursor-pointer">{item.vendor}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                      item.status === 'Out of Stock' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      item.status === 'Critical' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-[#0EA5E90D] text-[#0EA5E9] border-[#0EA5E91A]'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                     <button className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-widest text-[#0EA5E9] hover:text-[#38BDF8] transition-colors">
                        Add to PO <ArrowUpRight size={14} />
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const SummaryCard = ({ label, value, color, bg }) => (
  <Card className={`${bg} border-transparent flex flex-col gap-2`}>
     <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-[0.2em]">{label}</p>
     <p className={`text-[32px] font-black tracking-tighter ${color}`}>{value}</p>
  </Card>
)

export default LowStockReport
