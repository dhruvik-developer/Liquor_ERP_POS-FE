import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Loader from '../common/Loader'
import InventoryFilter from './InventoryFilter'
import InventoryTable from './InventoryTable'
import AddProductModal from './AddProductModal'
import useFetch from '../../hooks/useFetch'
import useDepartments from '../../hooks/useDepartments'
import useCategories from '../../hooks/useCategories'
import usePacks from '../../hooks/usePacks'
import useBrands from '../../hooks/useBrands'
import useSizes from '../../hooks/useSizes'

const uniqueWithAll = values => {
  const cleaned = values
    .filter(Boolean)
    .map(value => `${value}`.trim())
    .filter(value => Boolean(value) && value.toLowerCase() !== 'all')
  return ['All', ...Array.from(new Set(cleaned))]
}

const toNameList = list => (
  Array.isArray(list)
    ? list.map(item => (typeof item === 'string' ? item : item?.name || item?.title || item?.value || '')).filter(Boolean)
    : []
)

const InventoryManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    searchType: '',
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
  const [editingProduct, setEditingProduct] = useState(null)

  useEffect(() => {
    if (searchParams.get('openAddProduct') === '1') {
      setIsAddModalOpen(true)
    }
  }, [searchParams])

  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }))
  }

  const handleEdit = (mappedProduct) => {
    const originalProduct = (products || []).find(p => p.id === mappedProduct.id)
    setEditingProduct(originalProduct)
    setIsAddModalOpen(true)
  }

  const handleAdd = () => {
    setEditingProduct(null)
    setIsAddModalOpen(true)
  }

  const handleReset = () => {
    setFilters({
      searchType: '',
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

  const { data: responseData, loading, error, refetch: refetchProducts } = useFetch('/inventory/products/')
  const { categories: categoriesData, loading: categoriesLoading } = useCategories()
  const { packs: packsData, loading: packsLoading } = usePacks()
  const { brands: brandsData, loading: brandsLoading } = useBrands()
  const { sizes: sizesData, loading: sizesLoading } = useSizes()
  const { data: vendorsData, loading: vendorsLoading } = useFetch('/people/vendors/')
  const { departments: departmentsData, loading: departmentsLoading } = useDepartments()

  const products = Array.isArray(responseData) ? responseData : responseData?.results || []
  const categories = Array.isArray(categoriesData) ? categoriesData : []
  const vendors = Array.isArray(vendorsData) ? vendorsData : vendorsData?.results || []

  // Map backend product data to match what the filter/table expects
  const mappedProducts = useMemo(() => {
    return products.map(p => {
      const qty = Number(
        p.total_stock_available
        ?? p.stock
        ?? p.stock_quantity
        ?? p.quantity
        ?? p.stock_information?.quantity
        ?? 0
      ) || 0
      const price = Number(p.unit_price ?? p.cost_pricing?.unit_price) || 0

      return {
        id: p.id,
        sku: p.sku || p.barcode || '',
        name: p.name || p.product_name || '',
        type: p.type || '-',
        department: p.department?.name || p.department_name || p.department || 'All',
        category: p.category?.name || p.category_name || p.category || 'All',
        size: p.size?.name || p.size_name || p.size || 'All',
        pack: p.pack?.name || p.pack_name || p.pack || 'All',
        brand: p.brand?.name || p.brand_name || p.brand || 'All',
        supplier: p.supplier?.company_name || p.vendor || 'All',
        price,
        qty,
        reorderLevel: Number(
          p.reorder_level
          ?? p.stock_information?.reorder_level
          ?? p.stock_information?.reorder_qty
          ?? 0
        ) || 0,
        minQty: Number(
          p.min_qty
          ?? p.minimum_qty
          ?? p.stock_information?.min_qty
          ?? p.stock_information?.min_warn_qty
          ?? 0
        ) || 0,
        total: price * qty,
        isInactive: p.item_is_inactive === true || p.is_active === false
      }
    })
  }, [products])

  const dropdownOptions = useMemo(() => {
    const searchTypes = ['SKU/UPC', 'ID']
    const itemTypes = uniqueWithAll([
      ...mappedProducts.map(product => product.type),
    ])
    const departments = uniqueWithAll([
      ...toNameList(departmentsData),
      ...mappedProducts.map(product => product.department),
    ])
    const categoryOptions = uniqueWithAll([
      ...categories.map(category => category.name),
      ...mappedProducts.map(product => product.category),
    ])
    const sizes = uniqueWithAll([
      ...toNameList(sizesData),
      ...mappedProducts.map(product => product.size),
    ])
    const packs = uniqueWithAll([
      ...toNameList(packsData),
      ...mappedProducts.map(product => product.pack),
    ])
    const brands = uniqueWithAll([
      ...toNameList(brandsData),
      ...mappedProducts.map(product => product.brand),
    ])
    const suppliers = uniqueWithAll([
      ...vendors.map(vendor => vendor.vendor_name || vendor.company_name || vendor.name),
      ...mappedProducts.map(product => product.supplier),
    ])

    return {
      searchTypes,
      itemTypes,
      departments,
      categories: categoryOptions,
      sizes,
      packs,
      brands,
      suppliers,
    }
  }, [departmentsData, packsData, brandsData, sizesData, categories, vendors, mappedProducts])

  useEffect(() => {
    if (!filters.searchType && dropdownOptions.searchTypes.length > 0) {
      setFilters(prev => ({ ...prev, searchType: dropdownOptions.searchTypes[0] }))
    }
  }, [dropdownOptions.searchTypes, filters.searchType])

  const filteredData = useMemo(() => {
    return mappedProducts.filter(item => {
      if (!filters.includeInactive && item.isInactive) return false

      const matchSearch = !filters.searchValue || 
        ((filters.searchType === 'ID')
          ? item.id?.toString().includes(filters.searchValue)
          : item.sku.toLowerCase().includes(filters.searchValue.toLowerCase()))
      
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
  }, [filters, mappedProducts])

  const totalValue = useMemo(() => {
    return filteredData.reduce((sum, item) => sum + item.total, 0)
  }, [filteredData])

  return (
    <div className="space-y-6">
      <InventoryFilter 
        filters={filters} 
        onFilterChange={handleFilterChange} 
        onReset={handleReset}
        onAdd={handleAdd}
        dropdownOptions={dropdownOptions}
        dropdownLoading={categoriesLoading || packsLoading || brandsLoading || sizesLoading || vendorsLoading || departmentsLoading}
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-[#E2E8F0] shadow-sm">
          <Loader size={48} className="mx-auto" />
          <p className="mt-2 text-[#64748B] font-medium">Loading inventory data...</p>
        </div>
      ) : error ? (
        <div className="p-8 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 text-center font-bold">
          {error}
        </div>
      ) : (
        <InventoryTable products={filteredData} onEdit={handleEdit} />
      )}

      <AddProductModal 
        isOpen={isAddModalOpen} 
        product={editingProduct}
        departments={departmentsData}
        onSaved={() => refetchProducts()}
        onClose={() => {
          setIsAddModalOpen(false)
          setEditingProduct(null)
          if (searchParams.get('openAddProduct') === '1') {
            const nextParams = new URLSearchParams(searchParams)
            nextParams.delete('openAddProduct')
            setSearchParams(nextParams, { replace: true })
          }
        }} 
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
