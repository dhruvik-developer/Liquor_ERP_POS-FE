import React, { useEffect, useState } from 'react'
import { X, Save } from 'lucide-react'
import Loader from './Loader'
import useFetch from '../../hooks/useFetch'
import useApi from '../../hooks/useApi'
import { refetchDepartments } from '../../hooks/useDepartments'
import { refetchCategories } from '../../hooks/useCategories'
import { refetchPacks } from '../../hooks/usePacks'
import { refetchBrands } from '../../hooks/useBrands'
import { refetchSubCategories } from '../../hooks/useSubCategories'
import { refetchSizes } from '../../hooks/useSizes'

const QuickAddModal = ({ isOpen, onClose, type, onSave, departments = [] }) => {
  const [formData, setFormData] = useState({})
  const [formError, setFormError] = useState('')
  const { data: categoriesData, loading: categoriesLoading } = useFetch('/inventory/categories/')
  const { data: uomsData, loading: uomsLoading } = useFetch('/lookups/uoms/')
  const { post, get, loading: isSaving, error: apiError } = useApi()

  const categories = Array.isArray(categoriesData) ? categoriesData : categoriesData?.results || []
  const uoms = Array.isArray(uomsData) ? uomsData : uomsData?.results || []
  const departmentOptions = Array.isArray(departments) ? departments : []

  const isDepartment = type?.toLowerCase().includes('department')
  const isSize = type?.toLowerCase().includes('size')
  const isBrand = type?.toLowerCase().includes('brand')
  const isCategory = type?.toLowerCase().includes('category') && !type?.toLowerCase().includes('sub')
  const isSubCategory = type?.toLowerCase().includes('sub') && type?.toLowerCase().includes('category')
  const isPack = type?.toLowerCase().includes('pack')

  const title = isDepartment ? "Department Data" : 
                isSize ? "Item Size Data" : 
                isBrand ? "Brand Data" :
                isCategory ? "Category Data" : 
                isSubCategory ? "Sub Category Data" :
                isPack ? "Pack Data" :
                "New Entry"

  const resetFormState = () => {
    setFormData({})
    setFormError('')
  }

  useEffect(() => {
    if (isOpen) {
      resetFormState()
    }
  }, [isOpen, type])

  if (!isOpen) return null

  const handleClose = () => {
    resetFormState()
    onClose?.()
  }

  const handleChange = (field, value) => {
    setFormError('')
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async (closeAfterSave = true) => {
    try {
      setFormError('')

      if (isDepartment) {
        if (!formData.name?.trim()) {
          setFormError('Department Name is required.')
          return
        }

        const payload = {
          name: formData.name.trim(),
          localized_name: (formData.localName || '').trim(),
        }

        const response = await post('/lookups/departments/', payload)
        const created = response?.data || response
        await refetchDepartments()
        onSave?.(created)
      } else if (isCategory) {
        if (!formData.name?.trim()) {
          setFormError('Category Name is required.')
          return
        }
        if (!formData.department) {
          setFormError('Department is required.')
          return
        }

        const selectedDepartment = departmentOptions.find(department => {
          if (typeof department === 'string') return department === formData.department
          return String(department?.id) === String(formData.department) || department?.name === formData.department
        })

        const departmentId = Number(
          typeof selectedDepartment === 'object'
            ? selectedDepartment?.id
            : formData.department
        ) || null

        if (!departmentId) {
          setFormError('Valid Department is required.')
          return
        }

        const payload = {
          name: formData.name.trim(),
          localized_name: (formData.localName || '').trim(),
          department: departmentId,
        }

        const response = await post('/inventory/categories/', payload)
        const created = response?.data || response
        await refetchCategories()
        onSave?.(created)
      } else if (isPack) {
        if (!formData.name?.trim()) {
          setFormError('Pack Name is required.')
          return
        }

        const payload = {
          name: formData.name.trim(),
          localized_name: (formData.localName || '').trim(),
        }

        const response = await post('/lookups/packs/', payload)
        const created = response?.data || response
        await refetchPacks()
        onSave?.(created)
      } else if (isSize) {
        if (!formData.name?.trim()) {
          setFormError('Size Name is required.')
          return
        }

        const categoryId = Number(formData.category) || null
        if (!categoryId) {
          setFormError('Category is required.')
          return
        }

        const uomId = Number(formData.uom) || null
        if (!uomId) {
          setFormError('UOM is required.')
          return
        }

        const noOfUnits = formData.no_of_units === '' || formData.no_of_units === undefined ? null : Number(formData.no_of_units)
        const unitsInCase = formData.units_in_case === '' || formData.units_in_case === undefined ? null : Number(formData.units_in_case)
        const taxFactor = formData.tax_factor === '' || formData.tax_factor === undefined ? null : Number(formData.tax_factor)
        const unitPriceFactor = formData.unit_price_factor === '' || formData.unit_price_factor === undefined ? null : Number(formData.unit_price_factor)

        if (noOfUnits !== null && Number.isNaN(noOfUnits)) {
          setFormError('No. of Units must be numeric.')
          return
        }
        if (unitsInCase !== null && Number.isNaN(unitsInCase)) {
          setFormError('Units In Case must be numeric.')
          return
        }
        if (taxFactor !== null && Number.isNaN(taxFactor)) {
          setFormError('Tax Factor must be numeric.')
          return
        }
        if (unitPriceFactor !== null && Number.isNaN(unitPriceFactor)) {
          setFormError('Unit Price Factor must be numeric.')
          return
        }

        const unitPriceUomId = Number(formData.unit_price_uom) || null

        const payload = {
          name: formData.name.trim(),
          localized_name: (formData.localName || '').trim(),
          category: categoryId,
          uom: uomId,
          ...(noOfUnits !== null ? { no_of_units: noOfUnits } : {}),
          ...(unitsInCase !== null ? { units_in_case: unitsInCase } : {}),
          ...(taxFactor !== null ? { tax_factor: taxFactor } : {}),
          ...(unitPriceFactor !== null ? { unit_price_factor: unitPriceFactor } : {}),
          ...(unitPriceUomId !== null ? { unit_price_uom: unitPriceUomId } : {}),
        }

        const response = await post('/lookups/sizes/', payload)
        const created = response?.data || response
        const createdId = Number(created?.id) || null
        const latestSize = createdId ? await get(`/lookups/sizes/${createdId}/`) : created
        const normalizedSize = latestSize?.data || latestSize || created
        await refetchSizes()
        onSave?.(normalizedSize)
      } else if (isBrand) {
        if (!formData.name?.trim()) {
          setFormError('Brand Name is required.')
          return
        }

        const payload = {
          name: formData.name.trim(),
          manufacturer: (formData.manufacturer || '').trim(),
        }

        const response = await post('/lookups/brands/', payload)
        const created = response?.data || response
        await refetchBrands()
        onSave?.(created)
      } else if (isSubCategory) {
        if (!formData.name?.trim()) {
          setFormError('Sub Category Name is required.')
          return
        }
        const categoryId = Number(formData.category) || null
        if (!categoryId) {
          setFormError('Category is required.')
          return
        }

        const payload = {
          name: formData.name.trim(),
          localized_name: (formData.localName || '').trim(),
          category: categoryId,
        }

        const response = await post('/inventory/sub-categories/', payload)
        const created = response?.data || response
        await refetchSubCategories()
        onSave?.(created)
      } else {
        onSave?.(formData)
      }

      if (closeAfterSave) {
        handleClose()
      } else {
        resetFormState()
      }
    } catch (e) {
      // handled by useApi error; keep modal open for correction
      console.error(e)
    }
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/20 backdrop-blur-[2px] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 font-poppins">{title}</h3>
          <button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={18} className="text-slate-500" />
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 space-y-4">
          {(formError || apiError) && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-600">
              {formError || apiError}
            </div>
          )}

          {isDepartment && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Department Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Localized Name"
                  value={formData.localName || ''}
                  onChange={(e) => handleChange('localName', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </>
          )}

          {isSize && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Size Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Localized Name"
                  value={formData.localName || ''}
                  onChange={(e) => handleChange('localName', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <select 
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  disabled={categoriesLoading}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 focus:text-slate-700 outline-none focus:border-sky-500 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {categoriesLoading ? 'Loading Categories...' : 'Select Category'}
                  </option>
                  {categories.map(category => (
                    <option key={category.id || category.name} value={String(category.id || '')}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <select 
                  value={formData.uom || ''}
                  onChange={(e) => handleChange('uom', e.target.value)}
                  disabled={uomsLoading}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 focus:text-slate-700 outline-none focus:border-sky-500 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {uomsLoading ? 'Loading UOM...' : 'Select UOM'}
                  </option>
                  {uoms.map(uom => (
                    <option key={uom.id || uom.name} value={String(uom.id || '')}>
                      {uom.name || uom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <input
                    type="number"
                    placeholder="No. of Units"
                    value={formData.no_of_units || ''}
                    onChange={(e) => handleChange('no_of_units', e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <input
                    type="number"
                    placeholder="Units In Case"
                    value={formData.units_in_case || ''}
                    onChange={(e) => handleChange('units_in_case', e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="number"
                  step="0.001"
                  placeholder="Tax Factor"
                  value={formData.tax_factor || ''}
                  onChange={(e) => handleChange('tax_factor', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="rounded-xl border border-slate-200 bg-white px-3 py-3">
                <p className="mb-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Unit Price</p>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.0001"
                    placeholder="Factor"
                    value={formData.unit_price_factor || ''}
                    onChange={(e) => handleChange('unit_price_factor', e.target.value)}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                  />
                  <select 
                    value={formData.unit_price_uom || ''}
                    onChange={(e) => handleChange('unit_price_uom', e.target.value)}
                    disabled={uomsLoading}
                    className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 focus:text-slate-700 outline-none focus:border-sky-500 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {uomsLoading ? 'Loading UOM...' : 'Select UOM'}
                    </option>
                    {uoms.map(uom => (
                      <option key={uom.id || uom.name} value={String(uom.id || '')}>
                        {uom.name || uom}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {isBrand && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Brand Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Manufacturer"
                  value={formData.manufacturer || ''}
                  onChange={(e) => handleChange('manufacturer', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </>
          )}

          {isCategory && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Category Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Localized Name"
                  value={formData.localName || ''}
                  onChange={(e) => handleChange('localName', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <select 
                  value={formData.department || ''}
                  onChange={(e) => handleChange('department', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 focus:text-slate-700 outline-none focus:border-sky-500 appearance-none cursor-pointer"
                >
                  <option value="">Select Department</option>
                  {departmentOptions.map((department) => {
                    const name = typeof department === 'string' ? department : department?.name
                    if (!name) return null
                    const key = typeof department === 'string' ? department : (department.id || name)
                    const value = typeof department === 'string' ? department : String(department.id || name)
                    return (
                      <option key={key} value={value}>
                        {name}
                      </option>
                    )
                  })}
                </select>
              </div>
            </>
          )}

          {isSubCategory && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Sub Category Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Localized Name"
                  value={formData.localName || ''}
                  onChange={(e) => handleChange('localName', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <select 
                  value={formData.category || ''}
                  onChange={(e) => handleChange('category', e.target.value)}
                  disabled={categoriesLoading}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-400 focus:text-slate-700 outline-none focus:border-sky-500 appearance-none cursor-pointer"
                >
                  <option value="">
                    {categoriesLoading ? 'Loading Categories...' : 'Select Category'}
                  </option>
                  {categories.map(category => (
                    <option key={category.id || category.name} value={String(category.id || '')}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {isPack && (
            <>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Pack Name *"
                  value={formData.name || ''}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <input
                  type="text"
                  placeholder="Localized Name"
                  value={formData.localName || ''}
                  onChange={(e) => handleChange('localName', e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500 focus:bg-white transition-all shadow-inner"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-100">
           <button 
             onClick={() => handleSave(true)}
             disabled={isSaving}
             className="px-6 h-11 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
           >
              {isSaving ? <Loader size={20} className="text-white" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save & Close'}
           </button>
           <button 
             onClick={() => handleSave(false)}
             disabled={isSaving}
             className="px-6 h-11 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
           >
              {isSaving ? <Loader size={20} className="text-white" /> : <Save size={16} />}
              {isSaving ? 'Saving...' : 'Save & New'}
           </button>
        </div>
      </div>
    </div>
  )
}

export default QuickAddModal

