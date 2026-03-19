import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Save, 
  Plus, 
  Trash2, 
  Calculator, 
  Upload, 
  List,
  ChevronDown,
  X
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
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-y-auto pb-10 -m-4 sm:-m-6 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">Create Purchase Bill</h1>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => navigate('/pos/purchase-bills')}>
            Close
          </Button>
          <Button onClick={() => navigate('/pos/purchase-bills')} className="gap-2 px-8">
            <Save size={18} />
            Save Bill
          </Button>
        </div>
      </div>

      {/* Top Form Section */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Select Vendor</label>
            <div className="relative group">
              <select className="w-full h-10 px-4 rounded-lg border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#1E293B] outline-none appearance-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E90D] transition-all">
                <option>Allied Beverages</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
            </div>
          </div>
          <Input label="Invoice #" placeholder="Enter invoice number" />
          <div className="flex items-end gap-3">
            <div className="flex-1 space-y-1.5">
              <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Sales Person</label>
              <div className="relative group">
                <select className="w-full h-10 px-4 rounded-lg border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#1E293B] outline-none appearance-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E90D] transition-all">
                  <option>Select</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={16} />
              </div>
            </div>
            <Button variant="outline" className="h-10 w-10 p-0 flex items-center justify-center">
              <Plus size={18} />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
          <Input label="Bill Date" type="date" defaultValue="2025-11-24" />
          <Input label="Due Date" type="date" defaultValue="2025-12-24" />
          <Input label="Delivery Date" type="date" defaultValue="2025-11-24" />
          <Input label="Internal Note" placeholder="Comments..." />
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Item Selection Card */}
        <div className="lg:col-span-8 space-y-6">
          <Card title="Item Selection" className="relative group">
            <div className="absolute top-0 left-0 w-1 bg-[#0EA5E9] h-full rounded-l-lg"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-6">
                <div className="grid grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <Input label="SKU / UPC" defaultValue="5008" />
                  </div>
                  <Input label="Qty" defaultValue="1" className="text-center" />
                  <Input label="BPC" defaultValue="24" className="text-center" />
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Item Name</label>
                    <select className="w-full h-10 px-4 rounded-lg border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#1E293B] outline-none">
                      <option>REDBULL 8.4 OZ 24-PACK</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer group w-fit">
                    <input type="checkbox" className="w-4 h-4 rounded border-[#E2E8F0] text-[#0EA5E9] focus:ring-[#0EA5E90D]" />
                    <span className="text-[14px] font-medium text-[#64748B] group-hover:text-[#0EA5E9]">Loose bottles only</span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input label="Case Cost" defaultValue="38.49" icon={() => <span className="text-[12px] font-bold">$</span>} />
                  <Input label="Unit Cost" defaultValue="1.60" icon={() => <span className="text-[12px] font-bold">$</span>} readOnly />
                </div>
              </div>

              <div className="space-y-6 flex flex-col justify-between">
                <div className="bg-[#0EA5E90D] p-5 rounded-lg border border-[#0EA5E91A] flex flex-col gap-2">
                  <div className="flex justify-between items-center text-[#0EA5E9]">
                    <span className="text-[12px] font-bold uppercase tracking-wider">Line Total</span>
                    <span className="text-[24px] font-black tracking-tight">$38.49</span>
                  </div>
                  <div className="flex justify-between items-center text-[#64748B]">
                    <span className="text-[12px] font-bold uppercase tracking-wider">Net Units</span>
                    <span className="text-[18px] font-bold">24.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                   <div className="space-y-3">
                      <PriceStat label="Curr Cost" value="1.60" />
                      <PriceStat label="Curr Margin" value="54.15 %" />
                      <PriceStat label="Sale Price" value="3.49" highlight />
                   </div>
                   <div className="space-y-3">
                      <PriceStat label="New Cost" value="1.60" />
                      <PriceStat label="Margin" value="54.15 %" />
                      <PriceStat label="Suggested" value="3.49" highlight />
                   </div>
                </div>

                <Button className="w-full h-12 gap-2 mt-2">
                  <Plus size={18} />
                  Add Item to List
                </Button>
              </div>
            </div>
          </Card>

          {/* Table Section */}
          <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[14px]">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">SKU</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Item Name</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Qty</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Cost</th>
                    <th className="px-5 py-3 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {billItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-5 py-4 font-medium text-[#64748B]">{item.sku}</td>
                      <td className="px-5 py-4 font-bold text-[#1E293B]">{item.itemName}</td>
                      <td className="px-5 py-4 text-center font-bold text-[#1E293B]">{item.qty}</td>
                      <td className="px-5 py-4 text-right font-bold text-[#1E293B]">${item.cost}</td>
                      <td className="px-5 py-4 text-right font-black text-[#0EA5E9]">${item.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-[#F8FAFC] flex items-center justify-between border-t border-[#E2E8F0]">
              <div className="flex gap-2">
                <Button variant="outline" className="text-rose-500 border-rose-100 p-2 h-9">
                  <Trash2 size={16} />
                </Button>
                <Button variant="outline" className="text-rose-500 border-rose-100 p-2 h-9 text-[12px]">
                  Clear All
                </Button>
              </div>
              <Button variant="outline" className="h-9 text-[12px] gap-2">
                <Upload size={14} />
                Load CSV
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-4 h-full">
          <Card title="Invoice Summary" className="h-full flex flex-col border-l-4 border-l-[#1E293B]">
            <div className="space-y-4 flex-1 py-4">
              {[
                { label: 'Sub Total', value: '$ 0.00' },
                { label: 'Tax 1', value: '$ 0.00' },
                { label: 'Special Fees', value: '$ 0.00' },
                { label: 'Container Dep.', value: '$ 0.00' },
                { label: 'Return Credit', value: '$ 0.00', isRed: true },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">{item.label}</span>
                  <span className={`text-[14px] font-black ${item.isRed ? 'text-rose-500' : 'text-[#1E293B]'}`}>{item.value}</span>
                </div>
              ))}
            </div>

            <div className="py-6 border-t border-[#E2E8F0] flex items-center justify-between mt-6 bg-[#1E293B] -mx-8 px-8 mb-4">
              <h3 className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-widest">Total Payable</h3>
              <span className="text-[28px] font-black text-white tracking-tight">$ 0.00</span>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <SummaryStat label="Qty" value="1" />
              <SummaryStat label="Units" value="24" />
              <SummaryStat label="Items" value="1" />
            </div>

            <Button variant="outline" className="w-full h-11 bg-white mt-6 gap-2">
              <Calculator size={18} />
              Calculator
            </Button>
          </Card>
        </div>
      </div>
    </div>
  )
}

const PriceStat = ({ label, value, highlight }) => (
  <div className="flex items-center justify-between group">
    <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider group-hover:text-[#0EA5E9] transition-colors">{label}:</span>
    <span className={`text-[12px] font-black tracking-tight ${highlight ? 'text-[#0EA5E9]' : 'text-[#1E293B]'}`}>
      {highlight && '$'} {value}
    </span>
  </div>
)

const SummaryStat = ({ label, value }) => (
  <div className="text-center p-3 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
    <p className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">{label}</p>
    <p className="text-[18px] font-black text-[#1E293B]">{value}</p>
  </div>
)

export default CreatePurchaseBill
