import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  User, 
  Eye, 
  EyeOff, 
  Camera,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Save
} from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'

const AddUserPage = () => {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const handleCancel = () => navigate('/pos/people')
  const handleSave = () => navigate('/pos/people')

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-auto pb-12 -m-4 sm:-m-6 p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">Register New User</h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">System Access Management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-2 px-8">
            <Save size={18} />
            Save User
          </Button>
        </div>
      </div>

      {/* Main Form Content */}
      <Card className="relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[#0EA5E91A]"></div>
        
        <div className="flex flex-col lg:flex-row gap-12 pt-4">
          
          {/* Left Side: Photo */}
          <div className="w-full lg:w-48 flex flex-col items-center gap-6">
            <div className="relative group">
              <div className="h-40 w-40 rounded-full bg-[#F8FAFC] flex items-center justify-center border-4 border-white shadow-md ring-1 ring-[#E2E8F0] overflow-hidden">
                 <User className="text-[#E2E8F0]" size={80} />
                 <div className="absolute inset-0 bg-[#0EA5E966] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                   <Camera className="text-white" size={32} />
                 </div>
              </div>
              <button className="absolute bottom-2 right-1 h-10 w-10 bg-[#0EA5E9] text-white rounded-full flex items-center justify-center shadow-lg hover:bg-[#38BDF8] transition-all border-4 border-white">
                <Camera size={18} />
              </button>
            </div>
            <div className="text-center">
               <span className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[12px] font-bold uppercase tracking-wider border border-emerald-100">
                  <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                  Active User
               </span>
            </div>
          </div>

          {/* Right Side: Form Grid */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            <Input label="First Name" placeholder="e.g. Jonathan" required />
            <Input label="Last Name" placeholder="e.g. Doe" required />
            
            <Input 
              label="Email Address" 
              placeholder="jdoe@example.com" 
              icon={Mail} 
              required 
            />
            
            <Input 
              label="Phone Number" 
              placeholder="98765 43210" 
              icon={Phone} 
              required 
            />

            <div className="relative">
              <Input 
                label="Access Password" 
                type={showPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                icon={Lock} 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[38px] text-[#94A3B8] hover:text-[#0EA5E9]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative">
              <Input 
                label="Confirm Password" 
                type={showConfirmPassword ? 'text' : 'password'} 
                placeholder="••••••••" 
                icon={ShieldCheck} 
                required 
              />
              <button 
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-[38px] text-[#94A3B8] hover:text-[#0EA5E9]"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="col-span-1 md:col-span-2 space-y-1.5">
              <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">System Role & Permissions</label>
              <select className="w-full h-10 px-4 rounded-lg border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#1E293B] outline-none focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E90D] transition-all">
                <option value="">Select Role</option>
                <option>Administrator</option>
                <option>Purchase Manager</option>
                <option>Sales Associate</option>
              </select>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AddUserPage
