import { Link } from 'react-router-dom'

const navItems = [
  { label: 'Overview', href: '/admin/dashboard', active: true },
  { label: 'Store Units', href: '#' },
  { label: 'Booking Records', href: '#' },
  { label: 'Global Stock', href: '#' },
  { label: 'ERP Reports', href: '#' },
]

const AdminSidebar = () => (
  <div className="flex h-full flex-col p-6 space-y-8">
    <div className="rounded-[28px] bg-gradient-to-br from-primary via-primary-medium to-primary-light px-6 py-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden group">
      <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-white/10 group-hover:scale-150 transition-transform duration-700"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/70">Liquor ERP</p>
      <h2 className="mt-2 text-2xl font-black tracking-tighter">Admin Hub</h2>
      <p className="mt-2 text-[10px] font-bold text-white/60 uppercase tracking-widest leading-relaxed">Multi-unit operations <br/> control center</p>
    </div>

    <nav className="flex-1 space-y-2">
      <p className="px-4 text-[9px] font-black uppercase tracking-[0.25em] text-neutral-300 mb-4">Operations Control</p>
      {navItems.map(item => (
        <Link
          key={item.label}
          to={item.href}
          className={[
            'block rounded-2xl px-5 py-3.5 text-xs font-black uppercase tracking-[0.1em] transition-all relative overflow-hidden group',
            item.active
              ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-[1.02]'
              : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800',
          ].join(' ')}
        >
          <div className={`absolute left-0 top-0 h-full w-1.5 bg-white/20 transition-transform ${item.active ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100 opacity-50'}`}></div>
          <span className="relative z-10">{item.label}</span>
        </Link>
      ))}
    </nav>

    <div className="px-4 pt-6 mt-auto border-t border-neutral-100">
       <button className="w-full h-12 bg-neutral-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-neutral-800 transition-all active:scale-95 shadow-lg shadow-neutral-200/50">
          Terminate Session
       </button>
    </div>
  </div>
)

export default AdminSidebar
