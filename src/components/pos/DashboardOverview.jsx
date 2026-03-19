import React from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  ClipboardList, 
  UserPlus, 
  BarChart3, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  ChevronRight
} from 'lucide-react'

const KPICard = ({ title, value, change, isPositive }) => (
  <div className="bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] p-6 shadow-sm relative overflow-hidden group">
    <div className={`absolute top-0 right-0 w-20 h-20 -mr-6 -mt-6 rounded-full transition-transform group-hover:scale-110 ${isPositive ? 'bg-[#22C55E]/5' : 'bg-[#EF4444]/5'}`}></div>
    <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider mb-1">{title}</p>
    <h3 className="text-[28px] font-black text-[#1E293B] tracking-tight">{value}</h3>
    <div className="flex items-center gap-2 mt-4">
      <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-bold ${isPositive ? 'bg-emerald-50 text-[#22C55E]' : 'bg-rose-50 text-[#EF4444]'}`}>
        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
        <span>{isPositive ? '+' : ''}{change}%</span>
      </div>
      <span className="text-[12px] text-[#94A3B8]">vs last month</span>
    </div>
  </div>
)

const QuickActionCard = ({ icon: Icon, label, path }) => (
  <Link 
    to={path}
    className="bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] p-6 flex flex-col items-center justify-center gap-4 transition-all hover:bg-[#F8FAFC] hover:border-[#0EA5E9] hover:shadow-md active:scale-95 group shadow-sm text-center"
  >
    <div className="relative">
      <div className="text-[#0EA5E9] group-hover:text-[#0284C7] transition-colors">
        <Icon size={32} strokeWidth={1.5} />
      </div>
    </div>
    <span className="text-[13px] font-bold text-[#1E293B] uppercase tracking-widest">{label}</span>
  </Link>
)

const DashboardOverview = () => {
  const topSelling = [
    { name: "Craft Whiskey", sold: 124, price: "$4,960", img: "https://images.unsplash.com/photo-1527281405159-0551a941865e?w=100&h=100&fit=crop" },
    { name: "Artisanal Gin", sold: 98, price: "$3,430", img: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=100&h=100&fit=crop" },
    { name: "Premium Vodka", sold: 85, price: "$2,975", img: "https://images.unsplash.com/photo-1550985616-10810253b84d?w=100&h=100&fit=crop" },
    { name: "Cabernet Sauvignon", sold: 72, price: "$1,800", img: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=100&h=100&fit=crop" },
    { name: "Local IPA 6-Pack", sold: 210, price: "$2,520", img: "https://images.unsplash.com/photo-1623851502263-89bdf5c3080c?w=100&h=100&fit=crop" }
  ]

  const alerts = [
    { name: "Craft Whiskey", sku: "CW750", left: 5, color: "#F59E0B" },
    { name: "Premium Vodka", sku: "PV1000", left: 2, color: "#EF4444" },
    { name: "Local IPA", sku: "LI6PK", left: 8, color: "#F59E0B" },
  ]

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">Dashboard Overview</h1>
          <p className="text-[#64748B] text-[14px] font-medium">Welcome back, <span className="italic font-bold text-[#1E293B]">Admin!</span> Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-[#FFFFFF] border border-[#E2E8F0] rounded-full shadow-sm">
           <div className="h-2 w-2 rounded-full bg-[#22C55E] shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
           <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Live Updates</span>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard title="Total Revenue" value="$125,670" change="5.2" isPositive={true} />
        <KPICard title="Profit" value="$32,890" change="3.1" isPositive={true} />
        <KPICard title="Transactions" value="1,450" change="1.5" isPositive={false} />
        <KPICard title="Avg. Order Value" value="$86.67" change="0.8" isPositive={true} />
      </div>

      <div className="grid grid-cols-12 gap-6">
        
        {/* Quick Links */}
        <div className="col-span-12 lg:col-span-8 space-y-6">
          <div className="flex items-center gap-4">
            <h2 className="text-[12px] font-bold text-[#94A3B8] uppercase tracking-[0.2em] whitespace-nowrap">Quick Links</h2>
            <div className="h-px bg-[#E2E8F0] flex-1"></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <QuickActionCard icon={Plus} label="Add Product" path="/pos/products/add" />
            <QuickActionCard icon={ClipboardList} label="Manage Stock" path="/pos/products" />
            <QuickActionCard icon={UserPlus} label="Add User" path="/pos/people/users/add" />
            <QuickActionCard icon={BarChart3} label="View Reports" path="/pos/reports" />
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] shadow-sm p-8 mt-10">
             <h3 className="text-[20px] font-bold text-[#1E293B] mb-8">Low Stock Alerts</h3>
             <div className="space-y-6">
                {alerts.map((alert, idx) => (
                   <div key={idx} className="flex items-center justify-between group py-2">
                    <div className="flex items-center gap-4">
                      <div 
                        className="h-10 w-10 rounded-lg flex items-center justify-center border transition-colors shadow-sm"
                        style={{ backgroundColor: `${alert.color}0D`, borderColor: `${alert.color}33`, color: alert.color }}
                      >
                        <AlertTriangle size={20} />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-[#1E293B] group-hover:text-[#0EA5E9] transition-colors">{alert.name}</h4>
                        <p className="text-[12px] text-[#64748B] font-medium">SKU: {alert.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[14px] font-bold" style={{ color: alert.color }}>
                        {alert.left} left
                      </span>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="col-span-12 lg:col-span-4">
          <div className="bg-[#FFFFFF] rounded-lg border border-[#E2E8F0] shadow-sm p-8 h-full">
            <h3 className="text-[20px] font-bold text-[#1E293B] mb-8">Top Selling Products</h3>
            <div className="space-y-8">
              {topSelling.map((product, idx) => (
                <div key={idx} className="flex items-center justify-between group cursor-pointer hover:bg-[#F8FAFC] -mx-4 px-4 py-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#E2E8F0] shadow-sm bg-[#F8FAFC]">
                      <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-bold text-[#1E293B] group-hover:text-[#0EA5E9] transition-colors">{product.name}</h4>
                      <p className="text-[12px] text-[#64748B] font-medium uppercase tracking-tight">{product.sold} units sold</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[#1E293B]">{product.price}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}

export default DashboardOverview
