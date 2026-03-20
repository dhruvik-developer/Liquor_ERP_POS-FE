import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  ChevronDown, 
  Search, 
  Calculator, 
  Save, 
  X,
  CheckCircle2
} from 'lucide-react'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'
import { useCalculator } from '../../context/CalculatorContext'

const ReceivePurchaseOrder = () => {
  const { openCalculator } = useCalculator()
  const navigate = useNavigate()
  const [poDate, setPoDate] = useState('2021-11-10')
  const [receiveDate, setReceiveDate] = useState('2025-11-27')
  const [billDate, setBillDate] = useState('2025-11-27')
  const [dueDate, setDueDate] = useState('2025-12-27')
  const [items, setItems] = useState([
    { id: 1, sku: '5215', description: 'VENDANGE CHARDONNAY', sizePack: '1.5 LT,Single', cost: 8.00, caseCost: 48.00, caseUnits: 6, orderQty: 5.00, received: 5.00, selected: false },
    { id: 2, sku: '6081', description: 'ANDRE STRAWBERRY', sizePack: '750 ML,Single', cost: 6.01, caseCost: 72.12, caseUnits: 12, orderQty: 1.00, received: 1.00, selected: false },
    { id: 3, sku: '10061', description: 'APOTHIC CABERNET', sizePack: '750 ML,12-PACK', cost: 9.29, caseCost: 111.48, caseUnits: 12, orderQty: 4.00, received: 4.00, selected: true },
    { id: 4, sku: '11235', description: 'APOTHIC MERLOT', sizePack: '750 ML,12-PACK', cost: 9.29, caseCost: 111.48, caseUnits: 12, orderQty: 3.00, received: 3.00, selected: true },
  ])

  const [otherCharges, setOtherCharges] = useState(0)
  const [subTotal, setSubTotal] = useState(0)
  const [totalReceived, setTotalReceived] = useState(0)

  useEffect(() => {
    const sub = items.reduce((acc, item) => acc + (item.cost * (Number(item.received) || 0) * item.caseUnits), 0)
    const qty = items.reduce((acc, item) => acc + (Number(item.received) || 0), 0)
    setSubTotal(sub)
    setTotalReceived(qty)
  }, [items])

  const handleReceivedChange = (id, val) => {
    setItems(items.map(item => item.id === id ? { ...item, received: val } : item))
  }

  const toggleSelect = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, selected: !item.selected } : item))
  }

  return (
    <div className="space-y-6">
      
      {/* Top Section - Form Details */}
      <Card noPadding className="border-slate-200 shadow-sm mb-6 !rounded-lg overflow-visible">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-5">
          {/* Row 1 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Bill ID</label>
            <input 
              type="text" 
              readOnly 
              value="PBL2511270630375966"
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Select Vendor</label>
            <div className="relative">
              <select className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none appearance-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all">
                <option>Gallo Wines</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Select PO</label>
            <div className="relative">
              <select className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none appearance-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all">
                <option>369</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Row 2 */}
            <DatePickerField 
              label="PO Date"
              value={poDate}
              onChange={setPoDate}
            />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Vendor Contact</label>
            <input 
              type="text" 
              readOnly
              value="Gallo Wines"
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none cursor-not-allowed"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Vendor Order #</label>
            <input 
              type="text" 
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>

          {/* Row 3 */}
            <DatePickerField 
              label="Receive Date"
              value={receiveDate}
              onChange={setReceiveDate}
            />
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Purchase Bill #</label>
            <input 
              type="text" 
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>
            <DatePickerField 
              label="Purchase Bill Date"
              value={billDate}
              onChange={setBillDate}
            />

          {/* Row 4 */}
          <div className="flex items-center gap-3 pt-4">
            <div 
              onClick={() => {}} 
              className="w-5 h-5 rounded border-2 border-[#0EA5E9] bg-[#0EA5E9] flex items-center justify-center cursor-pointer transition-all shrink-0 shadow-sm"
            >
               <CheckCircle2 size={14} className="text-white" />
            </div>
            <div className="flex-1">
               <DatePickerField 
                 label="Due Date"
                 value={dueDate}
                 onChange={setDueDate}
               />
            </div>
          </div>
          <div className="lg:col-span-2 flex flex-col gap-1.5">
             <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Note</label>
             <textarea className="w-full h-[38px] px-3 py-2 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all resize-none"></textarea>
          </div>
        </div>
      </Card>

      {/* Middle Section - Items Table */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[400px]">
         <div className="overflow-x-auto scrollbar-hide flex-1">
            <table className="w-full text-left border-collapse table-auto">
               <thead className="bg-[#f9fafb] border-b border-slate-200">
                  <tr>
                     <th className="px-5 py-4 w-12 text-center">
                        <div className="w-4 h-4 rounded border-2 border-slate-200 bg-white m-auto" />
                     </th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Description</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size/Pack</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Cost</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Case Cost</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Case Units</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Order Qty</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Received</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Remaining</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Total Qty</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Landing</th>
                     <th className="px-3 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr 
                      key={item.id} 
                      className={`hover:bg-slate-50 transition-colors ${item.selected ? 'bg-sky-50/50' : item.id % 2 === 0 ? 'bg-slate-50/20' : ''}`}
                    >
                       <td className="px-5 py-3.5 text-center">
                          <div 
                            onClick={() => toggleSelect(item.id)}
                            className={`w-4 h-4 rounded border-2 m-auto flex items-center justify-center cursor-pointer transition-all ${
                              item.selected ? 'border-[#0EA5E9] bg-[#0EA5E9]' : 'border-slate-300 bg-white'
                            }`}
                          >
                             {item.selected && <CheckCircle2 size={12} className="text-white" />}
                          </div>
                       </td>
                       <td className="px-3 py-3.5 text-[13px] font-semibold text-slate-600">{item.sku}</td>
                       <td className="px-3 py-3.5 text-[14px] font-bold text-slate-700">{item.description}</td>
                       <td className="px-3 py-3.5 text-[13px] font-medium text-slate-500">{item.sizePack}</td>
                       <td className="px-3 py-3.5 text-[14px] font-semibold text-slate-700 text-right">{item.cost.toFixed(2)}</td>
                       <td className="px-3 py-3.5 text-[14px] font-semibold text-slate-700 text-right">{item.caseCost.toFixed(2)}</td>
                       <td className="px-3 py-3.5 text-[14px] font-semibold text-slate-700 text-center">{item.caseUnits}</td>
                       <td className="px-3 py-3.5 text-[14px] font-semibold text-slate-700 text-right">{item.orderQty.toFixed(2)}</td>
                       <td className="px-3 py-3.5 text-center">
                          <input 
                            type="text" 
                            className="w-16 h-[30px] rounded border border-yellow-200 bg-yellow-50 text-center text-[13px] font-bold text-slate-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400/10 transition-all"
                            value={item.received}
                            onChange={(e) => handleReceivedChange(item.id, e.target.value)}
                          />
                       </td>
                       <td className="px-3 py-3.5 text-[13px] font-semibold text-slate-400 text-right">0.00</td>
                       <td className="px-3 py-3.5 text-[13px] font-semibold text-slate-400 text-right">0.00</td>
                       <td className="px-3 py-3.5 text-[14px] font-bold text-slate-700 text-right">{(item.cost * (Number(item.received) || 0) * item.caseUnits / item.orderQty).toFixed(2)}</td>
                       <td className="px-3 py-3.5 text-[14px] font-bold text-slate-900 text-right">{(item.cost * (Number(item.received) || 0) * item.caseUnits).toFixed(2)}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* Bottom Section - Summary + Actions */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mt-6">
         <div>
            <button 
              onClick={openCalculator}
              className="h-10 px-5 rounded-lg border border-slate-300 bg-white text-slate-600 text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-all active:scale-95 shadow-sm">
               <Calculator size={18} className="text-slate-400" />
               Calculator
            </button>
         </div>

         <div className="w-full lg:max-w-md space-y-3">
            <div className="flex justify-between items-center px-2">
               <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Total Received :</span>
               <div className="w-[200px] h-[36px] px-3 rounded-lg border border-slate-100 bg-[#f9fafb] flex items-center justify-end text-[14px] font-bold text-slate-700">
                  {totalReceived}
               </div>
            </div>
            <div className="flex justify-between items-center px-2">
               <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Sub Total :</span>
               <div className="w-[200px] h-[36px] px-3 rounded-lg border border-slate-100 bg-[#f9fafb] flex items-center justify-end text-[14px] font-bold text-slate-700">
                  $ {subTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </div>
            </div>
            <div className="flex justify-between items-center px-2">
               <span className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Other Charges :</span>
               <input 
                 type="text" 
                 className="w-[200px] h-[36px] px-3 rounded-lg border border-slate-200 bg-white text-right text-[14px] font-bold text-slate-700 outline-none focus:border-sky-500 transition-all shadow-inner"
                 value={otherCharges}
                 onChange={(e) => setOtherCharges(Number(e.target.value) || 0)}
               />
            </div>

            <div className="bg-[#E0F2FE] border-l-4 border-[#0EA5E9] rounded-lg px-6 py-4 flex justify-between items-center shadow-sm">
               <h3 className="text-[16px] font-bold text-[#0369A1] uppercase tracking-wide">Total Payable :</h3>
               <span className="text-2xl font-black text-[#0369A1]">
                  $ {(subTotal + otherCharges).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </span>
            </div>
         </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end items-center gap-4 mt-8 border-t border-slate-200 pt-6">
         <button 
           onClick={() => navigate('/pos/purchase-orders')}
           className="px-6 h-[42px] rounded-lg bg-slate-200 text-slate-700 text-[13px] font-bold uppercase tracking-wider hover:bg-slate-300 transition-all active:scale-95"
         >
           Close
         </button>
         <button 
           className="px-10 h-[42px] rounded-lg bg-[#0EA5E9] text-white text-[13px] font-bold uppercase tracking-wider hover:bg-[#0284C7] transition-all active:scale-95 shadow-md shadow-sky-500/20 flex items-center gap-2"
         >
           <Save size={18} />
           Save
         </button>
      </div>
    </div>
  )
}

export default ReceivePurchaseOrder
