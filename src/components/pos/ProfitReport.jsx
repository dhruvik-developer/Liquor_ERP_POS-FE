import React from 'react'
import { TrendingUp, TrendingDown, DollarSign, Wallet, Percent, PieChart } from 'lucide-react'
import Card from '../common/Card'

const ProfitReport = () => {
  const pnlData = [
    { label: 'Gross Revenue', value: '$120,450.00', icon: DollarSign, color: 'text-[#0EA5E9]', bg: 'bg-[#0EA5E90D]' },
    { label: 'COGS (Cost of Goods)', value: '$82,245.00', icon: Wallet, color: 'text-[#64748B]', bg: 'bg-[#F8FAFC]' },
    { label: 'Gross Profit', value: '$38,205.00', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Profit Margin', value: '31.7%', icon: Percent, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  const topCategories = [
    { name: 'Bourbon & Whiskey', margin: '42.5%', profit: '12,450.00', trend: 'up' },
    { name: 'Wine (Domestic)', margin: '38.2%', profit: '8,240.50', trend: 'up' },
    { name: 'Imported Beer', margin: '22.4%', profit: '4,100.25', trend: 'down' },
    { name: 'Vodka', margin: '35.0%', profit: '7,412.00', trend: 'up' },
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pnlData.map((data, idx) => (
          <Card key={idx} className="flex flex-col gap-4 border-l-4 border-l-[#0EA5E9]" style={{borderLeftColor: data.color === 'text-emerald-600' ? '#10b981' : (data.color === 'text-rose-500' ? '#f43f5e' : '#0ea5e9')}}>
            <div className={`h-10 w-10 rounded-lg ${data.bg} flex items-center justify-center ${data.color}`}>
              <data.icon size={20} />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">{data.label}</p>
              <p className={`text-[24px] font-black mt-1 ${data.color.includes('emerald') ? 'text-emerald-600' : 'text-[#1E293B]'}`}>{data.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
         <Card title="Category Profitability">
            <div className="space-y-4 mt-6">
               {topCategories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#0EA5E9] transition-all group">
                     <div className="flex items-center gap-4">
                        <div className={`h-8 w-8 rounded-full flex items-center justify-center ${cat.trend === 'up' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                           {cat.trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                        </div>
                        <div>
                           <p className="text-[14px] font-bold text-[#1E293B]">{cat.name}</p>
                           <p className="text-[11px] font-medium text-[#64748B] uppercase tracking-tighter">Gross Margin: {cat.margin}</p>
                        </div>
                     </div>
                     <p className="text-[16px] font-black text-[#1E293B] group-hover:text-[#0EA5E9] transition-colors">${cat.profit}</p>
                  </div>
               ))}
            </div>
         </Card>

         <Card title="Profit Summary Chart">
            <div className="h-[280px] mt-4 bg-[#F8FAFC] rounded-lg border border-dashed border-[#E2E8F0] flex flex-col items-center justify-center gap-3">
               <PieChart size={48} className="text-[#E2E8F0]" />
               <p className="text-[#94A3B8] font-bold uppercase text-[11px] tracking-widest text-center px-10">Revenue vs COGS vs Expenses<br/>Visual Analytics Placeholder</p>
            </div>
         </Card>
      </div>
    </div>
  )
}

export default ProfitReport
