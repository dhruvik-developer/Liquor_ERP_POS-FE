import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LayoutDashboard, 
  Package, 
  Receipt, 
  FileText, 
  RotateCcw, 
  ShoppingCart, 
  History,
  Users, 
  Wallet, 
  BarChart3, 
  Settings, 
  LogOut,
  Wine,
  AlertCircle,
  ClipboardList
} from 'lucide-react'
import { getStoredAuth } from '../../utils/auth'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/pos/dashboard' },
  { id: 'products', label: 'Inventory', icon: Package, path: '/pos/products' },
  { id: 'inventory-adjust', label: 'Stock Adjust', icon: ClipboardList, path: '/pos/inventory/adjust' },
  { id: 'low-stock', label: 'Low Stock', icon: AlertCircle, path: '/pos/inventory/low-stock' },
  { id: 'purchase-bills', label: 'Purchase Bills', icon: Receipt, path: '/pos/purchase-bills' },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: FileText, path: '/pos/purchase-orders' },
  { id: 'sales', label: 'Main POS', icon: ShoppingCart, path: '/pos/terminal' },
  { id: 'sales-history', label: 'Sales History', icon: History, path: '/pos/sales/history' },
  { id: 'people', label: 'Peoples', icon: Users, path: '/pos/people' },
  { id: 'cash-drawer', label: 'Cash Drawer', icon: Wallet, path: '/pos/cash-drawer' },
  { id: 'reports', label: 'Analytics', icon: BarChart3, path: '/pos/reports' },
  { id: 'settings', label: 'Settings', icon: Settings, path: '/pos/settings' },
]

const SidebarItem = ({ label, icon: Icon, active, path }) => (
  <Link
    to={path}
    className={`
      flex items-center rounded-lg transition-all duration-200 mx-4 h-[40px] group
      ${active 
        ? 'bg-[#E0F2FE] text-[#0EA5E9]' 
        : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
      }
    `}
  >
     <div className="flex items-center h-full px-4 gap-3">
        <Icon size={18} className={active ? 'text-[#0EA5E9]' : 'text-[#64748B] group-hover:text-[#1E293B]'} />
        <span className="text-[14px] font-bold leading-[21px] whitespace-nowrap">
          {label}
        </span>
     </div>
  </Link>
)

const PosSidebar = () => {
  const location = useLocation()
  const auth = getStoredAuth()
  const user = auth?.data?.user || auth?.user || {}
  const userName = user.name || 'Admin User'
  const userEmail = user.email || 'admin@liquorpos.com'

  const getActiveId = () => {
    const path = location.pathname
    if (path.includes('/dashboard')) return 'dashboard'
    if (path.includes('/products')) return 'products'
    if (path.includes('/inventory/adjust')) return 'inventory-adjust'
    if (path.includes('/inventory/low-stock')) return 'low-stock'
    if (path.includes('/purchase-bills')) return 'purchase-bills'
    if (path.includes('/purchase-orders')) return 'purchase-orders'
    if (path.includes('/terminal')) return 'sales'
    if (path.includes('/sales/history')) return 'sales-history'
    if (path.includes('/people')) return 'people'
    if (path.includes('/cash-drawer')) return 'cash-drawer'
    if (path.includes('/reports')) return 'reports'
    if (path.includes('/settings')) return 'settings'
    return ''
  }

  const activeId = getActiveId()

  const handleLogout = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    window.location.href = '/login'
  }

  return (
    <aside className="hidden w-[240px] shrink-0 border-r border-[#E2E8F0] bg-white lg:flex flex-col h-screen fixed left-0 top-0 z-50">
      <div className="h-16 flex items-center gap-3 px-8 shrink-0 mb-4 pt-4">
        <div className="h-8 w-8 rounded-lg bg-[#1E293B] flex items-center justify-center shadow-lg shadow-slate-200">
           <Wine className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-[18px] font-black text-[#1E293B] tracking-tight uppercase">
          Liquor <span className="text-[#0EA5E9]">ERP</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pt-2">
        {navItems.map((item) => (
          <SidebarItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            path={item.path}
            active={activeId === item.id}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <Link to="/pos/profile" className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white border border-transparent hover:border-[#E2E8F0] transition-all group">
          <div className="h-10 w-10 rounded-lg bg-[#0EA5E9] text-white flex items-center justify-center font-bold text-sm shadow-md group-hover:bg-[#38BDF8] transition-colors uppercase">
            {userName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-black text-[#1E293B] truncate">{userName}</p>
            <p className="text-[11px] font-medium text-[#64748B] truncate tracking-tight">{userEmail}</p>
          </div>
        </Link>
        <button 
          onClick={handleLogout}
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#64748B] hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all"
        >
          <LogOut size={14} />
          Protocol Logout
        </button>
      </div>
    </aside>
  )
}

export default PosSidebar
