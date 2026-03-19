import SectionCard from './SectionCard'

const qtyStyle = qty => (qty <= 4 ? 'text-rose-600' : qty <= 7 ? 'text-amber-600' : 'text-slate-700')

const InventoryAlertsTable = ({ rows = [] }) => (
  <SectionCard title="Inventory Alerts" subtitle="Low-stock items that need replenishment">
    <div className="overflow-x-auto">
      <table className="min-w-full text-left text-sm">
        <thead className="text-xs uppercase tracking-wider text-slate-500">
          <tr>
            <th className="px-2 py-3">Product</th>
            <th className="px-2 py-3">Store</th>
            <th className="px-2 py-3">Remaining Qty</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map(item => (
            <tr key={`${item.productName}-${item.store}`} className="text-slate-700">
              <td className="px-2 py-3 font-medium text-slate-900">{item.productName}</td>
              <td className="px-2 py-3">{item.store}</td>
              <td className={`px-2 py-3 font-semibold ${qtyStyle(item.remainingQty)}`}>{item.remainingQty}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </SectionCard>
)

export default InventoryAlertsTable

