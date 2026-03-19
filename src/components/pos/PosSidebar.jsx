import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  ShoppingCart, 
  LogOut
} from 'lucide-react'
import { getStoredAuth } from '../../utils/auth'

// Import PNG icons
import DashboardIcon from '../../assets/icon/Dashboard.png'
import ProductsIcon from '../../assets/icon/Products.png'
import AddToCartIcon from '../../assets/icon/add to cart.png'
import ReturnIcon from '../../assets/icon/return.png'
import SalesIcon from '../../assets/icon/Sales.png'
import PeoplesIcon from '../../assets/icon/Peoples.png'
import DrawerIcon from '../../assets/icon/Drawer.png'
import ReportsIcon from '../../assets/icon/Reports.png'
import SettingsIcon from '../../assets/icon/Settings.png'
import LogoIcon from '../../assets/icon/Liquor POS.png'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/pos/dashboard', isPng: true },
  { id: 'products', label: 'Products', icon: ProductsIcon, path: '/pos/products', isPng: true },
  { id: 'purchase-bills', label: 'Purchase Bills', icon: ShoppingCart, path: '/pos/purchase-bills', isPng: false },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: AddToCartIcon, path: '/pos/purchase-orders', isPng: true },
  { id: 'purchase-return', label: 'Purchase Return', icon: ReturnIcon, path: '/pos/purchase-return', isPng: true },
  { id: 'sales', label: 'Sales', icon: SalesIcon, path: '/pos/sales', isPng: true },
  { id: 'people', label: 'Peoples', icon: PeoplesIcon, path: '/pos/people', isPng: true },
  { id: 'cash-drawer', label: 'Cash Drawer', icon: DrawerIcon, path: '/pos/cash-drawer', isPng: true },
  { id: 'reports', label: 'Reports', icon: ReportsIcon, path: '/pos/reports', isPng: true },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/pos/settings', isPng: true },
]

const SidebarItem = ({ label, icon: Icon, active, path, isPng }) => {
  // Filter to achieve #0EA5E9 color for black/dark PNGs
  const activeFilter = "brightness(0) saturate(100%) invert(51%) sepia(87%) saturate(2135%) hue-rotate(164deg) brightness(97%) contrast(93%)";
  
  return (
    <Link
      to={path}
      className={`
        flex items-center rounded-lg transition-all duration-200 mx-4 h-[44px] group
        ${active 
          ? 'bg-[#E0F2FE] text-[#0EA5E9]' 
          : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
        }
      `}
    >
       <div className="flex items-center h-full px-4 gap-3">
          <div className="w-[24px] h-[24px] flex items-center justify-center shrink-0">
            {isPng ? (
              <img 
                src={Icon} 
                alt={label} 
                style={{ filter: active ? activeFilter : 'none' }}
                className={`w-full h-full object-contain transition-all ${active ? '' : 'opacity-70 group-hover:opacity-100'}`} 
              />
            ) : (
              <Icon size={20} className={active ? 'text-[#0EA5E9]' : 'text-[#64748B] group-hover:text-[#1E293B]'} />
            )}
          </div>
          <span className={`text-[15px] font-bold leading-[21px] whitespace-nowrap ${active ? 'text-[#0EA5E9]' : ''}`}>
            {label}
          </span>
       </div>
    </Link>
  );
}

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
    if (path.includes('/purchase-bills')) return 'purchase-bills'
    if (path.includes('/purchase-orders')) return 'purchase-orders'
    if (path.includes('/purchase-return')) return 'purchase-return'
    if (path.includes('/sales')) return 'sales'
    if (path.includes('/terminal')) return 'sales'
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
      <div className="h-16 flex items-center gap-3 px-8 shrink-0 mb-4 pt-6">
        <div className="h-9 w-9 rounded-lg bg-white flex items-center justify-center shadow-sm border border-slate-100 p-1">
           <img src={LogoIcon} alt="Logo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-[20px] font-black text-[#1E293B] tracking-tight">
          Liquor <span className="text-[#0EA5E9]">POS</span>
        </h1>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto pt-4 shadow-inner">
        {navItems.map((item) => (
          <SidebarItem
            key={item.id}
            label={item.label}
            icon={item.icon}
            path={item.path}
            isPng={item.isPng}
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
          className="w-full mt-4 flex items-center justify-center gap-2 py-2.5 text-[11px] font-black uppercase tracking-widest text-[#64748B] hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-transparent hover:border-rose-100 transition-all font-sans"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </aside>
  )
}

export default PosSidebar

