import React from 'react'

const Loader = ({ fullPage = false, size = 'md' }) => {
  const sizes = {
    sm: 'h-6 w-6 border-2',
    md: 'h-10 w-10 border-3',
    lg: 'h-16 w-16 border-4'
  }

  const spinner = (
    <div className={`animate-spin rounded-full border-[#0EA5E90D] border-t-[#0EA5E9] ${sizes[size]}`} />
  )

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-[300] bg-white/80 backdrop-blur-sm flex items-center justify-center flex-col gap-4">
        {spinner}
        <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-[0.2em] animate-pulse">Loading POS...</p>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center p-8">
      {spinner}
    </div>
  )
}

export default Loader
