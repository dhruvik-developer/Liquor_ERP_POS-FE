import React from 'react'
import { AlertTriangle, X } from 'lucide-react'
import Button from './Button'

const ConfirmationModal = ({ 
  title = 'Are you sure?', 
  message = 'This action cannot be undone.', 
  confirmLabel = 'Confirm', 
  cancelLabel = 'Cancel',
  onConfirm, 
  onCancel,
  variant = 'danger' 
}) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-[#0F172A66] backdrop-blur-[2px] animate-in fade-in duration-300"
        onClick={onCancel}
      />
      <div className="relative bg-white w-full max-w-[400px] rounded-lg shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden border border-[#E2E8F0]">
        <div className="p-8 flex flex-col items-center text-center">
          <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-6 ${
            variant === 'danger' ? 'bg-rose-50 text-rose-500' : 'bg-[#0EA5E90D] text-[#0EA5E9]'
          }`}>
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-[20px] font-black text-[#1E293B] tracking-tight mb-2">{title}</h2>
          <p className="text-[14px] font-medium text-[#64748B] leading-relaxed px-4">{message}</p>
        </div>
        
        <div className="px-8 pb-8 flex gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel} 
            className="flex-1"
          >
            {cancelLabel}
          </Button>
          <Button 
            onClick={onConfirm} 
            className={`flex-1 ${variant === 'danger' ? 'bg-rose-500 hover:bg-rose-600' : ''}`}
          >
            {confirmLabel}
          </Button>
        </div>

        <button 
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-[#94A3B8] hover:text-[#1E293B] hover:bg-[#F8FAFC] rounded-lg transition-all"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}

export default ConfirmationModal
