import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  ChevronDown, 
  Search, 
  Calculator, 
  Save, 
  X,
  Trash2,
  CheckCircle2,
  RefreshCcw,
  MinusCircle
} from 'lucide-react'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'
import { useCalculator } from '../../context/CalculatorContext'
import useApi from '../../hooks/useApi'

const CreatePurchaseReturn = () => {
  const { openCalculator } = useCalculator()
  const navigate = useNavigate()
  const [returnDate, setReturnDate] = useState('2025-11-26')
  const [billDate, setBillDate] = useState('2025-11-25')
  const [dueDate, setDueDate] = useState('2025-11-26')
  const [items, setItems] = useState([
    { id: 1, sr: 1, sku: '6409', description: 'CAMPO VIEJO CRIANZA', sizePack: '750 ML', unitCost: 10.20, qtyReceived: 12.000, qtyReturn: 12.000, landingCost: 122.990, amount: 122.990, selected: true },
    { id: 2, sr: 2, sku: '5302', description: 'SUTTER HOME CABERNET', sizePack: '187 ML 4-Pack', unitCost: 6.000, qtyReceived: 12.000, qtyReturn: 6.000, landingCost: 36.000, amount: 36.000, selected: true },
    { id: 3, sr: 3, sku: '5301', description: 'SUTTER HOME CHARDONNAY', sizePack: '187 ML 4-Pack', unitCost: 6.000, qtyReceived: 12.000, qtyReturn: 6.000, landingCost: 36.000, amount: 36.000, selected: true },
    { id: 4, sr: 4, sku: '5955', description: 'SUTTER HOME PINOT GRIGIO', sizePack: '187 ML 4-Pack', unitCost: 6.000, qtyReceived: 12.000, qtyReturn: 6.000, landingCost: 36.000, amount: 36.000, selected: true },
    { id: 5, sr: 5, sku: '7201', description: 'SUTTER HOME SAUVIGNON BLAN', sizePack: '187 ML 4-Pack', unitCost: 6.000, qtyReceived: 12.000, qtyReturn: 6.000, landingCost: 36.000, amount: 36.000, selected: true },
  ])

  const [totalReturns, setTotalReturns] = useState(47)
  const [subTotal, setSubTotal] = useState(303.960)
  const [otherCharges, setOtherCharges] = useState(0.000)

  useEffect(() => {
    const qty = items.reduce((acc, item) => acc + (Number(item.qtyReturn) || 0), 0)
    const sub = items.reduce((acc, item) => acc + (item.unitCost * (Number(item.qtyReturn) || 0)), 0)
    // Synchronize for demo purposes if needed, but keeping user numbers for static look
  }, [items])

  const handleReturnChange = (id, val) => {
    setItems(items.map(item => item.id === id ? { ...item, qtyReturn: val } : item))
  }

  const toggleSelect = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, selected: !item.selected } : item))
  }

  const { post, loading, error: apiError } = useApi()

  const handleSave = async () => {
    try {
      const selectedItems = items.filter(i => i.selected)
      if (selectedItems.length === 0) return
      
      await post('/purchasing/returns/', {
        vendor_id: 1, // static representation
        return_date: returnDate,
        items: selectedItems.map(i => ({
          product_id: i.id,
          quantity_returned: i.qtyReturn,
          unit_price: i.unitCost
        }))
      })
      navigate('/pos/purchase-return')
    } catch(err) {
      console.error(err)
    }
  }

  return (
    <div className="space-y-6">
      {apiError && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold">
          {apiError}
        </div>
      )}
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-[20px] font-black text-slate-800 tracking-tight">Create Purchase Return</h2>
        </div>

        <Card noPadding className="border-slate-200 shadow-sm !rounded-lg overflow-visible bg-white p-6 lg:p-8">
          <div className="space-y-6">
            {/* Search Section */}
            <div className="flex flex-col gap-1.5">
               <label className="text-[12px] font-bold text-slate-400 ml-0.5">Search Inv *</label>
               <div className="flex gap-4">
                  <div className="relative flex-[0.8]">
                     <input 
                       type="text" 
                       defaultValue="175936"
                       className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-sm"
                     />
                  </div>
                  <button className="flex-[0.2] h-[42px] rounded-lg bg-[#0EA5E9] text-white text-[13px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#0284C7] transition-all active:scale-95 shadow-lg shadow-sky-500/20">
                     <Search size={18} />
                     Search
                  </button>
               </div>
            </div>

            {/* Grid Form Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
              {/* Row 1 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 ml-0.5">Select Vendor</label>
                <div className="relative">
                  <select className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 transition-all cursor-pointer">
                    <option>Allied Beverages</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 ml-0.5">Select Bill</label>
                <div className="relative">
                  <select className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 transition-all cursor-pointer">
                    <option>175936</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 ml-0.5">ID</label>
                <input 
                  type="text" 
                  readOnly 
                  value="PBL25112603541649053"
                  className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-[#f8fafc] text-[14px] font-bold text-slate-400 outline-none"
                />
              </div>

              {/* Row 2 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 ml-0.5">Vendor Contact</label>
                <input 
                  type="text" 
                  readOnly
                  value="Allied Beverages"
                  className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-[#f8fafc] text-[14px] font-bold text-slate-400 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 ml-0.5">Bill ID</label>
                <input 
                  type="text" 
                  readOnly
                  value="PBL25112513070928189"
                  className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-[#f8fafc] text-[14px] font-bold text-slate-400 outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 ml-0.5">Return Bill *</label>
                <input 
                  type="text" 
                  readOnly
                  value="PBL25112603541649053"
                  className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-[#f8fafc] text-[14px] font-bold text-slate-400 outline-none"
                />
              </div>

              {/* Row 3 */}
              <DatePickerField 
                label="Return Date"
                value={returnDate}
                onChange={setReturnDate}
              />
              <DatePickerField 
                label="Bill Date"
                value={billDate}
                onChange={setBillDate}
              />
              <DatePickerField 
                label="Due Date"
                value={dueDate}
                onChange={setDueDate}
              />

              {/* Row 4 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-400 ml-0.5">Paid Status</label>
                <div className="relative">
                  <select className="w-full h-[42px] px-4 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none appearance-none focus:border-sky-500 transition-all cursor-pointer">
                    <option>Paid</option>
                    <option>Unpaid</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              <div className="lg:col-span-2 flex flex-col gap-1.5">
                 <label className="text-[12px] font-bold text-slate-400 ml-0.5">Note</label>
                 <textarea className="w-full h-[42px] px-4 py-2 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all resize-none shadow-sm"></textarea>
              </div>
            </div>
          </div>
        </Card>

        {/* Table Section */}
        <Card noPadding className="border-slate-200 shadow-sm !rounded-lg overflow-hidden bg-white">
          <div className="overflow-x-auto scrollbar-hide">
             <table className="w-full text-left border-collapse table-auto">
                <thead className="bg-[#f9fafb] border-b border-slate-200">
                   <tr>
                      <th className="px-4 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">SR #</th>
                      <th className="px-4 py-4 w-12 text-center">
                         <div className="w-4 h-4 rounded border-2 border-sky-500 bg-sky-500 flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-white" />
                         </div>
                      </th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">SKU</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Item Description</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">Size/Pack</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Unit Cost</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Qty. Received</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center">Qty. Return</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Landing Cost</th>
                      <th className="px-3 py-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider text-right">Amount</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {items.map((item) => (
                     <tr 
                       key={item.id} 
                       className="group hover:bg-slate-50 transition-colors"
                     >
                        <td className="px-4 py-4 text-[13px] font-bold text-slate-400 text-center">{item.sr}</td>
                        <td className="px-4 py-4 text-center">
                           <div 
                             onClick={() => toggleSelect(item.id)}
                             className={`w-4 h-4 rounded border-2 m-auto flex items-center justify-center cursor-pointer transition-all ${
                               item.selected ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white'
                             }`}
                           >
                              {item.selected && <CheckCircle2 size={12} className="text-white" />}
                           </div>
                        </td>
                        <td className="px-3 py-4 text-[13px] font-bold text-slate-600">{item.sku}</td>
                        <td className="px-3 py-4 text-[13px] font-black text-slate-800 uppercase tracking-tight">{item.description}</td>
                        <td className="px-3 py-4 text-[13px] font-bold text-slate-500">{item.sizePack}</td>
                        <td className="px-3 py-4 text-[14px] font-black text-slate-800 text-right">{item.unitCost.toFixed(3)}</td>
                        <td className="px-3 py-4 text-[14px] font-black text-slate-800 text-center">{item.qtyReceived.toFixed(3)}</td>
                        <td className="px-3 py-4 text-center">
                           <input 
                             type="text" 
                             className="w-[80px] h-[34px] rounded border border-yellow-200 bg-yellow-50 text-center text-[13px] font-black text-slate-800 outline-none focus:border-yellow-400 transition-all"
                             value={item.qtyReturn.toFixed(3)}
                             onChange={(e) => handleReturnChange(item.id, e.target.value)}
                           />
                        </td>
                        <td className="px-3 py-4 text-[14px] font-black text-slate-800 text-right">{item.landingCost.toFixed(3)}</td>
                        <td className="px-3 py-4 text-[14px] font-black text-slate-800 text-right">{item.amount.toFixed(3)}</td>
                     </tr>
                   ))}
                </tbody>
             </table>
          </div>
        </Card>

        {/* Action Buttons & Summary Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
           {/* Left side actions */}
           <div className="flex flex-wrap items-center gap-4">
              <button className="h-[44px] px-6 rounded-lg bg-[#F43F5E] text-white text-[12px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-500/20">
                 <Trash2 size={20} className="p-0.5 bg-white/20 rounded-full" />
                 Remove
              </button>
              <button className="h-[44px] px-6 rounded-lg bg-[#9F1239] text-white text-[12px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-rose-900 transition-all active:scale-95 shadow-lg shadow-rose-900/20">
                 <X size={20} className="p-0.5 bg-white/20 rounded-full" />
                 Remove All
              </button>
              <button 
                onClick={openCalculator}
                className="h-[44px] px-6 rounded-lg border-2 border-slate-200 bg-white text-slate-600 text-[12px] font-black uppercase tracking-widest flex items-center gap-2 hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-all active:scale-95 shadow-sm">
                 <Calculator size={18} />
                 Calculator
              </button>
           </div>

           {/* Right side summary */}
           <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8 space-y-6">
              <div className="flex justify-between items-center">
                 <span className="text-[14px] font-bold text-slate-500">Total Returns:</span>
                 <div className="w-[120px] h-[42px] px-4 rounded-lg bg-[#f8fafc] flex items-center justify-end text-[16px] font-black text-slate-800 bg-slate-50 border border-slate-100 italic">
                    {totalReturns}
                 </div>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[14px] font-bold text-slate-500">Sub Total:</span>
                 <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-lg font-black italic">$</span>
                    <div className="w-[160px] h-[42px] px-4 rounded-lg bg-[#f8fafc] flex items-center justify-end text-[16px] font-black text-slate-800 bg-slate-50 border border-slate-100 italic">
                       {subTotal.toFixed(3)}
                    </div>
                 </div>
              </div>
              <div className="flex justify-between items-center">
                 <span className="text-[14px] font-bold text-slate-500">Other Charges:</span>
                 <div className="flex items-center gap-3">
                    <span className="text-slate-400 text-lg font-black italic">$</span>
                    <input 
                      type="text" 
                      className="w-[160px] h-[42px] px-4 rounded-lg border border-slate-200 bg-white text-right text-[16px] font-black text-slate-800 outline-none focus:border-sky-500 transition-all shadow-inner italic"
                      value={otherCharges.toFixed(3)}
                    />
                 </div>
              </div>

              <div className="bg-[#E0F2FE] border border-sky-100 rounded-lg px-8 py-5 flex justify-between items-center shadow-sm -mx-2">
                 <h3 className="text-[16px] font-black text-[#0EA5E9] uppercase tracking-wider">Total Payable:</h3>
                 <div className="flex items-center gap-4">
                    <span className="text-sky-400 text-2xl font-black italic">$</span>
                    <span className="text-3xl font-black text-[#0EA5E9] tracking-tight">
                       {(subTotal + otherCharges).toFixed(3)}
                    </span>
                 </div>
              </div>
           </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex justify-end items-center gap-4 pt-4">
           <button 
             onClick={handleSave}
             disabled={loading}
             className="h-[48px] px-12 rounded-lg bg-[#0EA5E9] text-white text-[14px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#0284C7] transition-all active:scale-95 shadow-xl shadow-sky-500/20 disabled:opacity-50"
           >
              <Save size={20} />
              {loading ? 'Saving...' : 'Save'}
           </button>
           <button 
             onClick={() => navigate('/pos/purchase-return')}
             className="h-[48px] px-12 rounded-lg bg-[#334155] text-white text-[14px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-[#1e293b] transition-all active:scale-95 shadow-lg shadow-slate-500/10"
           >
              <X size={20} />
              Close
           </button>
        </div>

      </div>
  )
}

export default CreatePurchaseReturn
