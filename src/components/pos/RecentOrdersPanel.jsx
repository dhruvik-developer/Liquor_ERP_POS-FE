const formatDate = value => new Date(value).toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
})

const RecentOrdersPanel = ({ orders }) => (
  <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 shadow-sm flex flex-col h-full">
    <h3 className="text-[14px] font-bold text-[#1E293B] uppercase tracking-wider mb-3">Recent Orders</h3>
    <div className="space-y-2 overflow-auto pr-1">
      {orders.slice(0, 5).map(order => (
        <div key={order.id} className="rounded-lg bg-[#F8FAFC] border border-[#F1F5F9] px-3 py-2 text-[12px] group hover:border-[#0EA5E9] transition-colors cursor-pointer">
          <div className="flex items-center justify-between">
            <p className="font-bold text-[#1E293B] group-hover:text-[#0EA5E9] transition-colors">{order.id}</p>
            <p className="text-[#94A3B8] font-medium">{formatDate(order.createdAt)}</p>
          </div>
          <div className="mt-1 flex items-center justify-between">
            <p className="text-[#64748B] font-medium">{order.storeName}</p>
            <p className={`font-bold ${order.status === 'Completed' ? 'text-emerald-500' : 'text-amber-500'}`}>{order.status}</p>
          </div>
          <div className="mt-2 text-right">
             <p className="text-[14px] font-black text-[#1E293B] tracking-tight">${order.total?.toFixed(2)}</p>
          </div>
        </div>
      ))}
      {orders.length === 0 && (
         <div className="py-8 text-center text-[#94A3B8] italic font-medium">No recent orders</div>
      )}
    </div>
  </div>
)

export default RecentOrdersPanel
