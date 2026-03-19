import { useMemo, useState } from 'react'
import SectionCard from './SectionCard'

const sortComparators = {
  storeName: (a, b) => a.storeName.localeCompare(b.storeName),
  totalSales: (a, b) => a.totalSales - b.totalSales,
  ordersCount: (a, b) => a.ordersCount - b.ordersCount,
  revenue: (a, b) => a.revenue - b.revenue,
}

const formatCurrency = value => new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
}).format(value || 0)

const StorePerformanceTable = ({ rows = [] }) => {
  const [sortBy, setSortBy] = useState('revenue')
  const [sortDirection, setSortDirection] = useState('desc')

  const sortedRows = useMemo(() => {
    const comparator = sortComparators[sortBy]
    const sorted = [...rows].sort(comparator)
    return sortDirection === 'asc' ? sorted : sorted.reverse()
  }, [rows, sortBy, sortDirection])

  const changeSort = field => {
    if (field === sortBy) {
      setSortDirection(current => (current === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortBy(field)
    setSortDirection('desc')
  }

  const sortLabel = field => (sortBy === field ? ` ${sortDirection === 'asc' ? '↑' : '↓'}` : '')

  return (
    <SectionCard title="Store-wise Performance" subtitle="Sort stores by sales, order volume, or revenue">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-2 py-3">
                <button type="button" onClick={() => changeSort('storeName')} className="hover:text-slate-800">
                  Store Name{sortLabel('storeName')}
                </button>
              </th>
              <th className="px-2 py-3">
                <button type="button" onClick={() => changeSort('totalSales')} className="hover:text-slate-800">
                  Total Sales{sortLabel('totalSales')}
                </button>
              </th>
              <th className="px-2 py-3">
                <button type="button" onClick={() => changeSort('ordersCount')} className="hover:text-slate-800">
                  Orders Count{sortLabel('ordersCount')}
                </button>
              </th>
              <th className="px-2 py-3">
                <button type="button" onClick={() => changeSort('revenue')} className="hover:text-slate-800">
                  Revenue{sortLabel('revenue')}
                </button>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {sortedRows.map(row => (
              <tr key={row.id || row.storeName} className="text-slate-700">
                <td className="px-2 py-3 font-medium text-slate-900">{row.storeName}</td>
                <td className="px-2 py-3">{row.totalSales}</td>
                <td className="px-2 py-3">{row.ordersCount}</td>
                <td className="px-2 py-3 font-semibold text-slate-900">{formatCurrency(row.revenue)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  )
}

export default StorePerformanceTable

