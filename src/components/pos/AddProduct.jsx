import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, X } from 'lucide-react'
import SelectorModal from '../common/SelectorModal'
import DataEntryModal from '../common/DataEntryModal'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'
import { 
  DEPARTMENTS, 
  SIZES, 
  BRANDS, 
  CATEGORIES, 
  SUB_CATEGORIES, 
  PACKS 
} from '../../mocks/selectorData'

const AttributeRow = ({ label, options = [], value, onChange, onOpenSelector }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[12px] font-bold uppercase tracking-wider text-[#64748B] ml-0.5">{label}</label>
    <div className="flex gap-2">
      <div className="relative flex-1 group">
        <select
          value={value}
          onChange={onChange}
          className="w-full h-10 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] font-bold text-[#1E293B] outline-none transition-all focus:border-[#0EA5E9] focus:bg-white focus:ring-4 focus:ring-[#0EA5E90D] appearance-none cursor-pointer"
        >
          <option value="">Select</option>
          {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#94A3B8] group-focus-within:text-[#0EA5E9] transition-colors">
          <Plus size={16} />
        </div>
      </div>
      <button 
        onClick={onOpenSelector}
        className="w-10 h-10 shrink-0 rounded-lg border border-[#E2E8F0] bg-white flex items-center justify-center text-[#94A3B8] hover:bg-[#F8FAFC] hover:text-[#0EA5E9] hover:border-[#0EA5E9] transition-all shadow-sm active:scale-95"
      >
        <span className="font-bold text-lg leading-none pb-1">...</span>
      </button>
    </div>
  </div>
)

const AddProduct = () => {
  const navigate = useNavigate()
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
  })

  const [selector, setSelector] = useState({
    isOpen: false,
    title: '',
    data: [],
    field: ''
  })

  const openSelector = (title, data, field) => {
    setSelector({ isOpen: true, title, data, field })
  }

  const handleSelect = (value) => {
    const selectedValue = typeof value === 'object' ? value.name : value
    setFormData({ ...formData, [selector.field]: selectedValue })
    setSelector({ ...selector, isOpen: false })
  }

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] animate-in fade-in duration-500 overflow-hidden -m-4 sm:-m-6">
      {/* Scrollable Content */}
      <div className="flex-1 overflow-auto p-6 scrollbar-hide">
        <div className="max-w-[1200px] mx-auto space-y-6">
          
          <Card>
            <div className="inline-block border-b-2 border-[#0EA5E9] pb-1 mb-6">
              <span className="text-[14px] font-bold text-[#1E293B] tracking-tight uppercase">Basic Information</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Input 
                label="SKU / UPC" 
                placeholder="Enter SKU"
                value={formData.sku}
                onChange={(e) => setFormData({...formData, sku: e.target.value})}
              />
              <div className="lg:col-span-2">
                <Input 
                  label="Product Name" 
                  placeholder="Enter Name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="md:col-span-2 lg:col-span-3 text-[14px]">
                <Input 
                  label="Description" 
                  placeholder="Enter details..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <AttributeRow 
                label="Department" 
                options={DEPARTMENTS}
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                onOpenSelector={() => openSelector('Select Department', DEPARTMENTS, 'department')}
              />
              <AttributeRow 
                label="Size" 
                options={SIZES}
                value={formData.size}
                onChange={(e) => setFormData({...formData, size: e.target.value})}
                onOpenSelector={() => openSelector('Select Size', SIZES, 'size')}
              />
              <AttributeRow 
                label="Brand" 
                options={BRANDS}
                value={formData.brand}
                onChange={(e) => setFormData({...formData, brand: e.target.value})}
                onOpenSelector={() => openSelector('Select Brand', BRANDS, 'brand')}
              />
              <AttributeRow 
                label="Category" 
                options={CATEGORIES.map(c => c.name)}
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                onOpenSelector={() => openSelector('Select Category', CATEGORIES, 'category')}
              />
              <AttributeRow 
                label="Sub-Category" 
                options={SUB_CATEGORIES}
                value={formData.subCategory}
                onChange={(e) => setFormData({...formData, subCategory: e.target.value})}
                onOpenSelector={() => openSelector('Select Sub-Category', SUB_CATEGORIES, 'subCategory')}
              />
              <AttributeRow 
                label="Pack" 
                options={PACKS}
                value={formData.pack}
                onChange={(e) => setFormData({...formData, pack: e.target.value})}
                onOpenSelector={() => openSelector('Select Pack', PACKS, 'pack')}
              />
            </div>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Card title="Financial Details" className="h-full">
                <div className="grid grid-cols-2 gap-4">
                   <Input label="Unit Cost" placeholder="0.00" type="number" />
                   <Input label="Unit Price" placeholder="0.00" type="number" />
                   <Input label="Margin (%)" placeholder="0.00" type="number" />
                   <Input label="Tax Rate" placeholder="Tax1" />
                </div>
             </Card>
             <Card title="Asset Management" className="h-full">
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-[#E2E8F0] rounded-lg p-6 bg-[#F8FAFC] group hover:border-[#0EA5E9] transition-colors cursor-pointer">
                   <Plus size={32} className="text-[#94A3B8] group-hover:text-[#0EA5E9] mb-2" />
                   <span className="text-[12px] font-bold text-[#64748B] uppercase">Upload Product Image</span>
                </div>
             </Card>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-[#E2E8F0] p-4 flex justify-end gap-3 z-10">
        <Button variant="outline" onClick={() => navigate('/pos/products')}>
          Cancel
        </Button>
        <Button onClick={() => navigate('/pos/products')} className="px-8">
          Save Product
        </Button>
      </div>
      
      {selector.isOpen && (
        <SelectorModal
          title={selector.title}
          data={selector.data}
          onSelect={handleSelect}
          onClose={() => setSelector({ ...selector, isOpen: false })}
        />
      )}
    </div>
  )
}

export default AddProduct
