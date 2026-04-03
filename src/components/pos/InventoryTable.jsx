import React from 'react'
import { Pencil } from 'lucide-react'

const InventoryTable = ({ products, onEdit }) => {
  return (
    <div className="flex-1 overflow-auto bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <tr>
            <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">SKU</th>
            <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Item Name</th>
            <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Size</th>
            <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Pack</th>
            <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Price</th>
            <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Total Qty</th>
            <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Total</th>
            <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#F1F5F9]">
          {products.length > 0 ? (
            products.map((item) => (
              <tr key={item.sku} className="hover:bg-[#F8FAFC] transition-colors group">
                <td className="px-6 py-4 text-[14px] font-medium text-[#64748B]">{item.sku}</td>
                <td className="px-6 py-4">
                   <p className="text-[14px] font-bold text-[#1E293B] uppercase">{item.name}</p>
                </td>
                <td className="px-6 py-4 text-[14px] font-medium text-[#64748B]">{item.size}</td>
                <td className="px-6 py-4 text-[14px] font-medium text-[#64748B]">{item.pack}</td>
                <td className="px-6 py-4 text-[14px] font-bold text-[#1E293B]">{item.price.toFixed(2)}</td>
                <td className="px-6 py-4 text-[14px] font-medium text-[#64748B]">{item.stock}</td>
                <td className="px-6 py-4 text-[14px] font-medium text-[#64748B]">{item.total}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button 
                      onClick={() => onEdit?.(item)}
                      className="p-2 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 transition-colors"
                      title="Edit Product"
                    >
                      <Pencil size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="px-6 py-20 text-center">
                <p className="text-[#64748B] font-medium">No products found</p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default InventoryTable
