import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, User, Globe, Mail, MapPin, Phone } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'
import useApi from '../../hooks/useApi'
import useFetch from '../../hooks/useFetch'
import Loader from '../common/Loader'

const AddCustomerPage = ({ onCancel, onSave }) => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  
  const [dob, setDob] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    email: '',
    city: '',
    mobile_number: '',
    address: ''
  })
  
  const { post, put, loading: saving, error: saveError } = useApi()
  const { data: existingData, loading: fetching, error: fetchError } = useFetch(isEdit ? `/people/customers/${id}/` : null)

  useEffect(() => {
    if (existingData) {
      setFormData({
        name: existingData.name || existingData.full_name || '',
        country: existingData.country || '',
        email: existingData.email || '',
        city: existingData.city || '',
        mobile_number: existingData.phone || existingData.mobile_number || '',
        address: existingData.address || ''
      })
      if (existingData.dob || existingData.date_of_birth) {
        setDob(existingData.dob || existingData.date_of_birth)
      }
    }
  }, [existingData])

  const handleCancel = () => {
    if (onCancel) onCancel()
    else navigate('/pos/people?tab=customers')
  }

  const handleSaveBtn = async () => {
    try {
      const payload = {
        name: formData.name,
        email: formData.email || null,
        phone: formData.mobile_number,
      }

      if (formData.country) payload.country = formData.country
      if (formData.city) payload.city = formData.city
      if (formData.address) payload.address = formData.address
      if (dob) payload.dob = dob.split('T')[0]

      if (isEdit) {
        await put(`/people/customers/${id}/`, payload)
      } else {
        await post('/people/customers/', payload)
      }
      
      if (onSave) onSave()
      else navigate('/pos/people?tab=customers')
    } catch (err) {
      console.error(err)
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  if (fetching) return (
    <div className="h-full flex items-center justify-center">
      <Loader size={64} />
    </div>
  )

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-auto pb-12 -m-4 sm:-m-6 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">
            {isEdit ? 'Update Customer' : 'Add New Customer'}
          </h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">Loyalty & CRM Management</p>
        </div>
      </div>
      
      {(saveError || fetchError) && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold">
          {saveError || fetchError}
        </div>
      )}

      <Card className="relative overflow-hidden">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6 pt-4">
          <Input label="Name *" name="name" value={formData.name} onChange={handleChange} placeholder="Enter Name" required />
          <Input label="Country" name="country" value={formData.country} onChange={handleChange} placeholder="Enter Country" />
          
          <Input label="Email *" name="email" value={formData.email} onChange={handleChange} placeholder="Enter Email" required />
          <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Enter City" />
          
          <DatePickerField 
            label="DOB *"
            value={dob}
            onChange={setDob}
            placeholder="Enter DOB"
            required 
          />
          <Input label="Phone Number" name="mobile_number" value={formData.mobile_number} onChange={handleChange} placeholder="Enter Phone Number" />

          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Address *</label>
            <div className="relative">
              <textarea 
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Enter Address"
                rows={4}
                className="w-full p-4 rounded-lg border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E90D] transition-all resize-none"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-10">
          <Button variant="outline" onClick={handleCancel} disabled={saving} className="w-32">
            Cancel
          </Button>
          <Button onClick={handleSaveBtn} disabled={saving} className="w-32">
            {saving ? 'Saving...' : isEdit ? 'Update' : 'Save'}
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default AddCustomerPage
