import SectionCard from './SectionCard'

const urgencyStyles = {
  High: 'bg-rose-50 text-rose-700 ring-rose-200',
  Medium: 'bg-amber-50 text-amber-700 ring-amber-200',
  Low: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
}

const PendingOrdersPanel = ({ rows = [] }) => (
  <SectionCard title="Pending Orders" subtitle="Escalate high urgency stores first">
    <div className="space-y-3">
      {rows.map(item => (
        <div key={item.storeName} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5">
          <div>
            <p className="text-sm font-semibold text-slate-900">{item.storeName}</p>
            <p className="text-xs text-slate-500">{item.count} pending orders</p>
          </div>
          <span className={`rounded-full px-2 py-1 text-xs font-semibold ring-1 ${urgencyStyles[item.urgency] || 'bg-slate-100 text-slate-600 ring-slate-200'}`}>
            {item.urgency}
          </span>
        </div>
      ))}
    </div>
  </SectionCard>
)

export default PendingOrdersPanel

