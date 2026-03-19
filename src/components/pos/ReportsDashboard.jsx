import React, { useState } from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  PieChart, 
  Calendar,
  Filter,
  Download
} from 'lucide-react'
import Button from '../common/Button'
import Card from '../common/Card'
import SalesReport from './SalesReport'
import PurchaseReport from './PurchaseReport'
import ProfitReport from './ProfitReport'

const ReportsDashboard = () => {
  const [activeTab, setActiveTab] = useState('sales')

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-hidden relative pb-8 pr-2">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">Business Reports</h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">Analyze your store performance</p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="gap-2 text-[#64748B]">
              <Calendar size={18} />
              Last 30 Days
           </Button>
           <Button className="gap-2 px-6">
              <Download size={18} />
              Export All
           </Button>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-8 px-2 border-b border-[#E2E8F0]">
        {[
          { id: 'sales', label: 'Sales Report', icon: TrendingUp },
          { id: 'purchase', label: 'Purchase Report', icon: BarChart3 },
          { id: 'profit', label: 'Profit & Loss', icon: TrendingUp }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`pb-4 pt-2 text-[14px] font-bold uppercase tracking-wider transition-all relative flex items-center gap-2 ${
              activeTab === tab.id 
                ? 'text-[#0EA5E9]' 
                : 'text-[#94A3B8] hover:text-[#64748B]'
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#0EA5E9] rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'sales' && <SalesReport />}
        {activeTab === 'purchase' && <PurchaseReport />}
        {activeTab === 'profit' && <ProfitReport />}
      </div>

    </div>
  )
}

export default ReportsDashboard
