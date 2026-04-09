import React from 'react'
import { useLocation } from 'react-router-dom'
import { Outlet } from 'react-router-dom'
import PosSidebar from './pos/PosSidebar'
import PosTopbar from './pos/PosTopbar'
import { getIsAdminUser, getStoredAuth } from '../utils/auth'

const PosLayout = () => {
  const location = useLocation()
  const authData = getStoredAuth()
  const showSidebar = getIsAdminUser(authData)
  const isTerminalRoute = location.pathname.includes('/pos/terminal')

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] flex font-['Inter',_sans-serif]">
      {showSidebar ? <PosSidebar /> : null}
      <div className={`flex min-w-0 min-h-0 flex-1 flex-col h-full overflow-hidden ${showSidebar ? 'ml-[240px]' : ''}`}>
        <PosTopbar />
        <main className={`flex-1 min-h-0 ${isTerminalRoute ? 'overflow-hidden p-0 bg-[#F5F7FA]' : 'overflow-y-auto p-4 sm:p-6'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default PosLayout
