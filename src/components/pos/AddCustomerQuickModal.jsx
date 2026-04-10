import React, { useState } from 'react'
import { Calendar, Mail, Phone, User, UserPlus, X } from 'lucide-react'
import useApi from '../../hooks/useApi'
import DatePickerField from '../common/DatePickerField'

const getCreatedCustomer = (response) => response?.data ?? response

const AddCustomerQuickModal = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
  })
  const { post, loading, error } = useApi()

  if (!isOpen) return null

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((current) => ({
      ...current,
      [name]: value,
    }))
  }

  const handleClose = () => {
    if (loading) return
    setFormData({
      name: '',
      phone: '',
      email: '',
      dob: '',
    })
    onClose?.()
  }

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      return
    }

    try {
      const response = await post('/people/customers/', {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        dob: formData.dob || null,
      })

      const createdCustomer = getCreatedCustomer(response)

      setFormData({
        name: '',
        phone: '',
        email: '',
        dob: '',
      })

      onSuccess?.(createdCustomer)
    } catch (submitError) {
      console.error(submitError)
    }
  }

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
      <div className="w-full max-w-[530px] overflow-hidden rounded-[22px] border border-[#DCE4EF] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.24)]">
        <div className="flex items-center justify-between border-b border-[#E7EDF5] px-6 py-5">
          <h2 className="text-[16px] font-black tracking-tight text-[#0F172A] font-poppins">Add New Customer</h2>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            aria-label="Close add customer modal"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-6 px-6 py-7">
          <div className="space-y-2.5">
            <label className="text-[14px] font-bold text-[#0F172A]">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#DCE4EF] bg-[#F8FAFC] px-4">
              <User size={18} className="text-[#64748B]" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. John Doe"
                className="w-full bg-transparent text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[14px] font-bold text-[#0F172A]">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#DCE4EF] bg-[#F8FAFC] px-4">
              <Phone size={18} className="text-[#64748B]" />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="(555) 123-4567"
                className="w-full bg-transparent text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[14px] font-bold text-[#0F172A]">Email Address</label>
            <div className="flex h-12 items-center gap-3 rounded-2xl border border-[#DCE4EF] bg-[#F8FAFC] px-4">
              <Mail size={18} className="text-[#64748B]" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@example.com"
                className="w-full bg-transparent text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              />
            </div>
          </div>

          <DatePickerField
            label="DOB"
            value={formData.dob}
            onChange={(value) =>
              setFormData((current) => ({
                ...current,
                dob: value || '',
              }))
            }
            placeholder="Select date of birth"
            maxDate={new Date()}
            showIcon
            icon={Calendar}
            labelClassName="font-bold text-[#0F172A] ml-0"
            className="!h-12 !rounded-2xl !border-[#DCE4EF] !bg-[#F8FAFC] !text-[14px] !font-normal !text-[#0F172A] placeholder:!text-[#94A3B8]"
          />

          {error ? (
            <div className="rounded-2xl border border-rose-100 bg-rose-50 px-4 py-3 text-[13px] font-medium text-rose-600">
              {error}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-end gap-4 border-t border-[#E7EDF5] bg-[#FBFCFE] px-6 py-7">
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="inline-flex h-14 items-center justify-center rounded-2xl border border-[#DCE4EF] bg-white px-8 text-[16px] font-black text-[#0F172A] transition hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !formData.name.trim() || !formData.phone.trim()}
            className="inline-flex h-14 items-center justify-center gap-2 rounded-2xl bg-[#1EA7EE] px-8 text-[16px] font-black text-white transition hover:bg-[#0EA5E9] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <UserPlus size={18} />
            {loading ? 'Adding...' : 'Add Customer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AddCustomerQuickModal
