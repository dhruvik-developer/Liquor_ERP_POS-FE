import React, { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
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

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100]

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
  const [pageSize, setPageSize] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const [pageInput, setPageInput] = useState('1')

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

  const totalProducts = filteredData.length
  const totalPages = Math.max(1, Math.ceil(totalProducts / pageSize))

  useEffect(() => {
    setCurrentPage(1)
    setPageInput('1')
  }, [filters, pageSize])

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages)
      setPageInput(String(totalPages))
      return
    }

    setPageInput(String(currentPage))
  }, [currentPage, totalPages])

  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredData.slice(start, start + pageSize)
  }, [filteredData, currentPage, pageSize])

  const pageStart = totalProducts === 0 ? 0 : ((currentPage - 1) * pageSize) + 1
  const pageEnd = totalProducts === 0 ? 0 : Math.min(currentPage * pageSize, totalProducts)

  const handlePageChange = nextPage => {
    const safePage = Math.min(Math.max(1, nextPage), totalPages)
    setCurrentPage(safePage)
    setPageInput(String(safePage))
  }

  const handlePageInputCommit = () => {
    const parsedPage = Number(pageInput)
    if (!Number.isInteger(parsedPage) || parsedPage < 1) {
      setPageInput(String(currentPage))
      return
    }

    handlePageChange(parsedPage)
  }

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
        <>
          <div className="flex flex-wrap items-center justify-end gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[13px] text-[#475569]">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={event => setPageSize(Number(event.target.value))}
                className="min-w-[64px] rounded border border-[#CBD5E1] bg-white px-2 py-1 text-[13px] font-medium text-[#1E293B] outline-none"
              >
                {PAGE_SIZE_OPTIONS.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <span>records</span>
            </div>
          </div>

          <InventoryTable products={paginatedProducts} onEdit={handleEdit} />

          <div className="flex flex-col gap-3 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-[13px] text-[#475569] md:flex-row md:items-center md:justify-between">
            <div>
              {pageStart} - {pageEnd} of {totalProducts} records
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handlePageChange(1)}
                disabled={currentPage === 1 || totalProducts === 0}
                className="flex h-8 w-8 items-center justify-center rounded border border-[#CBD5E1] bg-white text-[#64748B] transition hover:bg-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-50"
                title="First Page"
              >
                <ChevronsLeft size={14} />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || totalProducts === 0}
                className="flex h-8 items-center gap-1 rounded border border-[#CBD5E1] bg-white px-2 text-[#64748B] transition hover:bg-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <div className="flex items-center gap-2 px-1">
                <span>Pg</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={pageInput}
                  onChange={event => setPageInput(event.target.value.replace(/[^\d]/g, ''))}
                  onBlur={handlePageInputCommit}
                  onKeyDown={event => {
                    if (event.key === 'Enter') handlePageInputCommit()
                  }}
                  className="h-8 w-14 rounded border border-[#CBD5E1] bg-white px-2 text-center font-medium text-[#1E293B] outline-none"
                />
                <span>of {totalPages}</span>
              </div>
              <button
                type="button"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || totalProducts === 0}
                className="flex h-8 items-center gap-1 rounded border border-[#CBD5E1] bg-white px-2 text-[#64748B] transition hover:bg-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={14} />
              </button>
              <button
                type="button"
                onClick={() => handlePageChange(totalPages)}
                disabled={currentPage === totalPages || totalProducts === 0}
                className="flex h-8 w-8 items-center justify-center rounded border border-[#CBD5E1] bg-white text-[#64748B] transition hover:bg-[#E2E8F0] disabled:cursor-not-allowed disabled:opacity-50"
                title="Last Page"
              >
                <ChevronsRight size={14} />
              </button>
            </div>
          </div>
        </>
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
          <span className="text-[14px] font-bold text-[#1E293B]">Total Products:</span>
          <span className="text-[14px] font-black text-[#1E293B]">{totalProducts}</span>
        </div>
      </div>
    </div>
  )
}

export default InventoryManagement
