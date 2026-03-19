import React, { useState } from 'react'
import { Plus, Minus, Search, Package, AlertCircle, Save, History } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'

const StockAdjustment = () => {
  const [adjustType, setAdjustType] = useState('add')

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-y-auto pb-10 pr-2">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">Stock Adjustment</h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">Manual Inventory Corrections</p>
        </div>
        <Button className="gap-2 px-8">
          <Save size={18} />
          Process Adjustment
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Adjustment Form */}
        <div className="lg:col-span-7 space-y-6">
          <Card title="Adjustment Details">
             <div className="space-y-6 mt-4">
                <div className="space-y-1.5 flex-1">
                  <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Find Product</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
                    <input 
                      type="text" 
                      placeholder="Scan SKU or Type Product Name..." 
                      className="w-full h-12 pl-12 pr-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-bold outline-none focus:border-[#0EA5E9] focus:bg-white transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-1.5">
                      <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Adjustment Action</label>
                      <div className="grid grid-cols-2 gap-2 p-1.5 bg-[#F8FAFC] rounded-lg border border-[#E2E8F0]">
                         <button 
                           onClick={() => setAdjustType('add')}
                           className={`h-10 rounded-md flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-wider transition-all ${
                             adjustType === 'add' ? 'bg-emerald-600 text-white shadow-md' : 'text-[#64748B] hover:text-[#1E293B]'
                           }`}
                         >
                            <Plus size={16} /> Add
                         </button>
                         <button 
                           onClick={() => setAdjustType('reduce')}
                           className={`h-10 rounded-md flex items-center justify-center gap-2 text-[12px] font-black uppercase tracking-wider transition-all ${
                             adjustType === 'reduce' ? 'bg-rose-500 text-white shadow-md' : 'text-[#64748B] hover:text-[#1E293B]'
                           }`}
                         >
                            <Minus size={16} /> Reduce
                         </button>
                      </div>
                   </div>
                   <Input label="Quantity Change" type="number" defaultValue="1" icon={Package} />
                </div>

                <div className="space-y-1.5">
                   <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Adjustment Reason</label>
                   <select className="w-full h-12 px-4 rounded-lg bg-white border border-[#E2E8F0] text-[14px] font-bold outline-none focus:border-[#0EA5E9]">
                      <option>Inventory Audit (Correction)</option>
                      <option>Damaged / Broken Bottle</option>
                      <option>Expired Product</option>
                      <option>Store Consumption</option>
                      <option>Vendor Return</option>
                   </select>
                </div>

                <div className="space-y-1.5 focus-within:text-[#0EA5E9] transition-colors">
                   <label className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest ml-1">Internal Protocol Note</label>
                   <textarea rows={4} className="w-full p-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] text-[14px] font-medium outline-none focus:border-[#0EA5E9] focus:bg-white resize-none" placeholder="Provide context for this manual adjustment..." />
                </div>
             </div>
          </Card>
        </div>

        {/* Product Context & Preview */}
        <div className="lg:col-span-5 space-y-6">
          <Card title="Target Snapshot" className="bg-[#0EA5E90D] border-[#0EA5E91A]">
             <div className="flex flex-col items-center py-6 text-center">
                <div className="h-28 w-28 bg-white rounded-lg border border-[#0EA5E933] p-4 flex items-center justify-center shadow-sm">
                   <img src="https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200&auto=format&fit=crop" alt="Wine" className="max-h-full object-contain" />
                </div>
                <h3 className="text-[18px] font-black text-[#1E293B] mt-4 tracking-tight">KENDALL JACKSON CHARDONAY</h3>
                <p className="text-[11px] font-black text-[#0EA5E9] uppercase tracking-widest mt-1">SKU: 1045293021</p>
             </div>

             <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#0EA5E91A]">
                <div className="text-center p-3 rounded-lg bg-white border border-[#0EA5E91A]">
                   <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Current Stock</p>
                   <p className="text-[20px] font-black text-[#1E293B]">42 Units</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#0EA5E9] border border-[#0EA5E91A] text-white">
                   <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">Post Change</p>
                   <p className="text-[20px] font-black">{adjustType === 'add' ? '43' : '41'} Units</p>
                </div>
             </div>
          </Card>

          <Card title="Recent Activity" className="py-0">
             <div className="divide-y divide-[#E2E8F0]">
                {[
                  { user: 'Admin', type: 'Reduce', qty: 2, date: '1 hr ago', reason: 'Damaged' },
                  { user: 'Staff', type: 'Add', qty: 10, date: '4 hrs ago', reason: 'Audit' },
                ].map((log, idx) => (
                  <div key={idx} className="py-4 flex items-start gap-4">
                     <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${log.type === 'Add' ? 'bg-emerald-50 text-emerald-500' : 'bg-rose-50 text-rose-500'}`}>
                        <History size={16} />
                     </div>
                     <div className="flex-1">
                        <div className="flex justify-between items-center">
                           <p className="text-[13px] font-bold text-[#1E293B]">{log.user}</p>
                           <p className="text-[11px] font-medium text-[#94A3B8] capitalize">{log.date}</p>
                        </div>
                        <p className="text-[12px] text-[#64748B] mt-0.5">{log.type} {log.qty} units - {log.reason}</p>
                     </div>
                  </div>
                ))}
             </div>
             <button className="w-full py-4 text-[12px] font-black text-[#0EA5E9] uppercase tracking-widest hover:underline text-center">View Full Log History</button>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default StockAdjustment
