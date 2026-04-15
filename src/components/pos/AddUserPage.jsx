import React, { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { 
  User, 
  Camera,
  Mail,
  Phone,
  Lock,
  ShieldCheck,
  Save,
  MapPin
} from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'
import useApi from '../../hooks/useApi'
import useFetch from '../../hooks/useFetch'
import Loader from '../common/Loader'
import StyledDropdown from '../common/StyledDropdown'
import Toggle from '../common/Toggle'
import { getPortalBasePath, getStoredAuth } from '../../utils/auth'

const AddUserPage = ({ onCancel, onSave }) => {
  const { id } = useParams()
  const isEdit = !!id
  const navigate = useNavigate()
  const portalBasePath = getPortalBasePath(getStoredAuth())
  
  const { post, put, loading: saving, error: saveError } = useApi()
  const { data: existingData, loading: fetching, error: fetchError } = useFetch(isEdit ? `/users/${id}/` : null)
  const { data: rolesData, loading: rolesLoading } = useFetch('/roles/')

  const [formData, setFormData] = useState({
    user_id: '',
    gender: '',
    first_name: '',
    last_name: '',
    email: '',
    mobile_number: '',
    phone: '',
    phone_ext: '',
    address_1: '',
    address_2: '',
    city: '',
    state: '',
    zip_code: '',
    country: '',
    password: '',
    confirm_password: '',
    is_active: true,
    role_id: '',
    store_ids: ''
  })
  const [formError, setFormError] = useState('')

  const roles = Array.isArray(rolesData) ? rolesData : rolesData?.results || []

  const roleOptions = roles
    .map((role) => {
      const roleId = role?.id ?? role?.role_id ?? role?.value
      const roleLabel = role?.name || role?.role_name || role?.title || role?.label

      if (roleId === undefined || roleId === null || !roleLabel) {
        return null
      }

      return {
        id: String(roleId),
        label: String(roleLabel),
      }
    })
    .filter(Boolean)

  useEffect(() => {
    if (existingData) {
      const resolvedRoleId =
        existingData.role_id ??
        existingData.role?.id ??
        existingData.role?.role_id ??
        ''

      setFormData({
        user_id: existingData.user_id || '',
        gender: existingData.gender || '',
        first_name: existingData.first_name || '',
        last_name: existingData.last_name || '',
        email: existingData.email || '',
        mobile_number: existingData.mobile_number || '',
        phone: existingData.phone || '',
        phone_ext: existingData.phone_ext || '',
        address_1: existingData.address_1 || '',
        address_2: existingData.address_2 || '',
        city: existingData.city || '',
        state: existingData.state || '',
        zip_code: existingData.zip_code || '',
        country: existingData.country || '',
        password: '',
        confirm_password: '',
        is_active: existingData.is_active !== undefined ? existingData.is_active : true,
        role_id: resolvedRoleId !== '' ? String(resolvedRoleId) : '',
        store_ids: existingData.store_ids ? existingData.store_ids.join(', ') : ''
      })
    }
  }, [existingData])

  const handleCancel = () => {
    if (onCancel) onCancel()
    else navigate(`${portalBasePath}/people?tab=users`)
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
        user_id: formData.user_id,
        gender: formData.gender,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        mobile_number: formData.mobile_number,
        phone: formData.phone,
        phone_ext: formData.phone_ext,
        address_1: formData.address_1,
        address_2: formData.address_2,
        city: formData.city,
        state: formData.state,
        zip_code: formData.zip_code,
        country: formData.country,
        is_active: formData.is_active,
        role_id: parseInt(formData.role_id) || null,
        store_ids: formData.store_ids 
          ? formData.store_ids.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n)) 
          : []
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
      else navigate(`${portalBasePath}/people?tab=users`)
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
    <div className="flex flex-col min-h-full space-y-6 animate-in fade-in duration-500 pb-12">
      
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-[26px] sm:text-[28px] font-black text-[#1E293B] tracking-tight">
            {isEdit ? 'Update User Profile' : 'Register New User'}
          </h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">System Access Management</p>
        </div>
        <div className="grid grid-cols-2 gap-3 w-full sm:w-auto sm:flex">
          <Button variant="outline" onClick={handleCancel} disabled={saving} className="w-full sm:w-auto">
            Cancel
          </Button>
          <Button onClick={handleSaveBtn} disabled={saving} className="gap-2 px-4 sm:px-8 w-full sm:w-auto">
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
      <Card className="relative !overflow-visible">
        <div className="flex flex-col lg:flex-row gap-12 pt-4">
          
          {/* Left Side: Photo & Status */}
          <div className="w-full lg:w-48 flex flex-col items-center gap-6 shrink-0">
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
            
            <div className="w-full flex items-center justify-between px-4 py-3 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
               <span className="text-[14px] font-bold text-[#475569]">User is Active</span>
               <Toggle 
                 checked={formData.is_active} 
                 onChange={(val) => setFormData({...formData, is_active: val})} 
               />
            </div>
          </div>

          {/* Right Side: Form Sections */}
          <div className="flex-1 flex flex-col gap-10">
            
            {/* Basic Information */}
            <div className="space-y-5">
               <h3 className="text-[14px] font-black uppercase tracking-widest text-[#94A3B8] border-b border-[#E2E8F0] pb-2">Basic Information</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6">
                 <Input label="User ID" name="user_id" value={formData.user_id} onChange={handleChange} placeholder="e.g. EMP1001" required />
                 <Input label="First Name" name="first_name" value={formData.first_name} onChange={handleChange} placeholder="e.g. John" required />
                 <Input label="Last Name" name="last_name" value={formData.last_name} onChange={handleChange} placeholder="e.g. Doe" required />
                 
                 <div className="space-y-1.5 flex flex-col relative z-30">
                   <label className="text-[14px] font-bold text-[#1E293B] ml-0.5">Gender</label>
                   <StyledDropdown 
                     name="gender" 
                     value={formData.gender} 
                     onChange={handleChange} 
                     placeholder="Select Gender"
                     triggerClassName="border-[#E2E8F0] bg-white !text-[14px] !font-medium !text-[#1E293B]"
                   >
                     <option value="">Select Gender</option>
                     <option value="Male">Male</option>
                     <option value="Female">Female</option>
                     <option value="Other">Other</option>
                   </StyledDropdown>
                 </div>
                 <div className="md:col-span-1 lg:col-span-2">
                   <Input 
                     label="Email Address" 
                     type="email" 
                     name="email" 
                     value={formData.email} 
                     onChange={handleChange} 
                     placeholder="jdoe@example.com"
                     icon={Mail} 
                     required 
                   />
                 </div>
               </div>
            </div>

            {/* Contact & Address */}
            <div className="space-y-5">
               <h3 className="text-[14px] font-black uppercase tracking-widest text-[#94A3B8] border-b border-[#E2E8F0] pb-2">Contact & Address</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-6">
                 <div className="lg:col-span-2">
                   <Input label="Mobile Number" name="mobile_number" value={formData.mobile_number} onChange={handleChange} placeholder="98765 43210" icon={Phone} required />
                 </div>
                 <Input label="Work Phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="2145551234" icon={Phone} />
                 <Input label="Extension" name="phone_ext" value={formData.phone_ext} onChange={handleChange} placeholder="101" />
                 
                 <div className="md:col-span-2 lg:col-span-2">
                   <Input label="Address Line 1" name="address_1" value={formData.address_1} onChange={handleChange} placeholder="123 Main Street" icon={MapPin} />
                 </div>
                 <div className="md:col-span-2 lg:col-span-2">
                   <Input label="Address Line 2" name="address_2" value={formData.address_2} onChange={handleChange} placeholder="Suite 204" icon={MapPin} />
                 </div>
                 
                 <Input label="City" name="city" value={formData.city} onChange={handleChange} placeholder="Dallas" />
                 <Input label="State" name="state" value={formData.state} onChange={handleChange} placeholder="TX" />
                 <Input label="Zip Code" name="zip_code" value={formData.zip_code} onChange={handleChange} placeholder="75201" />
                 <Input label="Country" name="country" value={formData.country} onChange={handleChange} placeholder="USA" />
               </div>
            </div>

            {/* Authentication & Access */}
            <div className="space-y-5">
               <h3 className="text-[14px] font-black uppercase tracking-widest text-[#94A3B8] border-b border-[#E2E8F0] pb-2">Authentication & Access</h3>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                 
                 <Input 
                   label={isEdit ? "New Password (Leave blank to keep current)" : "Access Password"} 
                   name="password"
                   value={formData.password}
                   onChange={handleChange}
                   type="password" 
                   autoComplete="new-password"
                   placeholder="••••••••" 
                   icon={Lock} 
                   required={!isEdit}
                 />

                 <Input 
                   label="Confirm Password" 
                   name="confirm_password"
                   value={formData.confirm_password}
                   onChange={handleChange}
                   type="password" 
                   autoComplete="new-password"
                   placeholder="••••••••" 
                   icon={ShieldCheck} 
                   required={!isEdit || !!formData.password}
                 />

                 <div className="space-y-1.5 flex flex-col relative z-20">
                   <label className="text-[14px] font-bold text-[#1E293B] ml-0.5">Assigned Role</label>
                   <StyledDropdown 
                     name="role_id" 
                     value={formData.role_id} 
                     onChange={handleChange} 
                     disabled={rolesLoading}
                     placeholder={rolesLoading ? 'Loading roles...' : 'Select Role'}
                     triggerClassName="border-[#E2E8F0] bg-white !text-[14px] !font-medium !text-[#1E293B]"
                   >
                     <option value="">Select Role</option>
                     {roleOptions.map((role) => (
                       <option key={role.id} value={role.id}>
                         {role.label}
                       </option>
                     ))}
                   </StyledDropdown>
                 </div>

                 <Input 
                   label="Assigned Store IDs" 
                   name="store_ids" 
                   value={formData.store_ids} 
                   onChange={handleChange} 
                   placeholder="e.g. 1, 2, 3 (Comma separated)" 
                 />
                 
               </div>
            </div>

          </div>
        </div>
      </Card>
    </div>
  )
}

export default AddUserPage
