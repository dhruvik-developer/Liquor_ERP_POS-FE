import React, { useEffect } from 'react'
import { X } from 'lucide-react'

const toneMap = {
  success: {
    iconWrap: 'bg-emerald-500',
    progress: 'bg-emerald-500',
    defaultTitle: 'Success',
  },
  error: {
    iconWrap: 'bg-rose-500',
    progress: 'bg-rose-500',
    defaultTitle: 'Something Went wrong!',
  },
  warning: {
    iconWrap: 'bg-amber-500',
    progress: 'bg-amber-500',
    defaultTitle: 'Warning',
  },
  info: {
    iconWrap: 'bg-sky-500',
    progress: 'bg-sky-500',
    defaultTitle: 'Info',
  },
}

const Toast = ({ title, message, type = 'error', onClose, duration = 3500 }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration)
    return () => clearTimeout(timer)
  }, [onClose, duration])

  const tone = toneMap[type] || toneMap.error

  return (
    <div className="toast-enter w-[380px] max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl bg-white border border-[#E2E8F0] shadow-2xl">
      <div className="flex items-start gap-3 px-4 py-4">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${tone.iconWrap}`}>
          <X size={22} className="text-white" strokeWidth={3} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold leading-5 text-[#1F2937]">{title || tone.defaultTitle}</p>
          <p className="mt-1 text-[14px] font-medium leading-5 text-[#4B5563]">{message}</p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-[#6B7280] hover:text-[#111827] transition-colors"
          aria-label="Close notification"
        >
          <X size={22} />
        </button>
      </div>

      <div
        className={`toast-progress h-[3px] ${type === 'error' ? 'bg-gradient-to-r from-emerald-500 via-sky-500 to-rose-500' : tone.progress}`}
        style={{ animationDuration: `${duration}ms` }}
      />
    </div>
  )
}

export default Toast
