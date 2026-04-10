import SectionCard from './SectionCard'
import { formatDateTime } from '../../utils/dateUtils'


const formatCurrency = value => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(value || 0)



const statusStyles = {
  Completed: 'bg-emerald-50 text-emerald-700',
  Pending: 'bg-amber-50 text-amber-700',
}

const RecentOrdersTable = ({ rows = [] }) => (
  <SectionCard title="Recent Orders" subtitle="Latest order activity across stores">
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-2 py-3">Order ID</th>
            <th className="px-2 py-3">Store</th>
            <th className="px-2 py-3">Amount</th>
            <th className="px-2 py-3">Status</th>
            <th className="px-2 py-3">Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(order => (
            <tr key={order.orderId} className="text-slate-700">
              <td className="px-2 py-3 font-medium text-slate-900">{order.orderId}</td>
              <td className="px-2 py-3">{order.store}</td>
              <td className="px-2 py-3">{formatCurrency(order.amount)}</td>
              <td className="px-2 py-3">
                <span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusStyles[order.status] || 'bg-slate-100 text-slate-600'}`}>
                  {order.status}
                </span>
              </td>
              <td className="px-2 py-3">{formatDateTime(order.date)}</td>

            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionCard>
)

export default RecentOrdersTable

