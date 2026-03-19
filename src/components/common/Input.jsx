import React from 'react'

const Input = ({ label, icon: Icon, error, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#0EA5E9] transition-colors">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`
            w-full h-10 rounded-lg border border-[#E2E8F0] bg-white 
            ${Icon ? 'pl-10' : 'px-4'} pr-4 
            text-[14px] font-medium text-[#1E293B] 
            outline-none transition-all
            focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E91A]
            placeholder:text-[#94A3B8]
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-50' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && <p className="text-[12px] text-rose-500 ml-1">{error}</p>}
    </div>
  )
}

export default Input
