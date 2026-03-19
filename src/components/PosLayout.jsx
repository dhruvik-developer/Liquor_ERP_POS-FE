import React from 'react'
import { Outlet } from 'react-router-dom'
import PosSidebar from './pos/PosSidebar'
import PosTopbar from './pos/PosTopbar'

const PosLayout = () => {
  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] flex font-['Inter',_sans-serif]">
      <PosSidebar />
      <div className="flex min-w-0 flex-1 flex-col h-full overflow-hidden ml-[240px]">
        <PosTopbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PosLayout
