import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save, 
  Plus, 
  Trash2, 
  Calculator, 
  Upload, 
  ChevronDown,
  X,
  Settings,
  MoreHorizontal,
  Calendar
} from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'

const CreatePurchaseBill = () => {
  const navigate = useNavigate()
  const [billItems, setBillItems] = useState([
    { 
      sr: 1, 
      sku: '611269991000', 
      vendorCode: 'VDR001', 
      itemName: 'REDBULL 611269991000 8.4 OZ 24-PACK', 
      sizePack: '8.4 OZ', 
      case: 1.0, 
      bpc: 24, 
      qty: 1, 
      cost: 38.49, 
      disc: '0.00%', 
      amount: 38.49, 
      rip: 0.00 
    }
  ])

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <h1 className="text-[24px] font-bold text-slate-800 tracking-tight font-poppins">Create Purchase Bill</h1>
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/pos/purchase-bills')} 
            className="px-6 h-10 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Close
          </button>
          <button 
            onClick={() => navigate('/pos/purchase-bills')} 
            className="px-8 h-10 rounded-xl bg-[#0EA5E9] text-white text-xs font-black uppercase tracking-widest hover:bg-[#0284C7] transition-all active:scale-95 shadow-lg shadow-sky-500/20 flex items-center gap-2"
          >
            <Save size={16} />
            Save
          </button>
        </div>
      </div>

      {/* Bill Info Card */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-end">
           <div className="lg:col-span-3 space-y-1.5 flex flex-col">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Vendor</label>
              <div className="relative group">
                <select className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 focus:bg-white transition-all shadow-inner">
                  <option>Allied Beverages</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
           </div>
           
           <div className="lg:col-span-3 space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice #</label>
              <input 
                type="text" 
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                placeholder=""
              />
           </div>

           <div className="lg:col-span-4 flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Sales Person</label>
                <div className="relative group">
                  <select className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 focus:bg-white transition-all shadow-inner">
                    <option>Select a person</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                </div>
              </div>
              <button className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:border-sky-500 hover:text-sky-500 transition-all shadow-sm active:scale-95">
                <MoreHorizontal size={20} />
              </button>
           </div>

           <div className="lg:col-span-2 flex flex-col items-end pb-1 whitespace-nowrap overflow-hidden">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bill ID</span>
              <span className="text-[13px] font-black text-slate-700 tabular-nums">PBL25112423243040365</span>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
           <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Bill Date</label>
              <div className="relative">
                <input 
                   type="text" 
                   defaultValue="11/24/2025"
                   className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 focus:bg-white transition-all shadow-inner pr-10"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
           </div>
           <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Due Date</label>
              <div className="relative">
                <input 
                   type="text" 
                   defaultValue="12/24/2025"
                   className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 focus:bg-white transition-all shadow-inner pr-10"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
           </div>
           <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Delivery Date</label>
              <div className="relative">
                <input 
                   type="text" 
                   defaultValue="11/24/2025"
                   className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 focus:bg-white transition-all shadow-inner pr-10"
                />
                <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              </div>
           </div>
           <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Note</label>
              <input 
                type="text" 
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
              />
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Item Selection Column */}
        <div className="lg:col-span-8 flex flex-col">
           <Card noPadding className="border-slate-200 flex-1 overflow-hidden">
              <div className="h-14 border-b border-slate-100 flex items-center px-8 bg-slate-50/50">
                 <div className="relative h-full flex items-center">
                    <span className="text-[11px] font-black text-sky-500 uppercase tracking-widest">Item Selection</span>
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-sky-500" />
                 </div>
              </div>

              <div className="p-8 space-y-8">
                 <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-2 space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">SKU / UPC</label>
                       <input 
                         type="text" 
                         defaultValue="5008"
                         className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                       />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                       <input type="text" defaultValue="1" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">BPC</label>
                       <input type="text" defaultValue="24" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Free Qty</label>
                       <input type="text" defaultValue="0" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 text-center text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                    </div>
                    <div className="space-y-1.5 flex flex-col">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Line Total</label>
                       <div className="relative">
                          <input type="text" defaultValue="38.490" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                       </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-6 gap-6 items-end">
                    <div className="col-span-2 space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Item Name</label>
                       <div className="relative group">
                          <select className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-slate-50 text-[13px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 focus:bg-white transition-all shadow-inner">
                            <option>REDBULL 611269991000 8.4 OZ 24-PACK</option>
                          </select>
                          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                       </div>
                    </div>
                    <div className="flex items-center gap-2 pb-3">
                       <div className="w-5 h-5 rounded-full border-2 border-slate-200 flex items-center justify-center cursor-pointer transition-all hover:border-sky-500 group">
                          <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover:bg-sky-500/30" />
                       </div>
                       <span className="text-[12px] font-bold text-slate-500">Loose bottles/Units only</span>
                    </div>
                    <div className="col-span-2 invisible" />
                    <div className="space-y-1.5">
                       <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 text-right">Net Qty</label>
                       <input type="text" defaultValue="24.0" readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 text-center text-sm font-bold text-slate-400 outline-none" />
                    </div>
                 </div>

                 <div className="grid grid-cols-12 gap-8 items-start">
                    <div className="col-span-8 grid grid-cols-2 gap-x-8 gap-y-6">
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Case Cost</label>
                          <div className="relative">
                             <input type="text" defaultValue="38.490" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit Cost</label>
                          <div className="relative">
                             <input type="text" defaultValue="1.600" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Unit Cost</label>
                          <div className="relative">
                             <input type="text" defaultValue="1.60" readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-400 outline-none" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Case Cost</label>
                          <div className="relative">
                             <input type="text" defaultValue="38.49" readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-400 outline-none" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount</label>
                          <div className="relative">
                             <input type="text" defaultValue="0.000" className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                          </div>
                       </div>
                       <div className="space-y-1.5 flex flex-col">
                          <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Net Cost</label>
                          <div className="relative">
                             <input type="text" defaultValue="38.490" readOnly className="w-full h-11 rounded-xl border border-slate-100 bg-slate-50 pl-8 pr-4 text-sm font-bold text-slate-400 outline-none" />
                             <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-200 font-bold">$</span>
                          </div>
                       </div>
                    </div>

                    <div className="col-span-4 space-y-4">
                       <div className="p-5 rounded-2xl bg-slate-50/50 border border-slate-100 space-y-3">
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curr Cost:</span>
                             <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">1.60</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curr Margin:</span>
                             <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">54.15 %</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Curr Markup:</span>
                             <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">118.12 %</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sale Price:</span>
                             <span className="text-[12px] font-black text-slate-800 tracking-tight transition-colors group-hover:text-sky-500 underline decoration-sky-500/30">3.49</span>
                          </div>
                       </div>

                       <div className="p-5 rounded-2xl bg-white border border-slate-100 space-y-3 shadow-sm">
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">New Cost:</span>
                             <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">1.60</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Margin:</span>
                             <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">54.15 %</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Markup:</span>
                             <span className="text-[12px] font-black text-slate-600 tracking-tight transition-colors group-hover:text-sky-500">118.12 %</span>
                          </div>
                          <div className="flex justify-between items-center group">
                             <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Suggested Price:</span>
                             <span className="text-[12px] font-black text-slate-800 tracking-tight transition-colors group-hover:text-sky-500">3.49</span>
                          </div>
                       </div>
                    </div>
                 </div>

                 <div className="flex justify-end pt-4">
                    <button className="h-11 px-8 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95">
                       <Plus size={18} />
                       Add Item
                    </button>
                 </div>
              </div>
           </Card>
        </div>

        {/* Summary Column */}
        <div className="lg:col-span-4">
            <Card noPadding className="h-full border-slate-200 flex flex-col">
               <div className="h-14 border-b border-slate-100 flex items-center px-8 bg-slate-50/50">
                  <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Summary</h2>
               </div>
               
               <div className="p-8 space-y-4 flex-1">
                 {[
                    { label: 'Sub Total', value: '$0.000' },
                    { label: 'Tax 1', value: '$0.00' },
                    { label: 'Tax 2', value: '$0.00' },
                    { label: 'Tax 3', value: '$0.00' },
                    { label: 'Discount (Fees)', value: '$0.00' },
                    { label: 'Deposit (Fees)', value: '$0.00' },
                    { label: 'Return Deposit', value: '$0.00', isRed: true },
                    { label: 'Overhead', value: '$0.000' },
                 ].map((row, idx) => (
                    <div key={idx} className="flex justify-between items-center">
                       <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">{row.label}</span>
                       <span className={`text-sm font-black ${row.isRed ? 'text-rose-500' : 'text-slate-700'}`}>{row.value}</span>
                    </div>
                 ))}
                 
                 <div className="h-px bg-slate-100 my-6" />
                 
                 <div className="flex justify-between items-center">
                    <h3 className="text-lg font-bold text-sky-500 tracking-tight font-poppins">Total Payable</h3>
                    <span className="text-[28px] font-black text-sky-500 tracking-tight">$0.000</span>
                 </div>

                 <div className="grid grid-cols-3 gap-6 pt-8">
                    <div className="text-center space-y-1">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Qty</div>
                       <div className="text-2xl font-black text-slate-800">1</div>
                    </div>
                    <div className="text-center space-y-1 border-x border-slate-100 px-4">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Unit Qty</div>
                       <div className="text-2xl font-black text-slate-800">24</div>
                    </div>
                    <div className="text-center space-y-1">
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Items</div>
                       <div className="text-2xl font-black text-slate-800">1</div>
                    </div>
                 </div>
              </div>

              <div className="pt-8">
                 <button className="w-full h-12 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                    <Calculator size={18} className="text-slate-400" />
                    Calculator
                 </button>
              </div>
           </Card>
        </div>
      </div>

      {/* Items Table Section */}
      <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm overflow-hidden flex flex-col min-h-[400px]">
         <div className="h-14 border-b border-slate-100 flex items-center px-8 bg-slate-50/50">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Items Detail</h2>
         </div>
         <div className="overflow-x-auto scrollbar-hide flex-1">
            <table className="w-full text-left border-collapse">
               <thead className="bg-[#F8FAFC] border-b border-slate-100">
                  <tr>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">SR #</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">SKU</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Vendor Code</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Item Name</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Size/Pack</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Case</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">BPC</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Qty</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Cost</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Disc</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Amount</th>
                     <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">RIP</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-50">
                  {billItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-sky-50 transition-colors">
                       <td className="px-6 py-5 text-sm font-bold text-slate-400">{item.sr}</td>
                       <td className="px-6 py-5 text-sm font-bold text-slate-600 tracking-tight">{item.sku}</td>
                       <td className="px-6 py-5 text-sm font-bold text-slate-600">{item.vendorCode}</td>
                       <td className="px-6 py-5 text-sm font-black text-slate-700">{item.itemName}</td>
                       <td className="px-6 py-5 text-sm font-bold text-slate-500">{item.sizePack}</td>
                       <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.case}</td>
                       <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.bpc}</td>
                       <td className="px-6 py-5 text-sm font-bold text-sky-500">{item.qty}</td>
                       <td className="px-6 py-5 text-sm font-bold text-slate-700">${item.cost}</td>
                       <td className="px-6 py-5 text-sm font-bold text-slate-700">{item.disc}</td>
                       <td className="px-6 py-5 text-sm font-black text-slate-800">${item.amount}</td>
                       <td className="px-6 py-5 text-sm font-bold text-slate-400 text-right">${item.rip.toFixed(2)}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>

         <div className="px-8 py-5 bg-slate-50/30 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
               <button className="h-10 px-6 rounded-xl border border-rose-100 bg-white text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 transition-all shadow-sm active:scale-95">
                  <Trash2 size={16} />
                  Remove
               </button>
               <button className="h-10 px-6 rounded-xl border border-rose-100 bg-white text-rose-500 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-50 transition-all shadow-sm active:scale-95">
                  <Trash2 size={16} />
                  Remove All
               </button>
            </div>
            
            <div className="flex items-center gap-3">
               <button className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  <Upload size={16} className="text-slate-400" />
                  Load CSV
               </button>
               <button className="h-10 px-6 rounded-xl border border-slate-200 bg-white text-slate-600 text-[11px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-slate-50 transition-all shadow-sm active:scale-95">
                  <Settings size={16} className="text-slate-400" />
                  Custom Fields
               </button>
            </div>
         </div>
      </div>
    </div>
  )
}

export default CreatePurchaseBill
