import React from 'react'
import { filterOptions } from '../../mocks/inventoryData'
import Button from '../common/Button'
import Input from '../common/Input'

const FilterSelect = ({ label, options, value, onChange, name }) => (
  <div className="flex flex-col gap-1.5 flex-1 min-w-[140px]">
    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[14px] font-bold text-[#1E293B] outline-none transition focus:border-[#0EA5E9] focus:bg-white"
    >
      {options?.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
)

const InventoryFilter = ({ filters, onFilterChange, onReset, onAdd }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    onFilterChange(name, value)
  }

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6">
        {/* Row 1 */}
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1.5 min-w-[120px]">
            <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-1">Search Type</label>
            <select
              name="searchType"
              value={filters.searchType}
              onChange={handleChange}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[14px] font-black text-[#1E293B] outline-none focus:border-[#0EA5E9] transition-all"
            >
              <option value="SKU">SKU</option>
              <option value="UPC">UPC</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5 flex-[2] min-w-[200px]">
             <Input 
                label="Search Value"
                name="searchValue"
                value={filters.searchValue}
                onChange={handleChange}
                placeholder="Enter SKU or barcode..."
             />
          </div>

          <div className="flex flex-col gap-1.5 flex-[2] min-w-[200px]">
             <Input 
                label="Find in Name"
                name="nameSearch"
                value={filters.nameSearch}
                onChange={handleChange}
                placeholder="Enter product name..."
             />
          </div>

          <FilterSelect label="Item Type" name="type" options={filterOptions.itemTypes} value={filters.type} onChange={handleChange} />
          <FilterSelect label="Department" name="dept" options={filterOptions.departments} value={filters.dept} onChange={handleChange} />
        </div>

        {/* Row 2 */}
        <div className="flex flex-wrap items-end gap-4">
          <FilterSelect label="Category" name="category" options={filterOptions.categories} value={filters.category} onChange={handleChange} />
          <FilterSelect label="Item Size" name="size" options={filterOptions.sizes} value={filters.size} onChange={handleChange} />
          <FilterSelect label="Item Pack" name="pack" options={filterOptions.packs} value={filters.pack} onChange={handleChange} />
          <FilterSelect label="Item Brand" name="brand" options={filterOptions.brands} value={filters.brand} onChange={handleChange} />
          <FilterSelect label="Supplier" name="supplier" options={filterOptions.suppliers} value={filters.supplier} onChange={handleChange} />

          <div className="flex items-center gap-2 ml-auto pt-4">
            <Button
              variant="outline"
              onClick={onReset}
              className="px-6 h-10"
            >
              Reset
            </Button>
            <Button
              onClick={() => {}} 
              className="px-8 h-10 bg-[#1E293B] hover:bg-[#0F172A]"
            >
              Filter
            </Button>
            <Button
              onClick={onAdd}
              className="px-8 h-10"
            >
              + Add Product
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default InventoryFilter
