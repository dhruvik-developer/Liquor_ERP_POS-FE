import React, { useEffect } from 'react'
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react'

const Toast = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const icons = {
    success: <CheckCircle2 className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    warning: <AlertCircle className="text-amber-500" size={20} />,
    info: <Info className="text-[#0EA5E9]" size={20} />
  }

  const bgColors = {
    success: 'bg-emerald-50 border-emerald-100',
    error: 'bg-rose-50 border-rose-100',
    warning: 'bg-amber-50 border-amber-100',
    info: 'bg-[#0EA5E90D] border-[#0EA5E91A]'
  }

  return (
    <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-4 py-3 rounded-lg border shadow-xl animate-in slide-in-from-right-full duration-300 ${bgColors[type]}`}>
      {icons[type]}
      <span className="text-[14px] font-bold text-[#1E293B]">{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 text-[#94A3B8] hover:text-[#1E293B] transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  )
}

export default Toast
