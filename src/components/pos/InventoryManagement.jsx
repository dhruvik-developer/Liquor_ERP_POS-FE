import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { inventoryData } from '../../mocks/inventoryData'
import InventoryFilter from './InventoryFilter'
import InventoryTable from './InventoryTable'
import AddProductModal from './AddProductModal'

const InventoryManagement = () => {
  const [filters, setFilters] = useState({
    searchType: 'SKU/UPC',
    searchValue: '',
    nameSearch: '',
    type: 'All',
    dept: 'All',
    category: 'All',
    size: 'All',
    pack: 'All',
    brand: 'All',
    supplier: 'All',
    includeInactive: false
  })

  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleReset = () => {
    setFilters({
      searchType: 'SKU/UPC',
      searchValue: '',
      nameSearch: '',
      type: 'All',
      dept: 'All',
      category: 'All',
      size: 'All',
      pack: 'All',
      brand: 'All',
      supplier: 'All',
      includeInactive: false
    })
  }

  const filteredData = useMemo(() => {
    return inventoryData.filter(item => {
      const matchSearch = !filters.searchValue || 
        (filters.searchType === 'SKU/UPC' && item.sku.toLowerCase().includes(filters.searchValue.toLowerCase())) ||
        (filters.searchType === 'ID' && item.id.toString().includes(filters.searchValue))
      
      const matchName = !filters.nameSearch || item.name.toLowerCase().includes(filters.nameSearch.toLowerCase())
      const matchType = filters.type === 'All' || item.type === filters.type
      const matchDept = filters.dept === 'All' || item.department === filters.dept
      const matchCategory = filters.category === 'All' || item.category === filters.category
      const matchSize = filters.size === 'All' || item.size === filters.size
      const matchPack = filters.pack === 'All' || item.pack === filters.pack
      const matchBrand = filters.brand === 'All' || item.brand === filters.brand
      const matchSupplier = filters.supplier === 'All' || item.supplier === filters.supplier

      return matchSearch && matchName && matchType && matchDept && matchCategory && matchSize && matchPack && matchBrand && matchSupplier
    })
  }, [filters])

  const totalValue = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.total, 0)
  }, [filteredData])

  return (
    <div className="space-y-6">
      <InventoryFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={handleReset}
        onAdd={() => setIsAddModalOpen(true)} 
      />

      <InventoryTable products={filteredData} />

      <AddProductModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {/* Footer Area */}
      <div className="mt-6 flex items-center justify-between px-2">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative flex items-center justify-center">
            <input 
              type="checkbox"
              checked={filters.includeInactive}
              onChange={(e) => handleFilterChange('includeInactive', e.target.checked)}
              className="peer h-5 w-5 cursor-pointer appearance-none rounded-full border border-[#CBD5E1] bg-white transition-all checked:border-[#0EA5E9] checked:bg-[#0EA5E9]"
            />
            <div className="pointer-events-none absolute text-white opacity-0 transition-opacity peer-checked:opacity-100">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor" stroke="currentColor" strokeWidth="1">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <span className="text-[14px] font-medium text-[#64748B] group-hover:text-[#1E293B] transition-colors">Include Inactive Items</span>
        </label>

        <div className="flex items-center gap-2">
          <span className="text-[14px] font-bold text-[#1E293B]">Total:</span>
          <span className="text-[14px] font-black text-[#1E293B]">{totalValue}</span>
        </div>
      </div>
    </div>
  )
}

export default InventoryManagement
