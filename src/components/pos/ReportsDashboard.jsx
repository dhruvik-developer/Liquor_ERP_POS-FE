import React, { useState } from 'react'
import { 
  ChevronDown, 
  ChevronRight, 
  Search, 
  Calendar, 
  X, 
  RefreshCcw,
  BarChart3,
  FileText,
  FileBarChart2,
  PieChart,
  ClipboardList,
  Users
} from 'lucide-react'
import Card from '../common/Card'

const ReportsDashboard = () => {
  const [selectedReport, setSelectedReport] = useState('Item purchase history report')
  const [expandedSections, setExpandedSections] = useState({
    'Purchase Report': true,
    'Purchase Return Report': false,
    'Sales and Purchase Report': false,
    'Stock Report': false,
    'Vendor Report': false
  })

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const sections = [
    {
      title: 'Purchase Report',
      icon: FileText,
      items: [
        'Item purchase history report',
        'Item purchase by department report',
        'Purchase by vendor – detail report',
        'Purchase by vendor – summary report'
      ]
    },
    {
      title: 'Purchase Return Report',
      icon: RefreshCcw,
      items: [
        'Item purchase return history report',
        'Item purchase return by department report',
        'Purchase by vendor – detail report',
        'Purchase by vendor – summary report'
      ]
    },
    {
      title: 'Sales and Purchase Report',
      icon: BarChart3,
      items: [
        'Department wise sales and purchase report',
        'Item sales amount by month report',
        'Item sales quantity by month report',
        'Sales-purchase summary by date report',
        'Sales-purchase summary by item report'
      ]
    },
    {
      title: 'Stock Report',
      icon: ClipboardList,
      items: [
        'Item stock summary report',
        'Item stock valuation report'
      ]
    },
    {
      title: 'Vendor Report',
      icon: Users,
      items: [
        'Item purchase by vendor',
        'Vendor activity summary',
        'Vendor address report',
        'Vendor contact report'
      ]
    }
  ]

  const [sortOption, setSortOption] = useState('Bill Date')

  return (
    <div className="space-y-6">
      <div className="flex gap-6">
        
        {/* Left Panel - Select Report */}
        <div className="w-[350px] flex flex-col gap-4">
          <Card className="flex flex-col bg-white shadow-sm border border-[#E2E8F0] p-6 !rounded-lg">
            <h2 className="text-[18px] font-black text-slate-800 tracking-tight mb-6">Select Report</h2>
            
            <div className="space-y-2">
              {sections.map((section) => (
                <div key={section.title} className="space-y-1">
                  <button 
                    onClick={() => toggleSection(section.title)}
                    className="w-full flex items-center justify-between py-2 text-slate-700 hover:text-sky-500 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections[section.title] ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                      <span className="text-[14px] font-bold">{section.title}</span>
                    </div>
                  </button>
                  
                  {expandedSections[section.title] && (
                    <div className="pl-6 space-y-1 pb-4">
                      {section.items.map((item) => (
                        <button
                          key={item}
                          onClick={() => setSelectedReport(item)}
                          className={`w-full text-left px-4 py-2.5 rounded-lg text-[13px] font-medium transition-all ${
                            selectedReport === item 
                              ? 'bg-sky-50 text-sky-600 font-bold' 
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                          }`}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right Panel - Filter Criteria */}
        <div className="flex-1 flex flex-col gap-4">
          <Card className="bg-white shadow-sm border border-[#E2E8F0] p-8 !rounded-lg space-y-8">
            <div>
              <h2 className="text-[18px] font-black text-slate-800 tracking-tight mb-6">Filter Criteria</h2>
              
              <div className="space-y-6">
                {/* Period Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Period</label>
                    <div className="relative">
                      <select className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 transition-all">
                        <option>All</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        defaultValue="11/11/2025"
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none pr-12"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">End Date</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        defaultValue="11/24/2025"
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none pr-12"
                      />
                      <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    </div>
                  </div>
                </div>

                {/* Item Group Section */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">Item Group</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      readOnly 
                      value="JACK DANIEL'S OLD NO. 7, 200 ML , Single"
                      className="flex-1 h-11 px-4 rounded-xl border border-slate-200 bg-[#f8fafc] text-[14px] font-bold text-slate-500 outline-none"
                    />
                    <button className="h-11 px-8 rounded-xl border-2 border-[#0EA5E9] text-[#0EA5E9] text-xs font-black uppercase tracking-widest hover:bg-sky-50 transition-all active:scale-95 shadow-sm">
                      Clear Item
                    </button>
                  </div>
                </div>

                {/* Multi Filter Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-4">
                  {[
                    'Department', 'Category', 'Sub Cat.', 'Size',
                    'Pack', 'Vendor', 'Facility', 'Status',
                    'Location', 'Log Status', 'Type', 'Batch Type',
                    'Year', 'Month', 'Sales Person', 'Invoice No.'
                  ].map((field) => (
                    <div key={field} className="flex flex-col gap-1">
                      <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest ml-1">{field}</label>
                      <div className="relative">
                        <select className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-[13px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 transition-all">
                          <option>{field === 'Log Status' || field === 'Batch Type' ? '--All--' : 'All'}</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
                    Reset Detail
                  </button>
                </div>
              </div>
            </div>

            {/* Sort Section */}
            <div className="pt-8 border-t border-slate-100">
               <h2 className="text-[18px] font-black text-slate-800 tracking-tight mb-6">Sort</h2>
               <div className="space-y-4">
                  {[
                    { label: 'Bill Date', selected: true },
                    { label: 'Department', selected: false },
                    { label: 'Vendor', selected: false }
                  ].map((option) => (
                    <div key={option.label} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                       <div className="flex items-center gap-4 cursor-pointer" onClick={() => setSortOption(option.label)}>
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            sortOption === option.label ? 'border-[#0EA5E9] bg-white' : 'border-slate-300'
                          }`}>
                            {sortOption === option.label && <div className="w-2.5 h-2.5 rounded-full bg-[#0EA5E9]" />}
                          </div>
                          <span className={`text-[14px] font-bold ${sortOption === option.label ? 'text-slate-900' : 'text-slate-400'}`}>{option.label}</span>
                       </div>
                       <div className="relative w-32">
                          <select className="w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[12px] font-bold text-slate-600 outline-none appearance-none focus:border-sky-500">
                             <option>Descending</option>
                             <option>Ascending</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="h-[80px] bg-white border-t border-slate-200 flex items-center justify-end px-10 gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
         <button className="h-[46px] px-10 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm">
            Close
         </button>
         <button className="h-[46px] px-12 rounded-xl bg-[#0EA5E9] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0284C7] transition-all active:scale-95 shadow-lg shadow-sky-500/20">
            View Report
         </button>
      </div>
    </div>
  )
}

export default ReportsDashboard
