import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { 
  Building2, 
  Layers, 
  ListFilter, 
  Maximize, 
  Package, 
  Award,
  Pencil, 
  Plus, 
  Trash2, 
  X 
} from 'lucide-react'
import Loader from '../common/Loader'
import Button from '../common/Button'
import useFetch from '../../hooks/useFetch'
import useApi from '../../hooks/useApi'
import { refetchDepartments } from '../../hooks/useDepartments'
import { refetchCategories } from '../../hooks/useCategories'
import { refetchSubCategories } from '../../hooks/useSubCategories'
import { refetchSizes } from '../../hooks/useSizes'
import { refetchPacks } from '../../hooks/usePacks'
import { refetchBrands } from '../../hooks/useBrands'

const MASTER_TABS = [
  { key: 'department', label: 'Department', endpoint: '/lookups/departments/', icon: Building2 },
  { key: 'category', label: 'Category', endpoint: '/inventory/categories/', icon: Layers },
  { key: 'sub-category', label: 'Sub Category', endpoint: '/inventory/sub-categories/', icon: ListFilter },
  { key: 'size', label: 'Size', endpoint: '/lookups/sizes/', icon: Maximize },
  { key: 'pack', label: 'Pack', endpoint: '/lookups/packs/', icon: Package },
  { key: 'brand', label: 'Brand', endpoint: '/lookups/brands/', icon: Award },
]

const toArray = value => {
  if (Array.isArray(value)) return value
  if (Array.isArray(value?.results)) return value.results
  return []
}

const getId = value => {
  if (value === null || value === undefined) return null
  if (typeof value === 'number') return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isNaN(parsed) ? null : parsed
  }
  if (typeof value === 'object') {
    if (value.id !== undefined && value.id !== null) return Number(value.id)
    if (value.pk !== undefined && value.pk !== null) return Number(value.pk)
  }
  return null
}

const getName = value => {
  if (!value) return '-'
  if (typeof value === 'string') return value
  return value.name || value.localized_name || value.title || '-'
}

const normalizeRelationName = (record, relationKey, fallbackKey) => {
  const relationValue = record?.[relationKey]
  const fallbackValue = record?.[fallbackKey]
  if (typeof relationValue === 'object' && relationValue !== null) return getName(relationValue)
  if (typeof fallbackValue === 'string') return fallbackValue
  if (typeof relationValue === 'string') return relationValue
  return '-'
}

const getDefaultForm = activeTab => {
  if (activeTab === 'brand') return { name: '', manufacturer: '' }
  if (activeTab === 'category') return { name: '', localized_name: '', department: '' }
  if (activeTab === 'sub-category') return { name: '', localized_name: '', category: '' }
  if (activeTab === 'size') return { name: '', localized_name: '', category: '', uom: '' }
  return { name: '', localized_name: '' }
}

const ItemMasterManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'department'
  const [searchText, setSearchText] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState(getDefaultForm(activeTab))
  const [formError, setFormError] = useState('')

  const activeConfig = useMemo(
    () => MASTER_TABS.find(tab => tab.key === activeTab) || MASTER_TABS[0],
    [activeTab]
  )

  const { data, loading, error, refetch } = useFetch(activeConfig.endpoint)
  const { data: departmentsData } = useFetch('/lookups/departments/')
  const { data: categoriesData } = useFetch('/inventory/categories/')
  const { data: uomsData } = useFetch('/lookups/uoms/')
  const { post, put, del, loading: saving, error: apiError } = useApi()

  const departments = useMemo(() => toArray(departmentsData), [departmentsData])
  const categories = useMemo(() => toArray(categoriesData), [categoriesData])
  const uoms = useMemo(() => toArray(uomsData), [uomsData])
  const rows = useMemo(() => toArray(data), [data])

  useEffect(() => {
    setSearchText('')
    setIsModalOpen(false)
    setFormError('')
    setFormData(getDefaultForm(activeTab))
    setEditingItem(null)
  }, [activeTab])

  const filteredRows = useMemo(() => {
    const query = searchText.trim().toLowerCase()
    if (!query) return rows

    return rows.filter(item => {
      const tokens = [
        item?.id,
        item?.name,
        item?.manufacturer,
        item?.localized_name,
        normalizeRelationName(item, 'department', 'department_name'),
        normalizeRelationName(item, 'category', 'category_name'),
        normalizeRelationName(item, 'uom', 'uom_name'),
      ]
      return tokens.some(token => String(token || '').toLowerCase().includes(query))
    })
  }, [rows, searchText])

  const setTab = tab => {
    setSearchParams({ tab })
  }

  const openCreate = () => {
    setEditingItem(null)
    setFormError('')
    setFormData(getDefaultForm(activeTab))
    setIsModalOpen(true)
  }

  const openEdit = item => {
    const next = getDefaultForm(activeTab)
    next.name = item?.name || ''
    if (activeTab === 'brand') {
      next.manufacturer = item?.manufacturer || ''
    } else {
      next.localized_name = item?.localized_name || ''
    }

    if (activeTab === 'category') {
      next.department = String(getId(item?.department) || '')
    }
    if (activeTab === 'sub-category') {
      next.category = String(getId(item?.category) || '')
    }
    if (activeTab === 'size') {
      next.category = String(getId(item?.category) || '')
      next.uom = String(getId(item?.uom) || '')
    }

    setEditingItem(item)
    setFormError('')
    setFormData(next)
    setIsModalOpen(true)
  }

  const refreshCacheByTab = async tab => {
    if (tab === 'department') return refetchDepartments()
    if (tab === 'category') return refetchCategories()
    if (tab === 'sub-category') return refetchSubCategories()
    if (tab === 'size') return refetchSizes()
    if (tab === 'pack') return refetchPacks()
    if (tab === 'brand') return refetchBrands()
    return Promise.resolve()
  }

  const buildPayload = () => {
    const baseName = formData.name?.trim()
    if (!baseName) {
      throw new Error('Name is required.')
    }

    if (activeTab === 'brand') {
      return {
        name: baseName,
        manufacturer: formData.manufacturer?.trim() || '',
      }
    }

    if (activeTab === 'category') {
      const departmentId = Number(formData.department)
      if (!departmentId) throw new Error('Department is required.')
      return {
        name: baseName,
        localized_name: formData.localized_name?.trim() || '',
        department: departmentId,
      }
    }

    if (activeTab === 'sub-category') {
      const categoryId = Number(formData.category)
      if (!categoryId) throw new Error('Category is required.')
      return {
        name: baseName,
        localized_name: formData.localized_name?.trim() || '',
        category: categoryId,
      }
    }

    if (activeTab === 'size') {
      const categoryId = Number(formData.category)
      const uomId = Number(formData.uom)
      if (!categoryId) throw new Error('Category is required.')
      if (!uomId) throw new Error('UOM is required.')
      return {
        name: baseName,
        localized_name: formData.localized_name?.trim() || '',
        category: categoryId,
        uom: uomId,
      }
    }

    return {
      name: baseName,
      localized_name: formData.localized_name?.trim() || '',
    }
  }

  const handleSave = async () => {
    try {
      setFormError('')
      const payload = buildPayload()

      if (editingItem?.id) {
        await put(`${activeConfig.endpoint}${editingItem.id}/`, payload)
      } else {
        await post(activeConfig.endpoint, payload)
      }

      await Promise.all([refetch(), refreshCacheByTab(activeTab)])
      setIsModalOpen(false)
      setEditingItem(null)
      setFormData(getDefaultForm(activeTab))
    } catch (submitError) {
      setFormError(submitError?.message || 'Unable to save item.')
    }
  }

  const handleDelete = async item => {
    if (!item?.id) return
    const itemName = item?.name || `ID ${item.id}`
    const ok = window.confirm(`Delete "${itemName}"?`)
    if (!ok) return

    try {
      await del(`${activeConfig.endpoint}${item.id}/`)
      await Promise.all([refetch(), refreshCacheByTab(activeTab)])
    } catch (deleteError) {
      setFormError(deleteError?.message || 'Unable to delete item.')
    }
  }

  const columns = useMemo(() => {
    if (activeTab === 'department') {
      return [
        { key: 'id', title: 'ID', render: item => item.id ?? '-' },
        { key: 'name', title: 'DEPARTMENT', render: item => item.name || '-' },
      ]
    }
    if (activeTab === 'category') {
      return [
        { key: 'id', title: 'ID', render: item => item.id ?? '-' },
        { key: 'name', title: 'CATEGORY', render: item => item.name || '-' },
        { key: 'department', title: 'DEPARTMENT', render: item => normalizeRelationName(item, 'department', 'department_name') },
      ]
    }
    if (activeTab === 'sub-category') {
      return [
        { key: 'id', title: 'ID', render: item => item.id ?? '-' },
        { key: 'name', title: 'SUB CATEGORY', render: item => item.name || '-' },
        { key: 'category', title: 'CATEGORY', render: item => normalizeRelationName(item, 'category', 'category_name') },
      ]
    }
    if (activeTab === 'size') {
      return [
        { key: 'id', title: 'ID', render: item => item.id ?? '-' },
        { key: 'name', title: 'SIZE', render: item => item.name || '-' },
        { key: 'category', title: 'CATEGORY', render: item => normalizeRelationName(item, 'category', 'category_name') },
        { key: 'uom', title: 'UOM', render: item => normalizeRelationName(item, 'uom', 'uom_name') },
      ]
    }
    if (activeTab === 'pack') {
      return [
        { key: 'id', title: 'ID', render: item => item.id ?? '-' },
        { key: 'name', title: 'PACK', render: item => item.name || '-' },
      ]
    }
    return [
      { key: 'id', title: 'ID', render: item => item.id ?? '-' },
      { key: 'name', title: 'BRAND NAME', render: item => item.name || '-' },
      { key: 'manufacturer', title: 'MANUFACTURER', render: item => item.manufacturer || '-' },
    ]
  }, [activeTab])

  return (
    <div className="flex flex-col h-full gap-6 animate-in fade-in duration-300 pb-8 pr-2">
      {/* Horizontal Tab Navigation */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-1 flex items-center gap-1 w-fit">
        {MASTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setTab(tab.key)}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-[14px] font-bold transition-all duration-200 ${
              activeTab === tab.key
                ? 'bg-[#0EA5E91A] text-[#0EA5E9]'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <section className="min-w-0 flex-1 rounded-lg border border-[#E2E8F0] bg-white p-5 shadow-sm flex flex-col">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <input
            type="text"
            value={searchText}
            onChange={event => setSearchText(event.target.value)}
            placeholder={`Search ${activeConfig.label}`}
            className="h-10 w-full max-w-[320px] rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] font-medium text-[#1E293B] outline-none transition-all focus:border-[#0EA5E9] focus:bg-white focus:ring-4 focus:ring-[#0EA5E90D]"
          />
          <div className="flex-1" />
          <Button className="gap-2" onClick={openCreate}>
            <Plus size={16} />
            Add
          </Button>
        </div>

        <div className="overflow-hidden rounded-lg border border-[#E2E8F0]">
          <div className="overflow-auto">
            <table className="w-full border-collapse text-left text-[14px]">
              <thead className="bg-[#F8FAFC]">
                <tr className="border-b border-[#E2E8F0]">
                  {columns.map(column => (
                    <th
                      key={column.key}
                      className="whitespace-nowrap px-5 py-3 text-[11px] font-black uppercase tracking-wider text-[#64748B]"
                    >
                      {column.title}
                    </th>
                  ))}
                  <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-wider text-[#64748B]">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] bg-white">
                {loading && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-5 py-8 text-center text-[#64748B]">
                      <Loader size={40} className="mx-auto mb-2" />
                      Loading...
                    </td>
                  </tr>
                )}
                {!loading && error && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-5 py-8 text-center font-bold text-rose-500">
                      {error}
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredRows.length === 0 && (
                  <tr>
                    <td colSpan={columns.length + 1} className="px-5 py-8 text-center text-[#64748B]">
                      No records found.
                    </td>
                  </tr>
                )}
                {!loading && !error && filteredRows.map((item, index) => (
                  <tr key={item?.id || index} className="hover:bg-[#F8FAFC]">
                    {columns.map(column => (
                      <td key={column.key} className="whitespace-nowrap px-5 py-3 text-[#1E293B]">
                        {column.render(item)}
                      </td>
                    ))}
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => openEdit(item)}
                          className="rounded p-1 text-[#0EA5E9] transition hover:bg-[#E0F2FE]"
                          title="Edit"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(item)}
                          className="rounded p-1 text-rose-500 transition hover:bg-rose-50"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/30 p-4 backdrop-blur-[2px]">
          <div className="w-full max-w-md rounded-xl border border-[#E2E8F0] bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] px-5 py-4">
              <h3 className="text-[16px] font-bold text-[#1E293B]">
                {editingItem ? `Edit ${activeConfig.label}` : `Add ${activeConfig.label}`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#1E293B]"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 p-5">
              {(formError || apiError) && (
                <div className="rounded-lg border border-rose-100 bg-rose-50 px-3 py-2 text-[13px] font-bold text-rose-600">
                  {formError || apiError}
                </div>
              )}

              <input
                value={formData.name || ''}
                onChange={event => setFormData(prev => ({ ...prev, name: event.target.value }))}
                placeholder="Name *"
                className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
              />

              {activeTab !== 'brand' && (
                <input
                  value={formData.localized_name || ''}
                  onChange={event => setFormData(prev => ({ ...prev, localized_name: event.target.value }))}
                  placeholder="Localized Name"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                />
              )}

              {activeTab === 'brand' && (
                <input
                  value={formData.manufacturer || ''}
                  onChange={event => setFormData(prev => ({ ...prev, manufacturer: event.target.value }))}
                  placeholder="Manufacturer"
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                />
              )}

              {activeTab === 'category' && (
                <select
                  value={formData.department || ''}
                  onChange={event => setFormData(prev => ({ ...prev, department: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                >
                  <option value="">Select Department *</option>
                  {departments.map(department => (
                    <option key={department.id || department.name} value={String(department.id || '')}>
                      {department.name}
                    </option>
                  ))}
                </select>
              )}

              {activeTab === 'sub-category' && (
                <select
                  value={formData.category || ''}
                  onChange={event => setFormData(prev => ({ ...prev, category: event.target.value }))}
                  className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                >
                  <option value="">Select Category *</option>
                  {categories.map(category => (
                    <option key={category.id || category.name} value={String(category.id || '')}>
                      {category.name}
                    </option>
                  ))}
                </select>
              )}

              {activeTab === 'size' && (
                <>
                  <select
                    value={formData.category || ''}
                    onChange={event => setFormData(prev => ({ ...prev, category: event.target.value }))}
                    className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                  >
                    <option value="">Select Category *</option>
                    {categories.map(category => (
                      <option key={category.id || category.name} value={String(category.id || '')}>
                        {category.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.uom || ''}
                    onChange={event => setFormData(prev => ({ ...prev, uom: event.target.value }))}
                    className="h-10 w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 text-[14px] text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:bg-white"
                  >
                    <option value="">Select UOM *</option>
                    {uoms.map(uom => (
                      <option key={uom.id || uom.name} value={String(uom.id || '')}>
                        {uom.name || '-'}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>

            <div className="flex justify-end gap-3 border-t border-[#E2E8F0] bg-[#F8FAFC] px-5 py-4">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} className="min-w-[120px]">
                {saving ? 'Saving...' : (editingItem ? 'Update' : 'Save')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ItemMasterManagement
