import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Pencil, 
  Trash2, 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle 
} from 'lucide-react'
import { inventoryData } from '../../mocks/inventoryData'
import Button from '../common/Button'
import Input from '../common/Input'

const InventoryManagement = () => {
  const [activeTab, setActiveTab] = useState('All')
  
  const stats = [
    { label: 'All Products', count: 1540, id: 'All', icon: ShoppingBag, color: 'text-[#0EA5E9]', bg: 'bg-[#0EA5E91A]' },
    { label: 'In Stock', count: 1245, id: 'In Stock', icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Low Stock', count: 245, id: 'Low Stock', icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Out of Stock', count: 50, id: 'Out of Stock', icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50' }
  ]

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-8 pr-2">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <button
            key={stat.id}
            onClick={() => setActiveTab(stat.id)}
            className={`flex items-center gap-4 p-5 rounded-lg border transition-all duration-300 text-left group ${
              activeTab === stat.id 
                ? `bg-white border-[#0EA5E9] shadow-md ring-4 ring-[#0EA5E90D]` 
                : 'bg-white border-[#E2E8F0] shadow-sm hover:border-[#CBD5E1] hover:shadow-md'
            }`}
          >
            <div className={`h-12 w-12 rounded-lg ${stat.bg} flex items-center justify-center transition-transform group-hover:scale-110`}>
              <stat.icon size={24} className={stat.color} />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">{stat.label}</p>
              <p className={`text-[24px] font-black ${activeTab === stat.id ? 'text-[#0EA5E9]' : 'text-[#1E293B]'}`}>
                {stat.count.toLocaleString()}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Filter & Actions Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <Input 
            placeholder="Search products..." 
            icon={Search}
            className="w-72"
          />
          <Button variant="outline" className="gap-2">
            <Filter size={18} />
            Filters
          </Button>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 text-[#64748B]">
            <Download size={18} />
            Download CSV
          </Button>
          <Link to="/pos/products/add">
            <Button className="gap-2">
              <Plus size={18} />
              Add Product
            </Button>
          </Link>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Product</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">SKU/UPC</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">In-Stock</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Unit Price</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Department</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {inventoryData.map((product) => (
                <tr key={product.id} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 relative flex items-center justify-center bg-[#F8FAFC] rounded-lg border border-[#E2E8F0] p-1">
                        <img 
                          src={product.image} 
                          alt={product.name} 
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-[#0EA5E9] hover:underline cursor-pointer">{product.name}</p>
                        <p className="text-[12px] text-[#94A3B8]">ID: {product.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#64748B] whitespace-nowrap font-medium">{product.sku}</td>
                  <td className="px-6 py-4 text-center font-bold text-[#1E293B]">{product.stock}</td>
                  <td className="px-6 py-4 text-center font-bold text-[#1E293B]">${product.price}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-[#F1F5F9] text-[#475569] text-[12px] font-bold rounded-md uppercase tracking-wide">
                      {product.department}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-[12px] font-bold uppercase tracking-wide border ${
                      product.stock > 20 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                      product.stock > 0 ? 'bg-amber-50 text-amber-600 border-amber-100' :
                      'bg-rose-50 text-rose-600 border-rose-100'
                    }`}>
                      {product.stock > 20 ? 'In Stock' : product.stock > 0 ? 'Low Stock' : 'Out of Stock'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button className="p-2 text-[#94A3B8] hover:text-[#0EA5E9] hover:bg-[#0EA5E90D] rounded-lg transition-all">
                        <Pencil size={16} />
                      </button>
                      <button className="p-2 text-[#94A3B8] hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="px-8 py-4 bg-[#F8FAFC] border-t border-[#E2E8F0] flex items-center justify-between mt-auto">
          <span className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Total Inventory Value:</span>
          <p className="text-[20px] font-black text-[#0EA5E9] tracking-tight">$452,120.45</p>
        </div>
      </div>
    </div>
  )
}

export default InventoryManagement
