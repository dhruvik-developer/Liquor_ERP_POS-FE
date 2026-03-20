import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, User, Globe, Mail, MapPin, Phone } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'
import DatePickerField from '../common/DatePickerField'

const AddCustomerPage = () => {
  const [dob, setDob] = useState(null)
  const navigate = useNavigate()

  const handleCancel = () => navigate('/pos/people')
  const handleSave = () => navigate('/pos/people')

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-auto pb-12 -m-4 sm:-m-6 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">Add New Customer</h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">Loyalty & CRM Management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2 px-8">
            <Save size={18} />
            Save Profile
          </Button>
        </div>
      </div>

      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#0EA5E91A]"></div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
          <Input label="Full Name" placeholder="Enter name" icon={User} required />
          <Input label="Country" placeholder="e.g. United States" icon={Globe} />
          
          <Input label="Email Address" placeholder="customer@domain.com" icon={Mail} required />
          <Input label="City" placeholder="e.g. New York" icon={MapPin} />
          
          <DatePickerField 
            label="Date of Birth"
            value={dob}
            onChange={setDob}
            required 
          />
          <Input label="Mobile Number" placeholder="+1 (000) 000-0000" icon={Phone} />

          <div className="col-span-1 md:col-span-2 space-y-1.5">
            <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Permanent Address</label>
            <div className="relative">
              <textarea 
                placeholder="Enter complete shipping/billing address..."
                rows={4}
                className="w-full p-4 pl-12 rounded-lg border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E90D] transition-all resize-none"
              />
              <MapPin className="absolute left-4 top-4 text-[#94A3B8]" size={20} />
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AddCustomerPage
