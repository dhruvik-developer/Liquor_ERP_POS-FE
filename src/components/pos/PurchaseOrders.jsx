import React, { useState } from 'react'
import { 
  Filter, 
  Search, 
  Download, 
  RefreshCcw, 
  Plus, 
  Trash2,
  CheckCircle,
  ChevronDown,
  Calendar,
  Layers
} from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'

const PurchaseOrders = () => {
  const [filterPeriod, setFilterPeriod] = useState('Last Month')
  const [selectedRow, setSelectedRow] = useState(0)

  const orders = [
    { po: '369', date: '11/15/2021', vendor: 'Gallo Wines', vendorOrder: '', status: 'Open', total: '2430.34', overallStatus: 'Active' },
    { po: '368', date: '11/09/2021', vendor: 'Classic Wines', vendorOrder: '', status: 'Open', total: '427.88', overallStatus: 'Active' },
    { po: '367', date: '11/08/2021', vendor: 'Wines 4 All', vendorOrder: '', status: 'Open', total: '681.05', overallStatus: 'Active' },
    { po: '366', date: '11/08/2021', vendor: 'M Barriston & Sons', vendorOrder: '', status: 'Fully Received', total: '1857.69', overallStatus: 'Completed' },
    { po: '365', date: '11/04/2021', vendor: 'Latitude', vendorOrder: '', status: 'Open', total: '770.00', overallStatus: 'Active' },
    { po: '364', date: '11/03/2021', vendor: 'Gallo Wines', vendorOrder: '', status: 'Fully Received', total: '1695.44', overallStatus: 'Completed' },
  ]

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-auto pb-8 pr-2">
      
      {/* Filter Criteria Section */}
      <Card>
        <div className="flex flex-wrap items-end gap-10">
          <div className="space-y-4">
            <h3 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">Time Horizon</h3>
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
              <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-0.5">Attribute Filter</label>
              <div className="relative">
                <select className="w-full h-10 px-3 pr-10 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[14px] font-medium text-[#1E293B] outline-none appearance-none focus:border-[#0EA5E9] focus:bg-white transition-all">
                  <option>Vendor Source</option>
                  <option>PO Number</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
              </div>
            </div>

            <Input 
              label="Search Keywords" 
              placeholder="e.g. Gallo Wines..." 
              icon={Search}
              className="w-72"
            />

            <Button className="gap-2">
              <Filter size={16} />
              Apply Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Operations Section */}
      <Card className="py-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-lg bg-[#0EA5E90D] flex items-center justify-center text-[#0EA5E9]">
                 <Layers size={20} />
              </div>
              <div>
                 <h2 className="text-[16px] font-bold text-[#1E293B] tracking-tight">Active Operations</h2>
                 <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Bulk Actions & Inventory Updates</p>
              </div>
           </div>

           <div className="flex items-center gap-3">
              <Button variant="outline" className="text-[#64748B] p-2 h-10">
                <Download size={18} />
              </Button>
              <Button variant="outline" className="text-[#64748B] p-2 h-10">
                <RefreshCcw size={18} />
              </Button>
              <div className="h-6 w-px bg-[#E2E8F0] mx-1"></div>
              <Button className="bg-emerald-600 hover:bg-emerald-700 h-10 gap-2">
                <Plus size={18} />
                Create PO
              </Button>
              <Button variant="outline" className="text-rose-500 border-rose-100 h-10 gap-2">
                <Trash2 size={18} />
                Discard
              </Button>
              <Button className="h-10 gap-2">
                <CheckCircle size={18} />
                Receive
              </Button>
           </div>
        </div>
      </Card>

      {/* Table Section */}
      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden min-h-[400px]">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">PO ID</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Booking Date</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Vendor Partner</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-right">Sum</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Phase</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {orders.map((order, index) => (
                <tr 
                  key={index} 
                  onClick={() => setSelectedRow(index)}
                  className={`hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
                    selectedRow === index ? 'bg-[#0EA5E90D]' : ''
                  }`}
                >
                  <td className="px-6 py-4 font-bold text-[#0EA5E9] whitespace-nowrap">#{order.po}</td>
                  <td className="px-6 py-4 text-[#64748B] whitespace-nowrap flex items-center gap-2">
                     <Calendar size={14} className="text-[#94A3B8]" />
                     {order.date}
                  </td>
                  <td className="px-6 py-4 font-bold text-[#1E293B] whitespace-nowrap">{order.vendor}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-3 py-1 text-[11px] font-bold uppercase tracking-wide rounded-full border ${
                      order.status === 'Fully Received' 
                        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                        : 'bg-[#0EA5E90D] text-[#0EA5E9] border-[#0EA5E91A]'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-[16px] font-black text-[#1E293B] text-right whitespace-nowrap">${order.total}</td>
                  <td className="px-6 py-4">
                     <span className={`text-[11px] font-bold uppercase tracking-widest ${order.overallStatus === 'Completed' ? 'text-emerald-500' : 'text-[#0EA5E9]'}`}>
                        {order.overallStatus}
                     </span>
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

export default PurchaseOrders
