import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { 
  LogOut
} from 'lucide-react'
import { getStoredAuth } from '../../utils/auth'
import api from '../../services/api'

// Import PNG icons
import DashboardIcon from '../../assets/icon/dashboard.png'
import ProductsIcon from '../../assets/icon/products.png'
import PurchaseBillsIcon from '../../assets/icon/purchasebills.png'
import PurchaseOrdersIcon from '../../assets/icon/purchaseorders.png'
import PurchaseReturnIcon from '../../assets/icon/purchasereturn.png'
import SalesIcon from '../../assets/icon/sales.png'
import PeoplesIcon from '../../assets/icon/peoples.png'
import DrawerIcon from '../../assets/icon/drawer.png'
import ItemMasterIcon from '../../assets/icon/itemmaster.png'
import ReportsIcon from '../../assets/icon/reports.png'
import SettingsIcon from '../../assets/icon/settings.png'
import LogoIcon from '../../assets/icon/liquorPOS.png'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: DashboardIcon, path: '/dashboard', isPng: true },
  { id: 'products', label: 'Products', icon: ProductsIcon, path: '/products', isPng: true },
  { id: 'purchase-bills', label: 'Purchase Bills', icon: PurchaseBillsIcon, path: '/purchase-bills', isPng: true },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: PurchaseOrdersIcon, path: '/purchase-orders', isPng: true },
  { id: 'purchase-return', label: 'Purchase Return', icon: PurchaseReturnIcon, path: '/purchase-return', isPng: true },
  { id: 'sales', label: 'Sales', icon: SalesIcon, path: '/sales', isPng: true },
  { id: 'people', label: 'Peoples', icon: PeoplesIcon, path: '/people', isPng: true },
  { id: 'cash-drawer', label: 'Cash Drawer', icon: DrawerIcon, path: '/cash-drawer', isPng: true },
  { id: 'item-master', label: 'Item Master', icon: ItemMasterIcon, path: '/item-master', isPng: true, iconClassName: 'scale-90', inactiveFilter: "brightness(0) saturate(100%) invert(47%) sepia(12%) saturate(505%) hue-rotate(174deg) brightness(95%) contrast(89%)" },
  { id: 'reports', label: 'Reports', icon: ReportsIcon, path: '/reports', isPng: true },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, path: '/settings', isPng: true },
]

const SidebarItem = ({ label, icon: Icon, active, path, isPng, iconClassName = '', inactiveFilter = 'none' }) => {
  // Filter to achieve #0EA5E9 color for black/dark PNGs
  const activeFilter = "brightness(0) saturate(100%) invert(51%) sepia(87%) saturate(2135%) hue-rotate(164deg) brightness(97%) contrast(93%)";
  const uniformIconSizeClass = 'w-[24px] h-[24px]'
  
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
                style={{ filter: active ? activeFilter : inactiveFilter }}
                className={`${uniformIconSizeClass} object-contain transition-all ${iconClassName} ${active ? '' : 'opacity-70 group-hover:opacity-100'}`} 
              />
            ) : (
              <Icon size={24} className={active ? 'text-[#0EA5E9]' : 'text-[#64748B] group-hover:text-[#1E293B]'} />
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
  const user = auth?.data?.user || auth?.user || auth || {}
  const userName = user.name || 'Admin User'
  const userEmail = user.email || 'admin@liquorpos.com'
  const routeBase = location.pathname.startsWith('/admin') ? '/admin' : '/pos'

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
    if (path.includes('/item-master')) return 'item-master'
    if (path.includes('/reports')) return 'reports'
    if (path.includes('/settings')) return 'settings'
    return ''
  }

  const activeId = getActiveId()

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
            path={`${routeBase}${item.path}`}
            isPng={item.isPng}
            iconClassName={item.iconClassName}
            inactiveFilter={item.inactiveFilter}
            active={activeId === item.id}
          />
        ))}
      </nav>

      <div className="p-4 border-t border-[#E2E8F0] bg-[#F8FAFC]">
        <Link to={`${routeBase}/profile`} className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white border border-transparent hover:border-[#E2E8F0] transition-all group">
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
