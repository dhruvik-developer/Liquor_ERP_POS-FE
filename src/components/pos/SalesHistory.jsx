import React, { useState } from 'react'
import { Search, Calendar, Download, Eye, FileText, Filter } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'

const SalesHistory = () => {
  const [startDate, setStartDate] = useState('2026-03-18')
  const [endDate, setEndDate] = useState('2026-03-18')
  const [selectedInvoice, setSelectedInvoice] = useState(null)

  const sales = [
    { id: 'SO-1710784910', date: '18-Mar-2026 08:42 PM', customer: 'Walk-in Customer', amount: '154.20', status: 'Paid', method: 'Cash' },
    { id: 'SO-1710784852', date: '18-Mar-2026 08:15 PM', customer: 'Jon Doe', amount: '42.00', status: 'Paid', method: 'Card' },
    { id: 'SO-1710784798', date: '18-Mar-2026 07:45 PM', customer: 'Walk-in Customer', amount: '89.50', status: 'Paid', method: 'UPI' },
    { id: 'SO-1710784712', date: '18-Mar-2026 06:30 PM', customer: 'Walk-in Customer', amount: '12.99', status: 'Paid', method: 'Cash' },
    { id: 'SO-1710784655', date: '18-Mar-2026 05:12 PM', customer: 'Jane Smith', amount: '210.00', status: 'Paid', method: 'Split' },
    { id: 'SO-1710784599', date: '17-Mar-2026 09:20 PM', customer: 'Walk-in Customer', amount: '55.00', status: 'Refunded', method: 'Card' },
  ]

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-auto pb-8 pr-2">
      
      {/* Filters Card */}
      <Card>
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
           <div className="flex flex-wrap items-center gap-6">
              <div className="space-y-1.5 flex-1 min-w-[200px]">
                 <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-0.5 whitespace-nowrap">Date Range</label>
                 <div className="flex items-center gap-2">
                    <DatePickerField value={startDate} onChange={setStartDate} wrapperClassName="flex-1" />
                    <span className="text-[#94A3B8] font-bold">to</span>
                    <DatePickerField value={endDate} onChange={setEndDate} wrapperClassName="flex-1" />
                 </div>
              </div>
              <Input 
                label="Search Invoice / Customer" 
                placeholder="Ex: SO-1710..." 
                icon={Search}
                className="w-72"
              />
           </div>

           <div className="flex items-center gap-3">
              <Button variant="outline" className="gap-2">
                <Filter size={18} />
                More Filters
              </Button>
              <Button className="gap-2 px-8">
                <Search size={18} />
                Search
              </Button>
           </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
         <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 text-[#64748B]">
              <Download size={18} />
              Export PDF
            </Button>
            <Button variant="outline" className="gap-2 text-[#64748B]">
              <FileText size={18} />
              Daily Summary
            </Button>
         </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Invoice #</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Date & Time</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Customer</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Method</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-right">Amount</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {sales.map((sale, index) => (
                <tr key={index} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-6 py-4 font-bold text-[#0EA5E9] whitespace-nowrap">{sale.id}</td>
                  <td className="px-6 py-4 text-[#64748B] whitespace-nowrap font-medium">{sale.date}</td>
                  <td className="px-6 py-4 font-bold text-[#1E293B] whitespace-nowrap">{sale.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                     <span className="text-[12px] font-bold text-[#64748B] bg-[#F1F5F9] px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {sale.method}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-[16px] font-black text-[#1E293B] text-right whitespace-nowrap">${sale.amount}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide border ${
                      sale.status === 'Paid' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="p-2 text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#0EA5E90D] rounded-lg transition-all">
                      <Eye size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Sales: {sales.length}</span>
          <div className="flex items-center gap-8">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Grand Total (Period):</span>
            <span className="text-[24px] font-black text-[#0EA5E9] tracking-tight">$82,450.00</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SalesHistory
