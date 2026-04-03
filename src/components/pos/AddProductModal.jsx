import React, { useEffect, useMemo, useState, useRef } from 'react'
import { X, Plus, Image as ImageIcon, Trash2, Search, Save } from 'lucide-react'
import Loader from '../common/Loader'
import SelectionModal from '../common/SelectionModal'
import useApi from '../../hooks/useApi'
import useFetch from '../../hooks/useFetch'
import useCategories from '../../hooks/useCategories'
import usePacks from '../../hooks/usePacks'
import useBrands from '../../hooks/useBrands'
import useSubCategories from '../../hooks/useSubCategories'
import useSizes from '../../hooks/useSizes'

const InputField = ({ label, value, onChange, placeholder, type = "text", prefix, suffix, className = "", disabled = false }) => (
  <div className={`flex flex-col gap-1.5 group ${className} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}>
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-sky-500 transition-colors">
      {label}
    </label>
    <div className="relative">
      {prefix && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{prefix}</span>
      )}
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''} ${disabled ? 'cursor-not-allowed' : ''}`}
      />
      {suffix && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">{suffix}</span>
      )}
    </div>
  </div>
)

const SelectField = ({ label, value, options = [], onChange, onOpenSelector, className = "", disabled = false }) => (
  <div className={`flex flex-col gap-1.5 group ${className}`}>
    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-sky-500 transition-colors">
      {label}
    </label>
    <div className="flex gap-2">
      <div className="relative flex-1">
        <select
          value={value || ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 appearance-none disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{disabled ? 'Select Category First' : 'Select'}</option>
          {(Array.isArray(options) ? options : []).map((option, index) => {
            const label = getLookupName(option)
            if (!label) return null
            return (
              <option key={`opt-${label}-${index}`} value={label}>
                {label}
              </option>
            )
          })}
        </select>
        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
        </div>
      </div>
      <button 
        onClick={onOpenSelector}
        disabled={disabled}
        className="h-11 w-11 shrink-0 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 hover:text-sky-500 hover:border-sky-500 transition-all font-black text-xl shadow-sm pb-1 disabled:cursor-not-allowed disabled:opacity-60"
      >
        ...
      </button>
    </div>
  </div>
)

const getId = (value) => {
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

const getLookupName = (item) => {
  if (typeof item === 'string') return item
  return item?.name || item?.title || item?.localized_name || ''
}

const findLookupByName = (items, selectedName) => {
  if (!selectedName || !Array.isArray(items)) return null
  return items.find(item => getLookupName(item) === selectedName) || null
}

const getLookupIdByName = (items, selectedName) => {
  const selected = findLookupByName(items, selectedName)
  if (!selected || typeof selected === 'string') return null
  return getId(selected)
}

const INITIAL_FORM_DATA = {
  sku: '',
  name: '',
  description: '',
  department: '',
  size: '',
  brand: '',
  category: '',
  subCategory: '',
  pack: '',
  nonTaxable: false,
  tax: '',
  isInactive: false,
  buyAsCase: false,
  unitsInCase: 0,
  caseCost: 0,
  casePrice: 0,
  unitCost: 0,
  margin: 0,
  buyDown: 0,
  markup: 0,
  unitPrice: 0,
  msrp: 0,
  minPrice: 0,
  upcs: '',
  minWarnQty: 0,
  image: null
}

const AddProductModal = ({ isOpen, onClose, onSaved, departments = [], product = null }) => {
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState(INITIAL_FORM_DATA)

  const [selector, setSelector] = useState({
    isOpen: false,
    title: '',
    data: [],
    field: ''
  })

  const { categories: categoriesData } = useCategories()
  const { packs: packsData } = usePacks()
  const { brands: brandsData } = useBrands()
  const { subCategories: subCategoriesData } = useSubCategories()
  const { sizes: sizesData } = useSizes()
  const { data: taxRatesData, loading: taxRatesLoading } = useFetch('/lookups/tax-rates/')
  const DEPARTMENTS = departments.length > 0 ? departments : []
  const SIZES = sizesData || []
  const BRANDS = brandsData || []
  const ALL_CATEGORIES = categoriesData || []
  const ALL_SUB_CATEGORIES = subCategoriesData || []
  const PACKS = packsData || []
  const TAX_RATES = Array.isArray(taxRatesData) ? taxRatesData : taxRatesData?.results || []

  const selectedDepartmentId = useMemo(
    () => getLookupIdByName(DEPARTMENTS, formData.department),
    [DEPARTMENTS, formData.department]
  )

  const CATEGORIES = useMemo(() => {
    if (!selectedDepartmentId) return ALL_CATEGORIES
    return (Array.isArray(ALL_CATEGORIES) ? ALL_CATEGORIES : []).filter(category => {
      const departmentId = getId(category?.department)
      return departmentId === selectedDepartmentId
    })
  }, [ALL_CATEGORIES, selectedDepartmentId])

  const selectedCategoryId = useMemo(() => {
    const selectedFromFiltered = getLookupIdByName(CATEGORIES, formData.category)
    if (selectedFromFiltered) return selectedFromFiltered
    return getLookupIdByName(ALL_CATEGORIES, formData.category)
  }, [CATEGORIES, ALL_CATEGORIES, formData.category])

  const SUB_CATEGORIES = useMemo(() => {
    if (!selectedCategoryId) return ALL_SUB_CATEGORIES
    return (Array.isArray(ALL_SUB_CATEGORIES) ? ALL_SUB_CATEGORIES : []).filter(subCategory => {
      const categoryId = getId(subCategory?.category)
      return categoryId === selectedCategoryId
    })
  }, [ALL_SUB_CATEGORIES, selectedCategoryId])

  const { post, patch, loading, error: apiError } = useApi()

  const resetModalState = () => {
    setFormData(INITIAL_FORM_DATA)
    setSelector({ isOpen: false, title: '', data: [], field: '' })
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  useEffect(() => {
    if (!formData.tax && TAX_RATES.length > 0) {
      setFormData(prev => ({ ...prev, tax: String(TAX_RATES[0]?.id ?? '') }))
    }
  }, [TAX_RATES, formData.tax])

  const getTaxOptionLabel = (taxRate) => {
    if (!taxRate) return 'Unknown'
    return taxRate.name || taxRate.title || taxRate.label || `Tax ${taxRate.id}`
  }

  const handleChange = (field, value) => {
    setFormData(prev => {
      if (field === 'department') {
        return { ...prev, department: value, category: '', subCategory: '' }
      }
      if (field === 'category') {
        const selectedCategory = findLookupByName(ALL_CATEGORIES, value)
        const departmentIdFromCategory = getId(selectedCategory?.department)
        const linkedDepartment = (Array.isArray(DEPARTMENTS) ? DEPARTMENTS : []).find(
          department => getId(department) === departmentIdFromCategory
        )
        const linkedDepartmentName = getLookupName(linkedDepartment)

        return {
          ...prev,
          category: value,
          subCategory: '',
          department: linkedDepartmentName || prev.department,
        }
      }
      if (field === 'buyAsCase' && value === false) {
        return { 
          ...prev, 
          buyAsCase: false,
          unitsInCase: 0,
          caseCost: 0,
          casePrice: 0
        }
      }
      return { ...prev, [field]: value }
    })
  }

  const openSelector = (title, data, field) => {
    setSelector({ isOpen: true, title, data, field })
  }

  const handleSelect = (value) => {
    const selectedValue = typeof value === 'object' ? value.name : value
    handleChange(selector.field, selectedValue)
    setSelector({ ...selector, isOpen: false })
  }

  const handleImageClick = () => {
    fileInputRef.current.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.')
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image: null }))
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const toSafeStringNumber = (value, fallback = '0') => {
    if (value === null || value === undefined || value === '') return fallback
    return `${value}`
  }

  useEffect(() => {
    if (!formData.category) return
    const hasCategory = Boolean(findLookupByName(CATEGORIES, formData.category))
    if (!hasCategory) {
      setFormData(prev => ({ ...prev, category: '', subCategory: '' }))
    }
  }, [CATEGORIES, formData.category])

  useEffect(() => {
    if (!formData.subCategory) return
    const hasSubCategory = Boolean(findLookupByName(SUB_CATEGORIES, formData.subCategory))
    if (!hasSubCategory) {
      setFormData(prev => ({ ...prev, subCategory: '' }))
    }
  }, [SUB_CATEGORIES, formData.subCategory])

  useEffect(() => {
    if (product && isOpen) {
      setFormData({
        sku: product.sku || '',
        name: product.name || '',
        description: product.description || '',
        department: product.department_name || (typeof product.department === 'string' ? product.department : ''),
        size: product.size_name || (typeof product.size === 'string' ? product.size : ''),
        brand: product.brand_name || (typeof product.brand === 'string' ? product.brand : ''),
        category: product.category_name || (typeof product.category === 'string' ? product.category : ''),
        subCategory: product.sub_category_name || (typeof product.sub_category === 'string' ? product.sub_category : ''),
        pack: product.pack_name || (typeof product.pack === 'string' ? product.pack : ''),
        nonTaxable: Boolean(product.non_taxable),
        tax: String(product.tax_rate || ''),
        isInactive: product.item_is_inactive === true || product.is_active === false,
        buyAsCase: Boolean(product.buy_as_case),
        unitsInCase: product.units_in_case || 0,
        caseCost: product.case_cost || 0,
        casePrice: product.case_price || 0,
        unitCost: product.cost_pricing?.unit_cost || 0,
        margin: product.cost_pricing?.margin || 0,
        buyDown: product.cost_pricing?.buydown || 0,
        markup: product.cost_pricing?.markup || 0,
        unitPrice: product.cost_pricing?.unit_price || 0,
        msrp: product.cost_pricing?.msrp || 0,
        minPrice: product.cost_pricing?.min_price || 0,
        upcs: product.stock_information?.enter_upcs || '',
        minWarnQty: product.stock_information?.min_warn_qty || 0,
        image: product.image || product.image_base64 || null
      })
    } else if (!isOpen) {
      resetModalState()
    }
  }, [product, isOpen])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!formData.image) {
      alert('Product image is mandatory.')
      return
    }

    const payload = {
      sku: `${formData.sku || ''}`.trim(),
      name: `${formData.name || ''}`.trim(),
      description: `${formData.description || ''}`.trim(),
      department: getLookupIdByName(DEPARTMENTS, formData.department),
      size: getLookupIdByName(SIZES, formData.size),
      brand: getLookupIdByName(BRANDS, formData.brand),
      category: getLookupIdByName(CATEGORIES, formData.category),
      sub_category: getLookupIdByName(SUB_CATEGORIES, formData.subCategory),
      pack: getLookupIdByName(PACKS, formData.pack),
      non_taxable: Boolean(formData.nonTaxable),
      tax_rate: Number(formData.tax) || null,
      item_is_inactive: Boolean(formData.isInactive),
      buy_as_case: Boolean(formData.buyAsCase),
      units_in_case: toSafeStringNumber(formData.unitsInCase),
      case_cost: toSafeStringNumber(formData.caseCost),
      case_price: toSafeStringNumber(formData.casePrice),
      cost_pricing: {
        unit_cost: toSafeStringNumber(formData.unitCost),
        margin: toSafeStringNumber(formData.margin),
        buydown: toSafeStringNumber(formData.buyDown),
        markup: toSafeStringNumber(formData.markup),
        unit_price: toSafeStringNumber(formData.unitPrice),
        msrp: toSafeStringNumber(formData.msrp),
        min_price: toSafeStringNumber(formData.minPrice)
      },
      stock_information: {
        enter_upcs: `${formData.upcs || ''}`.trim(),
        min_warn_qty: toSafeStringNumber(formData.minWarnQty)
      },
      image: formData.image
    }

    if (product?.id) {
      await patch(`/inventory/products/${product.id}/`, payload)
    } else {
      await post('/inventory/products/', payload)
    }
    if (onSaved) {
      await onSaved()
    }
    resetModalState()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-auto">
      <div className="w-full max-w-6xl bg-[#f0f4f8] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="hidden items-center justify-between p-6 bg-white border-b border-slate-200">
          <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        {apiError && (
          <div className="m-4 p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold">
            {apiError}
          </div>
        )}

        {/* Scrollable Content Container */}
        <div className="p-8 space-y-8 max-h-[85vh] overflow-y-auto scrollbar-hide">
          
          {/* Section 1: Basic Information */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <InputField 
                label="SKU" 
                value={formData.sku} 
                onChange={(e) => handleChange('sku', e.target.value)} 
                placeholder="Enter SKU"
              />
              <InputField 
                label="Name" 
                value={formData.name} 
                onChange={(e) => handleChange('name', e.target.value)} 
                placeholder="Product Name"
              />
            </div>
            <div className="flex flex-col gap-1.5 group mb-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1 group-focus-within:text-sky-500 transition-colors">Description</label>
              <textarea 
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Description"
                className="w-full h-24 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <SelectField
                label="Department"
                value={formData.department}
                options={DEPARTMENTS}
                onChange={(value) => handleChange('department', value)}
                onOpenSelector={() => openSelector('Select Department', DEPARTMENTS, 'department')}
              />
              <SelectField
                label="Size"
                value={formData.size}
                options={SIZES}
                onChange={(value) => handleChange('size', value)}
                onOpenSelector={() => openSelector('Select Size', SIZES, 'size')}
              />
              <SelectField
                label="Brand"
                value={formData.brand}
                options={BRANDS}
                onChange={(value) => handleChange('brand', value)}
                onOpenSelector={() => openSelector('Select Brand', BRANDS, 'brand')}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <SelectField
                label="Category"
                value={formData.category}
                options={CATEGORIES}
                onChange={(value) => handleChange('category', value)}
                onOpenSelector={() => openSelector('Select Category', CATEGORIES, 'category')}
              />
              <SelectField
                label="Sub-Category"
                value={formData.subCategory}
                options={SUB_CATEGORIES}
                onChange={(value) => handleChange('subCategory', value)}
                disabled={!formData.category}
                onOpenSelector={() => openSelector('Select Sub-Category', SUB_CATEGORIES, 'subCategory')}
              />
              <SelectField
                label="Pack"
                value={formData.pack}
                options={PACKS}
                onChange={(value) => handleChange('pack', value)}
                onOpenSelector={() => openSelector('Select Pack', PACKS, 'pack')}
              />
            </div>

            <div className="flex flex-wrap items-center gap-8 pt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  checked={formData.nonTaxable} 
                  onChange={() => handleChange('nonTaxable', !formData.nonTaxable)}
                  className="w-5 h-5 rounded-full border-2 border-slate-300 text-sky-500 focus:ring-primary appearance-none checked:border-sky-500 checked:bg-sky-500 transition-all cursor-pointer" 
                />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 transition-colors">Non Taxable</span>
              </label>

              <div className="flex flex-col gap-1.5 min-w-[200px]">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tax</label>
                <select 
                  value={formData.tax}
                  onChange={(e) => handleChange('tax', e.target.value)}
                  disabled={taxRatesLoading}
                  className="w-full h-10 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-bold text-slate-700 outline-none focus:border-sky-500"
                >
                  {TAX_RATES.length === 0 ? (
                    <option value="">{taxRatesLoading ? 'Loading tax rates...' : 'No tax rates found'}</option>
                  ) : (
                    TAX_RATES.map((taxRate) => (
                      <option key={taxRate.id} value={String(taxRate.id)}>
                        {getTaxOptionLabel(taxRate)}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="checkbox" 
                  checked={formData.isInactive} 
                  onChange={(e) => handleChange('isInactive', e.target.checked)}
                  className="w-5 h-5 rounded-lg border-2 border-slate-300 text-sky-500 focus:ring-primary appearance-none checked:border-sky-500 checked:bg-sky-500 transition-all cursor-pointer" 
                />
                <span className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-slate-900 transition-colors">Item is Inactive</span>
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (4/12) */}
            <div className="lg:col-span-4 space-y-8">
              {/* Section 2: Buy As Case */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <input 
                    type="checkbox" 
                    id="buyAsCase"
                    checked={formData.buyAsCase} 
                    onChange={(e) => handleChange('buyAsCase', e.target.checked)}
                    className="w-5 h-5 rounded-lg border-2 border-slate-300 text-sky-500 focus:ring-primary appearance-none checked:border-sky-500 checked:bg-sky-500 transition-all cursor-pointer" 
                  />
                  <label htmlFor="buyAsCase" className="text-sm font-black uppercase tracking-widest text-slate-800 cursor-pointer">Buy As Case</label>
                </div>
                <div className="space-y-4">
                  <InputField 
                    label="Units In Case" 
                    value={formData.unitsInCase} 
                    onChange={(e) => handleChange('unitsInCase', e.target.value)} 
                    disabled={!formData.buyAsCase}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <InputField 
                      label="Case Cost" 
                      prefix="$" 
                      value={formData.caseCost} 
                      onChange={(e) => handleChange('caseCost', e.target.value)} 
                      disabled={!formData.buyAsCase}
                    />
                    <InputField 
                      label="Case Price" 
                      prefix="$" 
                      value={formData.casePrice} 
                      onChange={(e) => handleChange('casePrice', e.target.value)} 
                      disabled={!formData.buyAsCase}
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Image */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-800 font-poppins">
                    Image <span className="text-red-500">*</span>
                  </h3>
                  {formData.image && (
                    <span className="text-[10px] font-bold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full uppercase">Selected</span>
                  )}
                </div>
                
                <input 
                  type="file" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div className="space-y-4">
                  {formData.image ? (
                    <div className="relative group aspect-video w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-50 mb-4">
                      <img 
                        src={formData.image} 
                        alt="Product Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={handleImageClick}
                          className="p-2 bg-white rounded-full text-slate-800 hover:text-sky-500 transition-colors"
                        >
                          <ImageIcon size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={handleImageClick}
                      className="w-full aspect-video rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-sky-500 hover:bg-sky-50/50 transition-all group"
                    >
                      <div className="p-3 rounded-full bg-white shadow-sm text-slate-400 group-hover:text-sky-500 transition-colors">
                        <ImageIcon size={24} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-sky-500 transition-colors">Click to upload image</span>
                    </div>
                  )}

                   <button 
                    onClick={handleImageClick}
                    className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-sky-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95"
                   >
                      <Plus size={18} />
                      {formData.image ? 'Change Image' : 'Add Image'}
                   </button>
                   {formData.image && (
                     <button 
                      onClick={handleRemoveImage}
                      className="w-full flex items-center justify-center gap-3 h-12 rounded-xl bg-red-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:bg-red-600 transition-all active:scale-95 text-center"
                     >
                        <Trash2 size={18} />
                        Remove Image
                     </button>
                   )}
                </div>
              </div>
            </div>

            {/* Right Column (8/12): Price & Stock */}
            <div className="lg:col-span-8 bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-1 px-6 border-b border-slate-100">
                <div className="flex gap-8">
                  <button className="px-1 py-4 text-sky-500 border-b-2 border-sky-500 text-xs font-black uppercase tracking-widest">Price & Stock</button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Cost & Pricing Sub-section */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">Cost & Pricing</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <InputField label="Unit Cost" prefix="$" value={formData.unitCost} onChange={(e) => handleChange('unitCost', e.target.value)} />
                    <InputField label="Margin" suffix="%" value={formData.margin} onChange={(e) => handleChange('margin', e.target.value)} />
                    <InputField label="BuyDown" prefix="$" value={formData.buyDown} onChange={(e) => handleChange('buyDown', e.target.value)} />
                    <InputField label="Markup" suffix="%" value={formData.markup} onChange={(e) => handleChange('markup', e.target.value)} />
                    <div className="md:col-span-2">
                      <InputField label="Unit Price" prefix="$" value={formData.unitPrice} onChange={(e) => handleChange('unitPrice', e.target.value)} />
                    </div>
                    <InputField label="MSRP" prefix="$" value={formData.msrp} onChange={(e) => handleChange('msrp', e.target.value)} />
                    <InputField label="Min. Price" prefix="$" value={formData.minPrice} onChange={(e) => handleChange('minPrice', e.target.value)} />
                  </div>
                </div>

                {/* Stock Information Sub-section */}
                <div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-800 mb-6">Stock Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                    <div className="md:col-span-8 space-y-4">
                      <div className="flex flex-col gap-1.5 group">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Enter UPCs</label>
                         <textarea 
                           value={formData.upcs}
                           onChange={(e) => handleChange('upcs', e.target.value)}
                           placeholder="Enter UPCs"
                           className="w-full h-32 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 focus:bg-white resize-none"
                         />
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                         <button className="h-10 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 hover:border-sky-500 hover:text-sky-500 transition-all">Add UPC</button>
                         <button className="h-10 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 hover:border-sky-500 hover:text-sky-500 transition-all">Auto UPC</button>
                         <button className="h-10 rounded-xl border border-slate-200 bg-white text-[11px] font-black uppercase tracking-widest text-slate-600 hover:border-red-500 hover:text-red-500 transition-all">Remove</button>
                      </div>
                    </div>
                    <div className="md:col-span-4">
                      <InputField label="Min. Warn Qty" value={formData.minWarnQty} onChange={(e) => handleChange('minWarnQty', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 p-6 px-8 border-t border-slate-200 flex justify-end gap-4">
          <button 
            onClick={() => {
              resetModalState()
              onClose()
            }}
            disabled={loading}
            className="px-8 h-12 rounded-xl bg-slate-800 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-50"
          >
            Close
          </button>
          <button 
            onClick={async () => {
              try {
                await handleSave()
              } catch (e) {
                console.error(e)
              }
            }}
            disabled={loading}
            className="px-10 h-12 rounded-xl flex items-center gap-2 bg-sky-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95 disabled:opacity-50"
          >
            {loading ? <Loader size={20} className="text-white" /> : <Save size={16} />}
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>

        {selector.isOpen && (
          <SelectionModal
            isOpen={selector.isOpen}
            title={selector.title}
            data={selector.data}
            departments={DEPARTMENTS}
            onSelect={handleSelect}
            onClose={() => setSelector({ ...selector, isOpen: false })}
          />
        )}
      </div>
    </div>
  )
}

export default AddProductModal

