import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Save, Building2, Phone, Mail, MapPin, Globe, Activity } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'

const AddVendorPage = () => {
  const navigate = useNavigate()

  const handleCancel = () => navigate('/pos/people')
  const handleSave = () => navigate('/pos/people')

  return (
    <div className="flex flex-col h-full space-y-8 animate-in fade-in duration-500 overflow-auto pb-12 -m-4 sm:-m-6 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">Register New Vendor</h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">Supply Chain Management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleSave} className="text-[#0EA5E9] border-[#0EA5E9] hover:bg-[#0EA5E90D]">
            Save & New
          </Button>
          <Button onClick={handleSave} className="gap-2 px-8">
            <Save size={18} />
            Complete Registration
          </Button>
        </div>
      </div>

      {/* Core Information */}
      <Card title="Core Information">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Input label="Vendor Name" placeholder="e.g. Allied Beverages" icon={Building2} required />
          <Input label="Vendor Account Code" placeholder="VND-00123" />
          
          <Input label="Registered Company Name" placeholder="Full Legal Name" required />
          
          <div className="space-y-1.5">
            <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Tax Classification</label>
            <select className="w-full h-10 px-4 rounded-lg border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E90D] transition-all">
              <option>Standard GST (18%)</option>
              <option>Exempted</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Logistics & Communication */}
      <Card title="Logistics & Communication">
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Input label="Primary Mailing Address" placeholder="Street, Area" icon={MapPin} fullWidth />
            <Input label="Warehouse Address" placeholder="Suite, Unit" icon={Building2} fullWidth />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <Input label="City" placeholder="City" />
            <Input label="State" placeholder="State" />
            <Input label="Zip" placeholder="Zip" />
            <Input label="Country" placeholder="Country" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Input label="Official Email" placeholder="vendor@example.com" icon={Mail} />
            <Input label="Primary Contact" placeholder="Phone" icon={Phone} />
            <Input label="Support Line" placeholder="Emergency" icon={Activity} />
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AddVendorPage
