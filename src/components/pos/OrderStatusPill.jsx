const OrderStatusPill = ({ status }) => {
  const isCompleted = status === 'Completed'
  
  return (
    <div className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider border ${
      isCompleted 
        ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
        : 'bg-[#0EA5E90D] text-[#0EA5E9] border-[#0EA5E91A]'
    }`}>
      {status}
    </div>
  )
}

export default OrderStatusPill
