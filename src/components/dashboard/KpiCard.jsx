const formatNumber = value => new Intl.NumberFormat('en-US').format(value || 0)
const formatCurrency = value => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(value || 0)

const trendClass = trend => {
  if (trend > 0) return 'text-emerald-600 bg-emerald-50'
  if (trend < 0) return 'text-rose-600 bg-rose-50'
  return 'text-neutral-500 bg-neutral-100'
}

const KpiCard = ({ title, value, icon, trend, isCurrency = false }) => (
  <div className="rounded-[24px] border border-neutral-100 bg-white p-6 shadow-sm transition-all hover:shadow-md group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full bg-primary/5 transition-transform group-hover:scale-110"></div>
    <div className="flex items-start justify-between relative z-10">
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-neutral-400 mb-1">{title}</p>
        <p className="text-2xl font-black text-neutral-800 tracking-tighter">
          {isCurrency ? formatCurrency(value) : formatNumber(value)}
        </p>
      </div>
      <div className="rounded-2xl bg-primary-light p-3 text-primary shadow-inner">{icon}</div>
    </div>
    {trend !== undefined ? (
      <p className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest relative z-10 ${trendClass(trend)}`}>
        {trend > 0 ? '↗' : '↘'}
        {Math.abs(trend)}% Growth
      </p>
    ) : null}
  </div>
)

export default KpiCard
