import React, { useState } from 'react'
import { X, Save } from 'lucide-react'

const QuickAddModal = ({ isOpen, onClose, type, onSave }) => {
  const [formData, setFormData] = useState({})

  if (!isOpen) return null

  const isDepartment = type?.toLowerCase().includes('department')
  const isSize = type?.toLowerCase().includes('size')
  const isBrand = type?.toLowerCase().includes('brand')
  const isCategory = type?.toLowerCase().includes('category') && !type?.toLowerCase().includes('sub')
  const isSubCategory = type?.toLowerCase().includes('sub') && type?.toLowerCase().includes('category')
  const isPack = type?.toLowerCase().includes('pack')

  const title = isDepartment ? "Department Data" : 
                isSize ? "Item Size Data" : 
                isBrand ? "Brand Data" :
                isCategory ? "Category Data" : 
                isSubCategory ? "Sub Category Data" :
                isPack ? "Pack Data" :
                "New Entry"

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = (closeAfterSave = true) => {
    onSave?.(formData)
    if (closeAfterSave) {
      onClose()
    } else {
      setFormData({}) // Reset for "Save & New"
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 font-poppins">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {isDepartment && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Department Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Localized Name"
                  value={formData.localName || ''}
                  onChange={(e) => handleChange('localName', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </>
          )}

          {isSize && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Size Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Localized Name"
                  value={formData.localName || ''}
                  onChange={(e) => handleChange('localName', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <select 
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 focus:text-slate-700 outline-none focus:border-sky-500 appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  <option value="Wine">Wine</option>
                  <option value="Liquor">Liquor</option>
                  <option value="Beer">Beer</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <select 
                  value={formData.uom || ''}
                  onChange={(e) => handleChange('uom', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 focus:text-slate-700 outline-none focus:border-sky-500 appearance-none cursor-pointer"
                >
                  <option value="">Select UOM</option>
                  <option value="OZ">OZ</option>
                  <option value="L">L</option>
                  <option value="ML">ML</option>
                </select>
              </div>
            </>
          )}

          {isBrand && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Brand Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Manufacturer"
                  value={formData.manufacturer || ''}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </>
          )}

          {isCategory && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Category Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Localized Name"
                  value={formData.localName || ''}
                  onChange={(e) => handleChange('localName', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <select 
                  value={formData.department || ''}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 focus:text-slate-700 outline-none focus:border-sky-500 appearance-none cursor-pointer"
                >
                  <option value="">Select Department</option>
                  <option value="Liquor">Liquor</option>
                  <option value="Wine">Wine</option>
                  <option value="Beer">Beer</option>
                </select>
              </div>
            </>
          )}

          {isSubCategory && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Sub Category Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Localized Name"
                  value={formData.localName || ''}
                  onChange={(e) => handleChange('localName', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <select 
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 focus:text-slate-700 outline-none focus:border-sky-500 appearance-none cursor-pointer"
                >
                  <option value="">Select Category</option>
                  <option value="Wine">Wine</option>
                  <option value="Liquor">Liquor</option>
                  <option value="Beer">Beer</option>
                </select>
              </div>
            </>
          )}

          {isPack && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Pack Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Localized Name"
                  value={formData.localName || ''}
                  onChange={(e) => handleChange('localName', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-100">
           <button 
             onClick={() => handleSave(true)}
             className="px-6 h-11 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95"
           >
              <Save size={16} />
              Save & Close
           </button>
           <button 
             onClick={() => handleSave(false)}
             className="px-6 h-11 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95"
           >
              <Save size={16} />
              Save & New
           </button>
        </div>
      </div>
    </div>
  )
}

export default QuickAddModal
