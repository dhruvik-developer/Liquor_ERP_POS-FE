import React from 'react'
import { Bell, User } from 'lucide-react'

const PosTopbar = () => {
  return (
    <header className="h-12 border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Left Side: Layout placeholder */}
      <div className="flex-1" />

      {/* Right Side: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Icon */}
        <button className="relative p-2 text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#0EA5E90D] rounded-lg transition-all duration-200">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Avatar */}
        <button className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#F8FAFC] hover:bg-[#0EA5E90D] transition-all duration-200 group border border-[#E2E8F0] hover:border-[#0EA5E9]">
          <User size={16} className="text-[#94A3B8] group-hover:text-[#0EA5E9]" />
        </button>
      </div>
    </header>
  )
}

export default PosTopbar
