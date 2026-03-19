import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Filter, 
  Search, 
  Download, 
  RefreshCcw, 
  Plus, 
  Trash2,
  ChevronDown
} from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'

const PurchaseBills = () => {
  const [filterPeriod, setFilterPeriod] = useState('Last Month')
  const [selectedRow, setSelectedRow] = useState(0)

  const bills = [
    { id: '191042', date: '11/24/2025 03:59:02 PM', vendor: 'OH Brewing', status: 'Committed', total: '826.00', dueDate: '12/24/2025 03:59:02 PM', note: '' },
    { id: '56406,07', date: '11/24/2025 02:25:11 PM', vendor: 'Fedway', status: 'Committed', total: '1913.78', dueDate: '12/24/2025 02:25:11 PM', note: '' },
    { id: '171544,170336', date: '11/24/2025 02:05:29 PM', vendor: 'Allied Beverages', status: 'Committed', total: '3514.42', dueDate: '12/24/2025 02:05:29 PM', note: '' },
    { id: '10347880', date: '11/21/2025 01:01:59 PM', vendor: 'REMARKABLE LIQUIDS', status: 'Committed', total: '539.85', dueDate: '12/21/2025 01:01:59 PM', note: '' },
    { id: '0178072', date: '11/21/2025 12:47:34 PM', vendor: 'High Grade', status: 'Committed', total: '450.25', dueDate: '12/21/2025 12:47:34 PM', note: '' },
    { id: '803462', date: '11/20/2025 06:25:47 PM', vendor: 'Gallo Wines', status: 'Committed', total: '448.04', dueDate: '12/20/2025 06:25:47 PM', note: '' },
  ]

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-auto pb-8 pr-2">
      
      {/* Filter Criteria Section */}
      <Card>
        <div className="flex flex-wrap items-end gap-10">
          <div className="space-y-3">
            <h3 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">Filter Criteria</h3>
            <div className="flex items-center gap-6">
              {['Last Month', 'Last 3 Months', 'Last 6 Months', 'All'].map((period) => (
                <label key={period} className="flex items-center gap-2 cursor-pointer group">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                    filterPeriod === period ? 'border-[#0EA5E9]' : 'border-[#E2E8F0] group-hover:border-[#CBD5E1]'
                  }`}>
                    {filterPeriod === period && <div className="w-2 h-2 rounded-full bg-[#0EA5E9]" />}
                  </div>
                  <input type="radio" className="hidden" name="period" checked={filterPeriod === period} onChange={() => setFilterPeriod(period)} />
                  <span className={`text-[12px] font-bold transition-colors ${
                    filterPeriod === period ? 'text-[#0EA5E9]' : 'text-[#64748B] group-hover:text-[#1E293B]'
                  }`}>{period}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-end gap-4 flex-1 justify-end">
            <div className="flex flex-col gap-1 w-56">
              <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-0.5">Filter By</label>
              <div className="relative">
                <select className="w-full h-10 px-3 pr-10 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[14px] font-medium text-[#1E293B] outline-none appearance-none focus:border-[#0EA5E9] focus:bg-white transition-all">
                  <option>Vendor</option>
                  <option>Bill #</option>
                  <option>Status</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
              </div>
            </div>

            <Input 
              label="Filter Value" 
              placeholder="Search..." 
              className="w-72"
            />

            <Button className="gap-2">
              <Filter size={16} />
              Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Action Buttons Section */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-[#64748B]">
            <Download size={18} />
            Export CSV
          </Button>
          <Button variant="outline" className="gap-2 text-[#64748B]">
            <RefreshCcw size={18} />
            Refresh
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/pos/purchase-bills/create">
            <Button className="gap-2">
              <Plus size={18} />
              Add Invoice
            </Button>
          </Link>
          <Button variant="outline" className="gap-2 text-rose-500 border-rose-100 hover:bg-rose-50">
            <Trash2 size={18} />
            Delete
          </Button>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Bill #</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Receive Date</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Vendor</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-right">Total Amt.</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Due Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {bills.map((bill, index) => (
                <tr 
                  key={index} 
                  onClick={() => setSelectedRow(index)}
                  className={`hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                    selectedRow === index ? 'bg-[#0EA5E90D]' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-[#0EA5E9] hover:underline whitespace-nowrap">{bill.id}</td>
                  <td className="px-6 py-4 text-[#64748B] whitespace-nowrap font-medium">{bill.date}</td>
                  <td className="px-6 py-4 font-bold text-[#0EA5E9] hover:underline whitespace-nowrap">{bill.vendor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[12px] font-bold rounded-full border border-emerald-100 uppercase tracking-wide">
                      {bill.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[16px] font-black text-[#1E293B] text-right whitespace-nowrap">${bill.total}</td>
                  <td className="px-6 py-4 text-[#64748B] font-medium whitespace-nowrap">{bill.dueDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between">
          <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Purchase Bills: {bills.length}</span>
          <div className="flex items-center gap-8">
            <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Value:</span>
            <span className="text-[24px] font-black text-[#0EA5E9] tracking-tight">$2,456,782.12</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PurchaseBills
