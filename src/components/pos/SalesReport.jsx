import React from 'react'
import { TrendingUp, ShoppingCart, Users, DollarSign, Calendar, Search } from 'lucide-react'
import Card from '../common/Card'
import Input from '../common/Input'
import Button from '../common/Button'

const SalesReport = () => {
  const stats = [
    { label: 'Total Revenue', value: '$45,210.35', icon: DollarSign, color: 'text-[#0EA5E9]', bg: 'bg-[#0EA5E90D]' },
    { label: 'Total Orders', value: '1,245', icon: ShoppingCart, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Avg Order Value', value: '$36.25', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Unique Customers', value: '840', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
  ]

  const dailyData = [
    { date: '18-Mar-2026', orders: 42, revenue: '1,540.20', avg: '36.67' },
    { date: '17-Mar-2026', orders: 38, revenue: '1,320.50', avg: '34.75' },
    { date: '16-Mar-2026', orders: 45, revenue: '1,680.00', avg: '37.33' },
    { date: '15-Mar-2026', orders: 30, revenue: '1,100.25', avg: '36.68' },
    { date: '14-Mar-2026', orders: 55, revenue: '2,100.00', avg: '38.18' },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

      {/* Chart UI Placeholder */}
      <Card title="Sales Revenue Chart (Daily)">
        <div className="h-64 mt-4 bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0] flex flex-col items-center justify-center gap-3">
           <TrendingUp size={48} className="text-[#E2E8F0]" />
           <p className="text-[#94A3B8] font-bold uppercase text-[11px] tracking-widest">Interactive Data Visualization Placeholder</p>
        </div>
      </Card>

      {/* Data Table */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
        <div className="p-5 border-b border-[#E2E8F0] bg-[#F8FAFC] flex items-center justify-between">
           <h3 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider">Daily Performance Summary</h3>
           <div className="flex gap-2">
              <Input placeholder="Search date..." icon={Search} className="h-9 w-48 text-[12px]" />
           </div>
        </div>
        <table className="w-full text-left border-collapse text-[14px]">
          <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <tr>
              <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Date</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Orders</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Total Revenue</th>
              <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Avg Val.</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {dailyData.map((row, idx) => (
              <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="px-6 py-4 font-bold text-[#1E293B]">{row.date}</td>
                <td className="px-6 py-4 text-center font-bold text-[#64748B]">{row.orders}</td>
                <td className="px-6 py-4 text-right font-black text-[#0EA5E9]">${row.revenue}</td>
                <td className="px-6 py-4 text-right font-bold text-[#1E293B]">${row.avg}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default SalesReport
