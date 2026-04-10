import React, { useEffect, useRef, useState } from 'react'
import { Bell, LogOut, Monitor, Settings, User, Users, Store } from 'lucide-react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { getIsAdminUser, getStoredAuth } from '../../utils/auth'
import { usePosStore } from '../../store/usePosStore'
import { showToast } from '../../utils/toast'
import {
  CUSTOMER_DISPLAY_EVENTS,
  CUSTOMER_DISPLAY_WINDOW_NAME,
  createCustomerDisplayChannel,
  createCustomerDisplaySnapshot,
  persistCustomerDisplaySnapshot,
} from '../../utils/customerDisplay'
import PosTabIcon from '../../assets/icon/POS.png'
import CashDrawerTabIcon from '../../assets/icon/cashdrawer.png'
import ProcessReturnTabIcon from '../../assets/icon/processreturn.png'
import LookupTransactionTabIcon from '../../assets/icon/lookuptransaction.png'
import LogoIcon from '../../assets/icon/liquorPOS.png'

const activeIconFilter = 'brightness(0) saturate(100%) invert(51%) sepia(87%) saturate(2135%) hue-rotate(164deg) brightness(97%) contrast(93%)'
const inactiveIconFilter = 'brightness(0) saturate(100%) invert(50%) sepia(10%) saturate(520%) hue-rotate(174deg) brightness(96%) contrast(88%)'

const getUserRoleLabel = (user) => {
  const roleValue = user?.role
  if (typeof roleValue === 'string') return roleValue
  if (typeof roleValue === 'number') return String(roleValue)
  if (roleValue && typeof roleValue === 'object') {
    return roleValue.name || roleValue.label || roleValue.code || 'User'
  }
  return user?.role_name || 'User'
}

const PosTopbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hoveredTopTab, setHoveredTopTab] = useState(null)
  const menuRef = useRef(null)
  const customerDisplayWindowRef = useRef(null)
  const customerDisplayChannelRef = useRef(null)
  const latestSnapshotRef = useRef(createCustomerDisplaySnapshot())
  const navigate = useNavigate()
  const location = useLocation()
  const auth = getStoredAuth()
  const isAdmin = getIsAdminUser(auth)
  const user = auth?.data?.user || auth?.user || auth || {}
  const isTerminalView = location.pathname.includes('/terminal') && !location.pathname.includes('/customer-display')
  const routeBase = location.pathname.startsWith('/admin') ? '/admin' : '/pos'
  const cartItems = usePosStore((state) => state.cartItems)
  const discount = usePosStore((state) => state.discount)

  const userName = user?.name || 'Admin User'
  const userRole = getUserRoleLabel(user)
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : []

  useEffect(() => {
    const snapshot = createCustomerDisplaySnapshot({ cartItems, discount })
    latestSnapshotRef.current = snapshot
    persistCustomerDisplaySnapshot(snapshot)
    customerDisplayChannelRef.current?.postMessage({
      type: CUSTOMER_DISPLAY_EVENTS.SYNC_STATE,
      payload: snapshot,
    })
  }, [cartItems, discount])

  useEffect(() => {
    const channel = createCustomerDisplayChannel()
    customerDisplayChannelRef.current = channel

    const handleChannelMessage = (event) => {
      if (event?.data?.type !== CUSTOMER_DISPLAY_EVENTS.REQUEST_STATE) return

      channel?.postMessage({
        type: CUSTOMER_DISPLAY_EVENTS.SYNC_STATE,
        payload: latestSnapshotRef.current,
      })
    }

    channel?.addEventListener('message', handleChannelMessage)

    return () => {
      channel?.removeEventListener('message', handleChannelMessage)
      channel?.close()
      customerDisplayChannelRef.current = null
    }
  }, [])

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      if (customerDisplayWindowRef.current?.closed) {
        customerDisplayWindowRef.current = null
      }
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  useEffect(() => {
    if (!isMenuOpen) return

    const handleClickOutside = (event) => {
      if (!menuRef.current?.contains(event.target)) {
        setIsMenuOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isMenuOpen])

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/')
    } catch (err) {
      console.warn('Logout API failed, forcing local logout:', err)
    } finally {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      localStorage.removeItem('auth_user')
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
  }

  const handleRoleClick = () => {
    setIsMenuOpen(false)
    navigate(`${routeBase}/roles`)
  }

  const handlePermissionClick = () => {
    setIsMenuOpen(false)
    navigate(`${routeBase}/permissions`)
  }

  const handleStoreClick = () => {
    setIsMenuOpen(false)
    navigate(`${routeBase}/stores`)
  }

  const syncCustomerDisplayState = () => {
    persistCustomerDisplaySnapshot(latestSnapshotRef.current)
    customerDisplayChannelRef.current?.postMessage({
      type: CUSTOMER_DISPLAY_EVENTS.SYNC_STATE,
      payload: latestSnapshotRef.current,
    })
  }

  const handleOpenCustomerDisplay = () => {
    const popupUrl = `${window.location.origin}${routeBase}/customer-display`
    const existingWindow = customerDisplayWindowRef.current

    if (existingWindow?.closed) {
      customerDisplayWindowRef.current = null
    }

    if (customerDisplayWindowRef.current && !customerDisplayWindowRef.current.closed) {
      customerDisplayWindowRef.current.focus()
      syncCustomerDisplayState()
      return
    }

    const popupFeatures = [
      'popup=yes',
      'resizable=yes',
      'scrollbars=yes',
      `width=${window.screen.availWidth || 1280}`,
      `height=${window.screen.availHeight || 800}`,
      'left=0',
      'top=0',
    ].join(',')

    let nextWindow = null

    try {
      syncCustomerDisplayState()
      nextWindow = window.open(popupUrl, CUSTOMER_DISPLAY_WINDOW_NAME, popupFeatures)
    } catch (error) {
      console.error('Unable to open customer display window.', error)
      showToast({
        title: 'Unable to Open Display',
        message: 'Something went wrong while opening the customer display screen.',
        type: 'error',
      })
      return
    }

    if (!nextWindow) {
      showToast({
        title: 'Popup Blocked',
        message: 'Please allow popups for this site to open the customer display screen.',
        type: 'warning',
      })
      return
    }

    customerDisplayWindowRef.current = nextWindow
    nextWindow.focus()
    syncCustomerDisplayState()
  }

  const customerDisplayButton = isTerminalView ? (
    <button
      type="button"
      onClick={handleOpenCustomerDisplay}
      className="h-9 rounded-lg border border-sky-200 bg-sky-50 px-4 text-[13px] font-bold text-sky-700 transition-colors hover:border-sky-300 hover:bg-sky-100"
    >
      <span className="inline-flex items-center gap-2">
        <Monitor size={15} />
        Open Customer Display
      </span>
    </button>
  ) : null

  if (isTerminalView && !isAdmin) {
    return (
      <header className="sticky top-0 z-50 bg-white border-b border-[#E5E9F0]">
        <div className="h-12 px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 flex items-center gap-3 px-2 shrink-0">
              <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 p-1">
                <img src={LogoIcon} alt="Logo" className="w-full h-full object-contain" />
              </div>
              <h1 className="text-[20px] font-black text-[#1E293B] tracking-tight">
                Liquor <span className="text-[#0EA5E9]">POS</span>
              </h1>
            </div>
            {/* <button
              type="button"
              className="h-9 rounded-lg bg-[#1EA7EE] text-white px-4 text-[13px] font-semibold shadow-sm hover:bg-[#1695D8] transition-colors"
            >
              + Start New Sale
            </button> */}
          </div>

          <div className="flex items-center gap-2">
            {customerDisplayButton}
            <button className="p-2 text-[#64748B] hover:text-[#1EA7EE] rounded-md hover:bg-[#F4F7FB] transition-colors">
              <Bell size={15} />
            </button>
            <button
              type="button"
              onClick={() => navigate(`${routeBase}/settings`)}
              className="p-2 text-[#64748B] hover:text-[#1EA7EE] rounded-md hover:bg-[#F4F7FB] transition-colors"
            >
              <Settings size={15} />
            </button>
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="h-8 w-8 rounded-full bg-[#F1D66B] flex items-center justify-center"
              >
                <span className="text-[11px] font-bold text-[#6B4E00] uppercase">{userName.charAt(0)}</span>
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-[calc(100%+10px)] w-[220px] overflow-hidden rounded-xl border border-[#E2E8F0] bg-white shadow-xl shadow-slate-900/10 z-[80]">
                  <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                    <p className="text-[13px] font-black text-[#1E293B] truncate">{userName}</p>
                    <p className="text-[11px] font-semibold text-[#64748B] truncate">
                      Role: {userRole}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 text-left text-[14px] font-bold text-rose-500 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="h-12 px-7 border-t border-[#EEF2F7] flex items-center gap-8 text-[15px] font-bold">
          <NavLink
            to="/pos/terminal"
            className={({ isActive }) => `group flex items-center gap-1.5 transition-colors ${isActive ? 'text-[#1EA7EE]' : 'text-[#64748B] hover:text-[#1EA7EE]'}`}
            onMouseEnter={() => setHoveredTopTab('/pos/terminal')}
            onMouseLeave={() => setHoveredTopTab(null)}
          >
            {({ isActive }) => (
              <>
                <img
                  src={PosTabIcon}
                  alt="POS"
                  className="h-[16px] w-[16px] object-contain transition-all"
                  style={{ filter: isActive || hoveredTopTab === '/pos/terminal' ? activeIconFilter : inactiveIconFilter }}
                />
                POS
              </>
            )}
          </NavLink>
          <NavLink
            to="/pos/cash-drawer"
            className={({ isActive }) => `group flex items-center gap-1.5 transition-colors ${isActive ? 'text-[#1EA7EE]' : 'text-[#64748B] hover:text-[#1EA7EE]'}`}
            onMouseEnter={() => setHoveredTopTab('/pos/cash-drawer')}
            onMouseLeave={() => setHoveredTopTab(null)}
          >
            {({ isActive }) => (
              <>
                <img
                  src={CashDrawerTabIcon}
                  alt="Cash Drawer"
                  className="h-[16px] w-[16px] object-contain transition-all"
                  style={{ filter: isActive || hoveredTopTab === '/pos/cash-drawer' ? activeIconFilter : inactiveIconFilter }}
                />
                Cash Drawer
              </>
            )}
          </NavLink>
          <NavLink
            to="/pos/purchase-return"
            className={({ isActive }) => `group flex items-center gap-1.5 transition-colors ${isActive ? 'text-[#1EA7EE]' : 'text-[#64748B] hover:text-[#1EA7EE]'}`}
            onMouseEnter={() => setHoveredTopTab('/pos/purchase-return')}
            onMouseLeave={() => setHoveredTopTab(null)}
          >
            {({ isActive }) => (
              <>
                <img
                  src={ProcessReturnTabIcon}
                  alt="Process Return"
                  className="h-[16px] w-[16px] object-contain transition-all"
                  style={{ filter: isActive || hoveredTopTab === '/pos/purchase-return' ? activeIconFilter : inactiveIconFilter }}
                />
                Process Return
              </>
            )}
          </NavLink>
          <NavLink
            to="/pos/sales/history"
            className={({ isActive }) => `group flex items-center gap-1.5 transition-colors ${isActive ? 'text-[#1EA7EE]' : 'text-[#64748B] hover:text-[#1EA7EE]'}`}
            onMouseEnter={() => setHoveredTopTab('/pos/sales/history')}
            onMouseLeave={() => setHoveredTopTab(null)}
          >
            {({ isActive }) => (
              <>
                <img
                  src={LookupTransactionTabIcon}
                  alt="Lookup Transaction"
                  className="h-[16px] w-[16px] object-contain transition-all"
                  style={{ filter: isActive || hoveredTopTab === '/pos/sales/history' ? activeIconFilter : inactiveIconFilter }}
                />
                Lookup Transaction
              </>
            )}
          </NavLink>
        </div>
      </header>
    )
  }

  return (
    <header className="h-12 border-b border-[#E2E8F0] bg-white px-6 flex items-center justify-between sticky top-0 z-50">
      {/* Left Side: Layout placeholder */}
      <div className="flex-1" />

      {/* Right Side: Actions */}
      <div className="flex items-center gap-3">
        {customerDisplayButton}
        {/* Notification Icon */}
        <button className="relative p-2 text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#0EA5E90D] rounded-lg transition-all duration-200">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Profile Avatar */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="flex items-center justify-center h-8 w-8 rounded-lg bg-[#F8FAFC] hover:bg-[#0EA5E90D] transition-all duration-200 group border border-[#E2E8F0] hover:border-[#0EA5E9]"
          >
            <User size={16} className="text-[#94A3B8] group-hover:text-[#0EA5E9]" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-[calc(100%+10px)] w-[220px] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl shadow-slate-900/10 z-[80]">
              <div className="px-4 py-3 bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <p className="text-[13px] font-black text-[#1E293B] truncate">{userName}</p>
                <p className="text-[11px] font-semibold text-[#64748B] truncate">
                  Role: {userRole}
                </p>
              </div>

              <button
                type="button"
                onClick={handleRoleClick}
                className="w-full px-4 py-3 flex items-center gap-3 text-left text-[14px] font-bold text-[#1E293B] hover:bg-[#F8FAFC] transition-colors"
              >
                <Users size={16} className="text-[#1E293B]" />
                Role
              </button>

              <button
                type="button"
                onClick={handleStoreClick}
                className="w-full px-4 py-3 flex items-center gap-3 text-left text-[14px] font-bold text-[#1E293B] hover:bg-[#F8FAFC] transition-colors border-t border-[#F1F5F9]"
              >
                <Store size={16} className="text-[#1E293B]" />
                Store Management
              </button>

              <button
                type="button"
                onClick={handlePermissionClick}
                className="w-full px-4 py-3 flex items-center gap-3 text-left text-[14px] font-bold text-[#1E293B] hover:bg-[#F8FAFC] transition-colors border-t border-[#F1F5F9]"
              >
                <Settings size={16} className="text-[#64748B]" />
                Permission{userPermissions.length ? ` (${userPermissions.length})` : ''}
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full px-4 py-3 flex items-center gap-3 text-left text-[14px] font-bold text-rose-500 hover:bg-rose-50 transition-colors border-t border-[#F1F5F9]"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default PosTopbar
