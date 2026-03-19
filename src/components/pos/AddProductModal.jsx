import React, { useState } from 'react'
import { X, Plus, Image as ImageIcon, Trash2, Search } from 'lucide-react'
import SelectionModal from '../common/SelectionModal'
import { 
  DEPARTMENTS, 
  SIZES, 
  BRANDS, 
  CATEGORIES, 
  SUB_CATEGORIES, 
  PACKS 
} from '../../mocks/selectorData'

const InputField = ({ label, value, onChange, placeholder, type = "text", prefix, suffix, className = "" }) => (
  <div className={`flex flex-col gap-1.5 group ${className}`}>
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-sky-500 transition-colors">
      {label}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{suffix}</span>
      )}
    </div>
  </div>
)

const SelectField = ({ label, value, onOpenSelector, className = "" }) => (
  <div className={`flex flex-col gap-1.5 group ${className}`}>
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-sky-500 transition-colors">
      {label}
    </label>
    <div className="flex gap-2">
      <div className="relative flex-1">
        <input
          readOnly
          value={value || "Select"}
          onClick={onOpenSelector}
          className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 cursor-pointer text-left"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      <button 
        onClick={onOpenSelector}
        className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-sky-500 hover:border-sky-500 transition-all font-black text-xl shadow-sm pb-1"
      >
        ...
      </button>
    </div>
  </div>
)

const AddProductModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    sku: '',
    name: '',
    description: '',
    department: '',
    size: '',
    brand: '',
    category: '',
    subCategory: '',
    pack: '',
    nonTaxable: false,
    tax: 'Tax1',
    isInactive: false,
    buyAsCase: false,
    unitsInCase: 0,
    caseCost: 0,
    casePrice: 0,
    nonDiscountable: false,
    unitCost: 0,
    margin: 0,
    buyDown: 0,
    markup: 0,
    unitPrice: 0,
    msrp: 0,
    minPrice: 0,
    upcs: '',
    minWarnQty: 0
  })

  const [selector, setSelector] = useState({
    isOpen: false,
    title: '',
    data: [],
    field: ''
  })

  if (!isOpen) return null

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const openSelector = (title, data, field) => {
    setSelector({ isOpen: true, title, data, field })
  }

  const handleSelect = (value) => {
    const selectedValue = typeof value === 'object' ? value.name : value
    handleChange(selector.field, selectedValue)
    setSelector({ ...selector, isOpen: false })
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-auto">
      <div className="w-full max-w-6xl bg-[#f0f4f8] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        {/* Header (Hidden in provided layout but good for closing) */}
        <div className="hidden items-center justify-between p-6 bg-white border-b border-slate-200">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Add New Product</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto scrollbar-hide">
          
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField 
                label="SKU" 
                value={formData.sku} 
                onChange={(e) => handleChange('sku', e.target.value)} 
                placeholder="Enter SKU"
              />
              <InputField 
                label="Name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="Product Name"
              />
            </div>
            <div className="flex flex-col gap-1.5 group mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-sky-500 transition-colors">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description"
                className="w-full h-24 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <SelectField label="Department" value={formData.department} onOpenSelector={() => openSelector('Select Department', DEPARTMENTS, 'department')} />
              <SelectField label="Size" value={formData.size} onOpenSelector={() => openSelector('Select Size', SIZES, 'size')} />
              <SelectField label="Brand" value={formData.brand} onOpenSelector={() => openSelector('Select Brand', BRANDS, 'brand')} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <SelectField label="Category" value={formData.category} onOpenSelector={() => openSelector('Select Category', CATEGORIES, 'category')} />
              <SelectField label="Sub-Category" value={formData.subCategory} onOpenSelector={() => openSelector('Select Sub-Category', SUB_CATEGORIES, 'subCategory')} />
              <SelectField label="Pack" value={formData.pack} onOpenSelector={() => openSelector('Select Pack', PACKS, 'pack')} />
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  checked={formData.nonTaxable} 
                  onChange={() => handleChange('nonTaxable', !formData.nonTaxable)}
                  className="w-5 h-5 rounded-full border-2 border-slate-300 text-sky-500 focus:ring-primary appearance-none checked:border-sky-500 checked:bg-sky-500 transition-all cursor-pointer" 
                />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 transition-colors">Non Taxable</span>
              </label>

              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tax</label>
                <select 
                  value={formData.tax}
                  onChange={(e) => handleChange('tax', e.target.value)}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
                >
                  <option value="Tax1">Tax1</option>
                  <option value="Tax2">Tax2</option>
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.isInactive} 
                  onChange={(e) => handleChange('isInactive', e.target.checked)}
                  className="w-5 h-5 rounded-lg border-2 border-slate-300 text-sky-500 focus:ring-primary appearance-none checked:border-sky-500 checked:bg-sky-500 transition-all cursor-pointer" 
                />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 transition-colors">Item is Inactive</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (4/12) */}
            <div className="lg:col-span-4 space-y-8">
              {/* Section 2: Buy As Case */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <input 
                    type="checkbox" 
                    id="buyAsCase"
                    checked={formData.buyAsCase} 
                    onChange={(e) => handleChange('buyAsCase', e.target.checked)}
                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-sky-500 focus:ring-primary appearance-none checked:border-sky-500 checked:bg-sky-500 transition-all cursor-pointer" 
                  />
                  <label htmlFor="buyAsCase" className="text-sm font-black uppercase tracking-widest text-slate-800 cursor-pointer">Buy As Case</label>
                </div>
                <div className="space-y-4">
                  <InputField label="Units In Case" value={formData.unitsInCase} onChange={(e) => handleChange('unitsInCase', e.target.value)} />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField label="Case Cost" prefix="$" value={formData.caseCost} onChange={(e) => handleChange('caseCost', e.target.value)} />
                    <InputField label="Case Price" prefix="$" value={formData.casePrice} onChange={(e) => handleChange('casePrice', e.target.value)} />
                  </div>
                  <label className="flex items-center gap-3 cursor-pointer group pt-2">
                    <input 
                      type="checkbox" 
                      checked={formData.nonDiscountable} 
                      onChange={(e) => handleChange('nonDiscountable', e.target.checked)}
                      className="w-5 h-5 rounded-lg border-2 border-slate-300 text-sky-500 focus:ring-primary appearance-none checked:border-sky-500 checked:bg-sky-500 transition-all cursor-pointer" 
                    />
                    <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 transition-colors">Non Discountable</span>
                  </label>
                </div>
              </div>

              {/* Section 4: Image */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6 font-poppins">Image</h3>
                <div className="space-y-4">
                   <button className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95">
                      <Plus size={18} />
                      Add Image
                   </button>
                   <button className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95 text-center">
                      Remove Image
                   </button>
                </div>
              </div>
            </div>

            {/* Right Column (8/12): Price & Stock */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-1 px-6 border-b border-slate-100">
                <div className="flex gap-8">
                  <button className="px-1 py-4 text-sky-500 border-b-2 border-sky-500 text-xs font-black uppercase tracking-widest">Price & Stock</button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Cost & Pricing Sub-section */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">Cost & Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InputField label="Unit Cost" prefix="$" value={formData.unitCost} onChange={(e) => handleChange('unitCost', e.target.value)} />
                    <InputField label="Margin" suffix="%" value={formData.margin} onChange={(e) => handleChange('margin', e.target.value)} />
                    <InputField label="BuyDown" prefix="$" value={formData.buyDown} onChange={(e) => handleChange('buyDown', e.target.value)} />
                    <InputField label="Markup" suffix="%" value={formData.markup} onChange={(e) => handleChange('markup', e.target.value)} />
                    <div className="md:col-span-2">
                      <InputField label="Unit Price" prefix="$" value={formData.unitPrice} onChange={(e) => handleChange('unitPrice', e.target.value)} />
                    </div>
                    <InputField label="MSRP" prefix="$" value={formData.msrp} onChange={(e) => handleChange('msrp', e.target.value)} />
                    <InputField label="Min. Price" prefix="$" value={formData.minPrice} onChange={(e) => handleChange('minPrice', e.target.value)} />
                  </div>
                </div>

                {/* Stock Information Sub-section */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">Stock Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 space-y-4">
                      <div className="flex flex-col gap-1.5 group">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Enter UPCs</label>
                         <textarea 
                           value={formData.upcs}
                           onChange={(e) => handleChange('upcs', e.target.value)}
                           placeholder="Enter UPCs"
                           className="w-full h-32 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 focus:bg-white resize-none"
                         />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                         <button className="h-10 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 hover:border-sky-500 hover:text-sky-500 transition-all">Add UPC</button>
                         <button className="h-10 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 hover:border-sky-500 hover:text-sky-500 transition-all">Auto UPC</button>
                         <button className="h-10 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 hover:border-red-500 hover:text-red-500 transition-all">Remove</button>
                      </div>
                    </div>
                    <div className="md:col-span-4">
                      <InputField label="Min. Warn Qty" value={formData.minWarnQty} onChange={(e) => handleChange('minWarnQty', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-6 px-8 border-t border-slate-200 flex justify-end gap-4">
          <button 
            onClick={onClose}
            className="px-8 h-12 rounded-xl bg-slate-800 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-slate-900 transition-all active:scale-95"
          >
            Close
          </button>
          <button 
            onClick={onClose}
            className="px-10 h-12 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95"
          >
            Save
          </button>
        </div>

        {selector.isOpen && (
          <SelectionModal
            isOpen={selector.isOpen}
            title={selector.title}
            data={selector.data}
            onSelect={handleSelect}
            onClose={() => setSelector({ ...selector, isOpen: false })}
          />
        )}
      </div>
    </div>
  )
}

export default AddProductModal
