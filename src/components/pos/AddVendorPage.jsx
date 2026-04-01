import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Button from '../common/Button'
import Card from '../common/Card'
import useApi from '../../hooks/useApi'
import useFetch from '../../hooks/useFetch'
import Loader from '../common/Loader'

const initialFormData = {
  vendor_name: '',
  vendor_code: '',
  company_name: '',
  default_tax_class: '',
  pdf_format: 'Standard Invoice',
  inactive: false,
  address_1: '',
  address_2: '',
  city: '',
  state: '',
  zip: '',
  code: '',
  ext: '',
  country: '',
  phone_1: '',
  phone_2: '',
  cell_phone: '',
  fax: '',
  email: '',
  pay_term: 'Net 30',
  gst_number: '',
  note: ''
}

const inputClassName = 'w-full h-10 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-3 text-[13px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#0EA5E9]'
const labelClassName = 'text-[12px] font-semibold text-[#64748B]'

const AddVendorPage = ({ onCancel, onSave }) => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  
  const { post, put, loading: saving, error: saveError } = useApi()
  const { data: taxData, loading: taxLoading, error: taxError } = useFetch('/people/vendor-taxes/')
  const { data: existingData, loading: fetching, error: fetchError } = useFetch(isEdit ? `/people/vendors/${id}/` : null)
  
  const [formData, setFormData] = useState(initialFormData)

  useEffect(() => {
    if (existingData) {
      setFormData({
        ...initialFormData,
        ...existingData,
        ...(existingData.address_details || {}),
        // Match API field names to form state if they differ
        vendor_name: existingData.name || existingData.vendor_name || '',
        company_name: existingData.company || existingData.company_name || '',
      })
    }
  }, [existingData])

  const handleCancel = () => {
    if (onCancel) onCancel()
    else navigate('/pos/people?tab=vendors')
  }

  const buildPayload = () => ({
    ...formData
  })

  const handleSaveBtn = async () => {
    try {
      if (isEdit) {
        await put(`/people/vendors/${id}/`, buildPayload())
      } else {
        await post('/people/vendors/', buildPayload())
      }
      
      if (onSave) onSave()
      else navigate('/pos/people?tab=vendors')
    } catch (err) {
      console.error(err)
    }
  }

  const handleSaveAndNewBtn = async () => {
    try {
      await post('/people/vendors/', buildPayload())
      setFormData(initialFormData)
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  if (fetching) return (
    <div className="h-full flex items-center justify-center">
      <Loader size={64} />
    </div>
  )

  return (
    <div className="flex flex-col min-h-full space-y-4 pb-8 pr-2">
       <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">
            {isEdit ? 'Update Vendor' : 'Add New Vendor'}
          </h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">Supply Chain Management</p>
        </div>
      </div>

      {(saveError || taxError || fetchError) && (
        <div className="p-3 bg-rose-50 text-rose-600 rounded-md border border-rose-100 text-[13px] font-semibold">
          {saveError || taxError || fetchError}
        </div>
      )}

      <Card title="Vendor Core Information" className="shadow-none">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className={labelClassName}>Vendor Name *</label>
            <input
              className={inputClassName}
              name="vendor_name"
              value={formData.vendor_name}
              onChange={handleChange}
              placeholder="Enter Vendor Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>Vendor Code</label>
            <input
              className={inputClassName}
              name="vendor_code"
              value={formData.vendor_code}
              onChange={handleChange}
              placeholder="Enter Vendor Code"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>Company Name *</label>
            <input
              className={inputClassName}
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              placeholder="Enter Company Name"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>Default Tax Class</label>
            <select
              className={inputClassName}
              name="default_tax_class"
              value={formData.default_tax_class}
              onChange={handleChange}
              disabled={taxLoading}
            >
              <option value="">{taxLoading ? 'Loading Taxes...' : '-- Select TaxClass --'}</option>
              {Array.isArray(taxData) && taxData.map((tax, idx) => (
                <option key={tax.id || idx} value={tax.id}>
                  {tax.name}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-[12px] text-[#64748B] font-semibold">
            <input
              type="checkbox"
              name="inactive"
              checked={formData.inactive}
              onChange={handleChange}
              className="h-4 w-4 rounded border border-[#CBD5E1]"
            />
            Vendor is inactive
          </label>

          <div className="space-y-1.5">
            <label className={labelClassName}>PDF Format</label>
            <select
              className={inputClassName}
              name="pdf_format"
              value={formData.pdf_format}
              onChange={handleChange}
            >
              <option value="Standard Invoice">Standard Invoice</option>
              <option value="Compact Invoice">Compact Invoice</option>
            </select>
          </div>
        </div>
      </Card>

      <Card title="Contact & Address Information" className="shadow-none">
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClassName}>Address 1</label>
            <input
              className={inputClassName}
              name="address_1"
              value={formData.address_1}
              onChange={handleChange}
              placeholder="Street Address"
            />
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>Address 2</label>
            <input
              className={inputClassName}
              name="address_2"
              value={formData.address_2}
              onChange={handleChange}
              placeholder="Apartment, suite, etc. (optional)"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelClassName}>City</label>
              <input className={inputClassName} name="city" value={formData.city} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>State</label>
              <input className={inputClassName} name="state" value={formData.state} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>Zip</label>
              <input className={inputClassName} name="zip" value={formData.zip} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className={labelClassName}>Code</label>
              <input className={inputClassName} name="code" value={formData.code} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>Ext</label>
              <input className={inputClassName} name="ext" value={formData.ext} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>Country</label>
              <input className={inputClassName} name="country" value={formData.country} onChange={handleChange} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClassName}>Phone 1</label>
              <input
                className={inputClassName}
                name="phone_1"
                value={formData.phone_1}
                onChange={handleChange}
                placeholder="(000) 000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>Phone 2</label>
              <input
                className={inputClassName}
                name="phone_2"
                value={formData.phone_2}
                onChange={handleChange}
                placeholder="(000) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClassName}>Cell Phone</label>
              <input
                className={inputClassName}
                name="cell_phone"
                value={formData.cell_phone}
                onChange={handleChange}
                placeholder="(000) 000-0000"
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>Fax</label>
              <input
                className={inputClassName}
                name="fax"
                value={formData.fax}
                onChange={handleChange}
                placeholder="(000) 000-0000"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>E-Mail</label>
            <input
              className={inputClassName}
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="vendor@example.com"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className={labelClassName}>Pay Term</label>
              <select className={inputClassName} name="pay_term" value={formData.pay_term} onChange={handleChange}>
                <option value="Net 30">Net 30</option>
                <option value="Net 15">Net 15</option>
                <option value="Due on Receipt">Due on Receipt</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className={labelClassName}>GST Number</label>
              <input className={inputClassName} name="gst_number" value={formData.gst_number} onChange={handleChange} />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className={labelClassName}>Note</label>
            <textarea
              className="w-full min-h-24 rounded-md border border-[#E5E7EB] bg-[#F8FAFC] px-3 py-2 text-[13px] text-[#0F172A] outline-none placeholder:text-[#94A3B8] focus:border-[#0EA5E9]"
              name="note"
              value={formData.note}
              onChange={handleChange}
            />
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap justify-end gap-2">
        <Button variant="outline" onClick={handleCancel} disabled={saving} className="h-9 px-5 text-[12px] font-semibold">
          Close
        </Button>
        {!isEdit && (
          <Button
            variant="outline"
            onClick={handleSaveAndNewBtn}
            disabled={saving}
            className="h-9 px-5 text-[12px] font-semibold text-[#0EA5E9] border-[#0EA5E9] hover:bg-[#0EA5E90D]"
          >
            Save & New
          </Button>
        )}
        <Button onClick={handleSaveBtn} disabled={saving || taxLoading} className="h-9 px-6 text-[12px] font-semibold">
          {saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}
        </Button>
      </div>
    </div>
  )
}

export default AddVendorPage
