import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
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
import useApi from '../../hooks/useApi'
import useFetch from '../../hooks/useFetch'
import Loader from '../common/Loader'
import StyledDropdown from '../common/StyledDropdown'

const AddUserPage = ({ onCancel, onSave }) => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  
  const { post, put, loading: saving, error: saveError } = useApi()
  const { data: existingData, loading: fetching, error: fetchError } = useFetch(isEdit ? `/users/${id}/` : null)

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    password: '',
    confirm_password: '',
    role: ''
  })
  const [formError, setFormError] = useState('')

  useEffect(() => {
    if (existingData) {
      setFormData({
        first_name: existingData.first_name || '',
        last_name: existingData.last_name || '',
        email: existingData.email || '',
        phone: existingData.phone || '',
        password: '',
        confirm_password: '',
        role: existingData.role || ''
      })
    }
  }, [existingData])

  const handleCancel = () => {
    if (onCancel) onCancel()
    else navigate('/pos/people?tab=users')
  }

  const handleSaveBtn = async () => {
    setFormError('')
    
    // Validations
    if (formData.password || formData.confirm_password || !isEdit) {
      if (formData.password !== formData.confirm_password) {
        setFormError("Passwords do not match")
        return
      }
      if (!isEdit && !formData.password) {
        setFormError("Password is required for new users")
        return
      }
    }

    try {
      const payload = {
        username: formData.email,
        email: formData.email,
        first_name: formData.first_name,
        last_name: formData.last_name,
        role: formData.role
      }

      if (formData.password) {
        payload.password = formData.password
      }

      if (isEdit) {
        await put(`/users/${id}/`, payload)
      } else {
        await post('/users/', payload)
      }
      
      if (onSave) onSave()
      else navigate('/pos/people?tab=users')
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
            {isEdit ? 'Update User Profile' : 'Register New User'}
          </h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">System Access Management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleCancel} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSaveBtn} disabled={saving} className="gap-2 px-8">
            <Save size={18} />
            {saving ? 'Saving...' : isEdit ? 'Update User' : 'Save User'}
          </Button>
        </div>
      </div>
      
      {(saveError || fetchError || formError) && (
        <div className="p-4 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 font-bold">
          {formError || saveError || fetchError}
        </div>
      )}

      {/* Main Form Content */}
      <Card className="relative overflow-hidden">
        
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
            <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="e.g. Jonathan" required />
            <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="e.g. Doe" required />
            
            <Input 
              label="Email Address" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="off"
              placeholder="jdoe@example.com" 
              icon={Mail} 
              required 
            />
            
            <Input 
              label="Phone Number" 
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="98765 43210" 
              icon={Phone} 
              required 
            />

            <div className="relative">
              <Input 
                label={isEdit ? "New Password (Leave blank to keep current)" : "Access Password"} 
                name="password"
                value={formData.password}
                onChange={handleChange}
                type={showPassword ? 'text' : 'password'} 
                autoComplete="new-password"
                placeholder="••••••••" 
                icon={Lock} 
                required={!isEdit}
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
                name="confirm_password"
                value={formData.confirm_password}
                onChange={handleChange}
                type={showConfirmPassword ? 'text' : 'password'} 
                autoComplete="new-password"
                placeholder="••••••••" 
                icon={ShieldCheck} 
                required={!isEdit || !!formData.password}
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
              <label className="text-[14px] font-bold text-[#1E293B] ml-0.5 uppercase tracking-widest text-[#64748B]">System Role & Permissions</label>
              <StyledDropdown
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="Select Role"
                triggerClassName="border-[#E2E8F0] bg-white !text-[14px] !font-medium !text-[#1E293B]"
              >
                <option value="">Select Role</option>
                <option value="Administrator">Administrator</option>
                <option value="Purchase Manager">Purchase Manager</option>
                <option value="Sales Associate">Sales Associate</option>
              </StyledDropdown>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default AddUserPage
 Greenland
