import React from 'react'
import { Search, Filter, RotateCcw, Plus } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'

const FilterSelect = ({ label, options, value, onChange, name, disabled = false }) => (
  <div className="flex flex-col gap-1.5 flex-1 min-w-[150px]">
    <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className="w-full h-10 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[13px] font-bold text-[#1E293B] outline-none transition focus:border-[#0EA5E9] focus:bg-white disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {options?.length === 0 && <option value="">No options</option>}
      {options?.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  </div>
)

const InventoryFilter = ({ filters, onFilterChange, onReset, onAdd, dropdownOptions, dropdownLoading }) => {
  const handleChange = (e) => {
    const { name, value } = e.target
    onFilterChange(name, value)
  }

  return (
    <div className="bg-white p-6 rounded-xl border border-[#E2E8F0] shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6">
        {/* Row 1 */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider ml-1">Search Items</label>
          <select
            name="searchType"
            value={filters.searchType}
            onChange={handleChange}
            disabled={dropdownLoading}
            className="w-full h-10 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[13px] font-bold text-[#1E293B] outline-none transition focus:border-[#0EA5E9] focus:bg-white disabled:opacity-60"
          >
            {dropdownOptions.searchTypes.length === 0 && <option value="">No options</option>}
            {dropdownOptions.searchTypes.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>

        <Input 
          label="Search Value"
          name="searchValue"
          value={filters.searchValue}
          onChange={handleChange}
          placeholder="Search Value"
          className="bg-[#F8FAFC]"
        />

        <Input 
          label="Find In Name"
          name="nameSearch"
          value={filters.nameSearch}
          onChange={handleChange}
          placeholder="Find In Name"
          className="bg-[#F8FAFC]"
        />

        <FilterSelect 
          label="Item Type" 
          name="type" 
          options={dropdownOptions.itemTypes}
          value={filters.type} 
          onChange={handleChange}
          disabled={dropdownLoading}
        />
        
        <FilterSelect 
          label="Department" 
          name="dept" 
          options={dropdownOptions.departments}
          value={filters.dept} 
          onChange={handleChange}
          disabled={dropdownLoading}
        />

        {/* Row 2 */}
        <FilterSelect 
          label="Category" 
          name="category" 
          options={dropdownOptions.categories}
          value={filters.category} 
          onChange={handleChange}
          disabled={dropdownLoading}
        />

        <FilterSelect 
          label="Item Size" 
          name="size" 
          options={dropdownOptions.sizes}
          value={filters.size} 
          onChange={handleChange}
          disabled={dropdownLoading}
        />

        <FilterSelect 
          label="Item Pack" 
          name="pack" 
          options={dropdownOptions.packs}
          value={filters.pack} 
          onChange={handleChange}
          disabled={dropdownLoading}
        />

        <FilterSelect 
          label="Item Brand" 
          name="brand" 
          options={dropdownOptions.brands}
          value={filters.brand} 
          onChange={handleChange}
          disabled={dropdownLoading}
        />

        <FilterSelect 
          label="Supplier" 
          name="supplier" 
          options={dropdownOptions.suppliers}
          value={filters.supplier} 
          onChange={handleChange}
          disabled={dropdownLoading}
        />
      </div>

      <div className="flex justify-end items-center gap-3 mt-8">
        <Button 
          onClick={() => {}} 
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-8 gap-2 h-11"
        >
          <Filter size={18} />
          Filter
        </Button>
        <Button 
          variant="outline" 
          onClick={onReset}
          className="bg-[#E2E8F0] border-none text-[#475569] hover:bg-[#CBD5E1] px-8 gap-2 h-11"
        >
          <RotateCcw size={18} />
          Reset
        </Button>
        <Button 
          onClick={onAdd}
          className="bg-[#0EA5E9] hover:bg-[#0284C7] text-white px-8 gap-2 h-11"
        >
          <Plus size={18} />
          Add
        </Button>
      </div>
    </div>
  )
}

export default InventoryFilter
