import React from 'react'
import { BarChart3, Package, Truck, Search, Filter } from 'lucide-react'
import Card from '../common/Card'
import Input from '../common/Input'
import Button from '../common/Button'

const PurchaseReport = () => {
  const stats = [
    { label: 'Total Inventory Spend', value: '$82,245.00', icon: Package, color: 'text-[#0EA5E9]', bg: 'bg-[#0EA5E90D]' },
    { label: 'Orders Placed', value: '45', icon: Truck, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Deliveries', value: '12', icon: BarChart3, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  const vendorSpend = [
    { vendor: 'Allied Beverages', orders: 15, total: '34,250.00', status: 'Active' },
    { vendor: 'Fedway', orders: 8, total: '12,100.50', status: 'Active' },
    { vendor: 'OH Brewing', orders: 12, total: '8,450.25', status: 'Active' },
    { vendor: 'Empire Merchants', orders: 5, total: '15,200.00', status: 'Active' },
    { vendor: 'High Grade', orders: 5, total: '12,244.25', status: 'Paused' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <Card key={idx} className="flex flex-col gap-4">
            <div className={`h-10 w-10 rounded-lg ${stat.bg} flex items-center justify-center ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">{stat.label}</p>
              <p className="text-[24px] font-black text-[#1E293B] mt-1">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
           <h3 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">Vendor Spend Analysis</h3>
           <div className="flex gap-2">
              <Button variant="outline" className="h-9 gap-2 text-[12px] px-4 font-bold border-[#E2E8F0]">
                 <Filter size={14} /> Filter
              </Button>
           </div>
        </div>
        <table className="w-full text-left border-collapse text-[14px]">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Vendor Name</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Orders</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Total Purchase</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {vendorSpend.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-6 py-4 font-bold text-[#0EA5E9] hover:underline cursor-pointer">{row.vendor}</td>
                <td className="px-6 py-4 text-center font-bold text-[#64748B]">{row.orders}</td>
                <td className="px-6 py-4 text-right font-black text-[#1E293B] tracking-tight">${row.total}</td>
                <td className="px-6 py-4 text-center">
                   <span className={`text-[11px] font-bold uppercase tracking-widest ${row.status === 'Active' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {row.status}
                   </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PurchaseReport
