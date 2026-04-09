import React, { useEffect, useRef, useState } from 'react'
import { Bell, LogOut, Settings, User, Users, Store } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { getStoredAuth } from '../../utils/auth'

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
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const auth = getStoredAuth()
  const user = auth?.data?.user || auth?.user || auth || {}

  const userName = user?.name || 'Admin User'
  const userRole = getUserRoleLabel(user)
  const userPermissions = Array.isArray(user?.permissions) ? user.permissions : []

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
    navigate('/pos/roles')
  }

  const handlePermissionClick = () => {
    setIsMenuOpen(false)
    navigate('/pos/permissions')
  }

  const handleStoreClick = () => {
    setIsMenuOpen(false)
    navigate('/pos/stores')
  }

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
