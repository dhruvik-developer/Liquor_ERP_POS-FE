import React from 'react'

const Card = ({ children, title, subtitle, className = '', noPadding = false }) => {
  return (
    <div className={`rounded-lg border border-[#E2E8F0] bg-white shadow-sm overflow-hidden ${className}`}>
      {(title || subtitle) && (
        <div className="px-6 py-5 border-b border-[#E2E8F0]">
          {title && <h3 className="text-[18px] font-bold text-[#1E293B]">{title}</h3>}
          {subtitle && <p className="text-[14px] text-[#64748B] mt-1">{subtitle}</p>}
        </div>
      )}
      <div className={noPadding ? '' : 'p-6'}>
        {children}
      </div>
    </div>
  )
}

export default Card
