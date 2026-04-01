import React, { useState, useRef } from 'react'
import { X, Save, Plus, Image as ImageIcon, Pencil, ImagePlus } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import useApi from '../../hooks/useApi'

const BaseModal = ({ title, onClose, children, footer }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F172A66] backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-[500px] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-[#E2E8F0]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#E2E8F0]">
          <h2 className="text-[22px] font-black text-[#1E293B] tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[#94A3B8] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-lg transition-all"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {children}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex justify-end gap-3">
          {footer}
        </div>
      </div>
    </div>
  )
}

export const CardDataModal = ({ onClose, item, refetch }) => {
  const [formData, setFormData] = React.useState({
    name: item?.name || '',
    fee: item?.fee || '',
    status: item?.status ?? true
  })
  
  const { post, put, loading } = useApi()

  const handleSave = async (closeAfter = true) => {
    if (!formData.name || !formData.fee) return alert('Name and Fee are required')
    
    try {
      if (item?.id) {
        await put(`/inventory/card-setups/${item.id}/`, formData)
      } else {
        await post('/inventory/card-setups/', formData)
      }
      
      refetch()
      if (closeAfter) {
        onClose()
      } else {
        setFormData({ name: '', fee: '', status: true })
        alert('Card setup saved successfully!')
      }
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  return (
    <BaseModal 
      title="Card Data" 
      onClose={onClose}
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button 
            onClick={() => handleSave(true)} 
            disabled={loading}
            className="gap-2 px-6 h-12 bg-[#0EA5E9] font-bold"
          >
            <Save size={18} />
            Save & Close
          </Button>
          <Button 
            onClick={() => handleSave(false)} 
            disabled={loading}
            className="gap-2 px-6 h-12 bg-[#0EA5E9] font-bold"
          >
            <Save size={18} />
            Save & New
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <Input 
          label="Name*" 
          placeholder="Enter card name" 
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required 
        />
        <div className="w-1/2">
          <Input 
            label="Fee*" 
            placeholder="0.00" 
            value={formData.fee}
            onChange={(e) => setFormData(prev => ({ ...prev, fee: e.target.value }))}
            required 
            icon={() => <span className="text-[14px] font-bold text-[#94A3B8]">%</span>}
          />
        </div>
      </div>
    </BaseModal>
  )
}

export const PromotionDataModal = ({ onClose, item, refetch }) => {
  const [formData, setFormData] = useState({
    title: item?.title || '',
    tagline: item?.tagline || '',
    description: item?.description || '',
    image: item?.image || null,
    status: item?.status ?? true
  })
  
  const { post, put, loading } = useApi()
  const fileInputRef = useRef(null)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (closeAfter = true) => {
    if (!formData.title) return alert('Title is required')
    
    try {
      if (item?.id) {
        await put(`/inventory/promotions/${item.id}/`, formData)
      } else {
        await post('/inventory/promotions/', formData)
      }
      
      refetch()
      if (closeAfter) {
        onClose()
      } else {
        setFormData({ title: '', tagline: '', description: '', image: null, status: true })
        alert('Promotion saved successfully!')
      }
    } catch (err) {
      console.error('Save failed:', err)
    }
  }

  return (
    <BaseModal 
      title="Promotion Data" 
      onClose={onClose}
      footer={
        <div className="flex gap-3 w-full justify-end">
          <Button 
            onClick={() => handleSave(true)} 
            disabled={loading}
            className="gap-2 px-6 h-12 bg-[#0EA5E9] font-bold"
          >
            <Save size={18} />
            Save & Close
          </Button>
          <Button 
            onClick={() => handleSave(false)} 
            disabled={loading}
            className="gap-2 px-6 h-12 bg-[#0EA5E9] font-bold"
          >
            <Save size={18} />
            Save & New
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Image Preview / Upload Area */}
        <div className="flex justify-center mb-4">
          <div className="relative group">
            <div className={`w-64 h-36 rounded-xl overflow-hidden bg-[#F1F5F9] border-2 border-dashed border-[#CBD5E1] flex items-center justify-center transition-all ${!formData.image && 'group-hover:border-[#0EA5E9]'}`}>
              {formData.image ? (
                <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-[#94A3B8]">
                  <ImageIcon size={48} strokeWidth={1} />
                </div>
              )}
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 active:scale-95 transition-all"
            >
              <Pencil size={18} />
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={handleImageChange}
            />
          </div>
        </div>

        <Input 
          label="Title*" 
          placeholder="Enter promotion title" 
          value={formData.title}
          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
          required 
        />
        <Input 
          label="Tagline" 
          placeholder="Enter tagline" 
          value={formData.tagline}
          onChange={(e) => setFormData(prev => ({ ...prev, tagline: e.target.value }))}
        />
        
        <div className="space-y-1.5">
          <label className="text-[14px] font-bold text-[#475569] ml-0.5">Description</label>
          <textarea 
            className="w-full min-h-[100px] p-4 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] text-[14px] text-[#1E293B] font-medium outline-none focus:border-[#0EA5E9] focus:bg-white transition-all resize-none"
            placeholder="Enter promotion description..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          />
        </div>
      </div>
    </BaseModal>
  )
}
