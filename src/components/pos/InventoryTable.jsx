import React from 'react'

const InventoryTable = ({ products }) => {
  return (
    <div className="flex-1 overflow-auto rounded-3xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">SKU</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-center">Image</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Item Name</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Size</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Pack</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Price</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right">Total Qty</th>
            <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-wider text-slate-500 text-right pr-8">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {products.length > 0 ? (
            products.map((item) => (
              <tr key={item.sku} className="group hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.sku}</td>
                <td className="px-6 py-4 text-center">
                  <div className="h-10 w-10 mx-auto rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{item.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-medium">{item.category} • {item.brand}</p>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{item.size}</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{item.pack}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right">${item.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${item.qty < 50 ? 'bg-rose-50 text-rose-600' : 'bg-slate-100 text-slate-700'}`}>
                    {item.qty}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 text-right pr-8">${item.total.toLocaleString()}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-20 text-center text-slate-400">
                <div className="flex flex-col items-center gap-2">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-10 w-10 opacity-20">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <p className="text-sm font-medium">No products found matching your filters</p>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryTable
