import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Calendar, 
  ChevronDown, 
  Search, 
  Calculator, 
  Save, 
  X,
  Plus,
  Trash2,
  CheckCircle2
} from 'lucide-react'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'
import { useCalculator } from '../../context/CalculatorContext'

const CreatePurchaseOrder = () => {
  const { openCalculator } = useCalculator()
  const navigate = useNavigate()
  const [poDate, setPoDate] = useState('2021-10-11')
  const [items, setItems] = useState([
    { id: 1, sku: '5215', vendorCode: '', itemName: 'VENDANGE CHARDONNAY', lastCost: 48.00, caseUnits: 6, qty: 30.00, caseQty: 5.00, sizePack: '1.5 LT,Single' },
    { id: 2, sku: '6081', vendorCode: '', itemName: 'ANDRE STRAWBERRY', lastCost: 72.12, caseUnits: 12, qty: 12.00, caseQty: 1.00, sizePack: '750 ML,Single' },
    { id: 3, sku: '6219', vendorCode: '', itemName: 'ARBOR MIST PINK MOSCATO RASPBERRY', lastCost: 43.74, caseUnits: 6, qty: 6.00, caseQty: 1.00, sizePack: '1.5 LT,Single' },
    { id: 4, sku: '6548', vendorCode: '100968', itemName: 'DARK HORSE CABERNET', lastCost: 85.08, caseUnits: 12, qty: 12.00, caseQty: 1.00, sizePack: '750 ML,Single' },
  ])

  const [totalQty, setTotalQty] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)

  useEffect(() => {
    const qty = items.reduce((acc, item) => acc + (Number(item.qty) || 0), 0)
    const amt = items.reduce((acc, item) => acc + (item.lastCost * (Number(item.caseQty) || 0)), 0)
    setTotalQty(qty)
    setTotalAmount(amt)
  }, [items])

  const deleteItem = (id) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id, field, val) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: val } : item))
  }

  return (
    <div className="space-y-6">
      
      {/* Top Section - PO Details */}
      <Card noPadding className="border-slate-200 shadow-sm mb-6 !rounded-lg overflow-visible">
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-5">
          {/* Row 1 */}
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
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">PO Number</label>
            <input 
              type="text" 
              defaultValue="369"
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">PO ID</label>
            <input 
              type="text" 
              readOnly 
              value="POR2111011134127565"
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none cursor-not-allowed"
            />
          </div>
            <DatePickerField 
              label="PO Date"
              value={poDate}
              onChange={setPoDate}
            />

          {/* Row 2 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Vendor Order #</label>
            <input 
              type="text" 
              placeholder="Enter Vendor Order #"
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>
          <div className="lg:col-span-3 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Address</label>
            <input 
              type="text" 
              placeholder="Enter Address"
              className="w-full h-[38px] px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
            />
          </div>

          {/* Row 3 */}
          <div className="lg:col-span-4 flex flex-col gap-1.5">
            <label className="text-[12px] font-semibold text-slate-500 ml-0.5">Note</label>
            <textarea 
              placeholder="Add a note..."
              className="w-full h-[38px] px-3 py-2 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all resize-none"
            ></textarea>
          </div>
        </div>
      </Card>

      {/* Items Table Section */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden flex flex-col mb-6">
         <div className="overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse table-auto">
               <thead className="bg-[#f9fafb] border-b border-slate-200">
                  <tr>
                     <th className="px-4 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKU</th>
                     <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Vendor Code</th>
                     <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                     <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right">Last Cost</th>
                     <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center whitespace-nowrap">Case Units</th>
                     <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Quantity</th>
                     <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Case Qty</th>
                     <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-right whitespace-nowrap">Line Total</th>
                     <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size/Pack</th>
                     <th className="px-3 py-3.5 text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">Action</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors group">
                       <td className="px-4 py-3 text-[13px] font-semibold text-slate-600">{item.sku}</td>
                       <td className="px-3 py-3 text-[13px] font-medium text-slate-500">{item.vendorCode || '-'}</td>
                       <td className="px-3 py-3 text-[14px] font-bold text-slate-700">{item.itemName}</td>
                       <td className="px-3 py-3 text-[14px] font-semibold text-slate-700 text-right">{item.lastCost.toFixed(2)}</td>
                       <td className="px-3 py-3 text-[14px] font-semibold text-slate-700 text-center">{item.caseUnits}</td>
                       <td className="px-3 py-3 text-center">
                          <input 
                            type="text" 
                            className="w-20 h-8 rounded border border-slate-200 bg-white text-center text-[13px] font-bold text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                            value={item.qty}
                            onChange={(e) => updateItem(item.id, 'qty', e.target.value)}
                          />
                       </td>
                       <td className="px-3 py-3 text-center">
                          <input 
                            type="text" 
                            className="w-20 h-8 rounded border border-slate-200 bg-white text-center text-[13px] font-bold text-slate-800 outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 transition-all"
                            value={item.caseQty}
                            onChange={(e) => updateItem(item.id, 'caseQty', e.target.value)}
                          />
                       </td>
                       <td className="px-3 py-3 text-[14px] font-bold text-slate-700 text-right">{(item.lastCost * (Number(item.caseQty) || 0)).toFixed(2)}</td>
                       <td className="px-3 py-3 text-[13px] font-medium text-slate-500">{item.sizePack}</td>
                       <td className="px-3 py-3 text-center">
                          <button 
                            onClick={() => deleteItem(item.id)}
                            className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all opacity-0 group-hover:opacity-100"
                          >
                             <Trash2 size={16} />
                          </button>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
         <div className="p-4 bg-white border-t border-slate-100 flex justify-between items-center text-[12px] font-bold">
            <button className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 hover:border-sky-500 hover:text-sky-500 transition-all">
               Custom Fields
            </button>
            <div className="flex gap-10 text-slate-600 uppercase tracking-wider">
               <span>Total Qty: <span className="text-slate-900 ml-1">{totalQty.toFixed(2)}</span></span>
               <span>Total: <span className="text-slate-900 ml-1">$ {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
            </div>
         </div>
      </div>

      {/* Bottom Section - Add Item Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Left Panel: Add Item Form */}
         <Card noPadding className="lg:col-span-2 border-slate-200 shadow-sm !rounded-lg overflow-visible">
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SKU / UPC</label>
                  <input type="text" defaultValue="5018" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500" />
               </div>
               <div className="lg:col-span-3 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Code</label>
                  <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-medium text-slate-700 outline-none focus:border-sky-500" />
               </div>
               <div className="lg:col-span-4 flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Item Name</label>
                  <input type="text" readOnly value="COCO LOPEZ CREAM OF COCONUT 071845098309 15 OZ 24 PK" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-bold text-slate-600 outline-none" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Size</label>
                  <input type="text" readOnly value="15 OZ" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-600 outline-none" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Pack</label>
                  <input type="text" readOnly value="24-Pack" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-600 outline-none" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Order Qty</label>
                  <input type="text" readOnly value="0" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Last Order Date</label>
                  <input type="text" readOnly className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-[#f9fafb] text-[14px] font-medium text-slate-500 outline-none" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider font-poppins text-sky-600">Quantity</label>
                  <input type="text" className="w-full h-10 px-3 rounded-lg border border-sky-200 bg-white text-[14px] font-bold text-slate-800 outline-none focus:border-sky-500" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Unit Cost</label>
                  <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-800 outline-none focus:border-sky-500" />
               </div>
               <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Case Qty</label>
                  <input type="text" className="w-full h-10 px-3 rounded-lg border border-slate-200 bg-white text-[14px] font-bold text-slate-800 outline-none focus:border-sky-500" />
               </div>
               <div className="flex items-end">
                  <button className="w-full h-10 rounded-lg bg-[#0EA5E9] text-white text-[12px] font-bold uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-[#0284C7] transition-all active:scale-95 shadow-md shadow-sky-500/10">
                     <Plus size={18} />
                     Add Item
                  </button>
               </div>
            </div>
         </Card>

         {/* Right Panel: Summary */}
         <Card noPadding className="border-slate-200 shadow-sm !rounded-lg">
            <div className="p-6 flex flex-col h-full">
               <div className="grid grid-cols-2 gap-6 mb-auto">
                  <div className="flex flex-col gap-1">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Current Stock</span>
                     <span className="text-xl font-black text-slate-800">16</span>
                  </div>
                  <div className="flex flex-col gap-1 text-right">
                     <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Unit Price</span>
                     <span className="text-xl font-black text-slate-800">$ 4.99</span>
                  </div>
               </div>
               
               <div className="space-y-4 pt-6 mt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center text-[12px] font-bold text-slate-400 uppercase tracking-wider">
                     <span>Total</span>
                     <span className="text-slate-800 font-black">$ 2,430.34</span>
                  </div>
                  <div className="flex justify-between items-center bg-[#f0f9ff]/50 p-4 rounded-xl border border-sky-100">
                     <h3 className="text-[16px] font-black text-slate-800 tracking-tight font-poppins">Total</h3>
                     <span className="text-2xl font-black text-sky-600 tracking-tighter">
                        $ 2,430.34
                     </span>
                  </div>
               </div>
            </div>
         </Card>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center mt-8 border-t border-slate-200 pt-6">
         <button 
           onClick={openCalculator}
           className="h-10 px-5 rounded-lg border border-slate-300 bg-white text-slate-600 text-[12px] font-bold uppercase tracking-wider flex items-center gap-2 hover:border-[#0EA5E9] hover:text-[#0EA5E9] transition-all active:scale-95">
            <Calculator size={18} className="text-slate-400" />
            Calculator
         </button>
         
         <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/pos/purchase-orders')}
              className="px-8 h-10 rounded-lg bg-slate-200 text-slate-700 text-[13px] font-bold uppercase tracking-wider hover:bg-slate-300 transition-all active:scale-95"
            >
              Close
            </button>
            <button 
              className="px-10 h-10 rounded-lg bg-[#0EA5E9] text-white text-[13px] font-bold uppercase tracking-wider hover:bg-[#0284C7] transition-all active:scale-95 shadow-md shadow-sky-500/20"
            >
              Save
            </button>
         </div>
      </div>
    </div>
  )
}

export default CreatePurchaseOrder
