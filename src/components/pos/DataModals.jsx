import React from 'react'
import { X, Save, Plus, Image as ImageIcon, Pencil } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'

const BaseModal = ({ title, onClose, children, onSave }) => {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-[#0F172A66] backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-[500px] rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-[#E2E8F0]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-[#E2E8F0]">
          <h2 className="text-[20px] font-black text-[#1E293B] tracking-tight">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-[#94A3B8] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-lg transition-all"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {children}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} className="px-8">
            Cancel
          </Button>
          <Button onClick={onSave} className="px-10 gap-2">
            <Save size={18} />
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}

export const CardDataModal = ({ onClose }) => {
  return (
    <BaseModal title="Card Data" onClose={onClose} onSave={onClose}>
      <div className="space-y-6">
        <Input label="Name" placeholder="Enter card name" required />
        <div className="w-1/2">
          <Input 
            label="Fee" 
            placeholder="0.00" 
            required 
            icon={() => <span className="text-[14px] font-bold text-[#94A3B8]">%</span>}
          />
        </div>
      </div>
    </BaseModal>
  )
}

export const PromotionDataModal = ({ onClose }) => {
  return (
    <BaseModal title="Promotion Data" onClose={onClose} onSave={onClose}>
      <div className="space-y-6">
        {/* Title & Tagline */}
        <Input label="Promotion Title" placeholder="Enter title" required />
        <Input label="Tagline" placeholder="Enter tagline" />
        
        {/* Image Upload */}
        <div className="space-y-1.5">
          <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Upload Image</label>
          <div className="relative w-full aspect-video bg-[#F8FAFC] rounded-lg border-2 border-dashed border-[#E2E8F0] flex flex-col items-center justify-center group hover:border-[#0EA5E9] transition-colors cursor-pointer">
             <ImageIcon className="text-[#E2E8F0] group-hover:text-[#0EA5E9]" size={48} />
             <span className="mt-2 text-[12px] font-bold text-[#94A3B8] uppercase">Click to upload banner</span>
             <button className="absolute bottom-4 right-4 h-10 w-10 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                <Plus size={20} />
             </button>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
