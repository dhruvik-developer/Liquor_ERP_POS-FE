import React from 'react'
import { User, Mail, Shield, Lock, Save, Camera } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'
import { getStoredAuth } from '../../utils/auth'

const UserProfile = () => {
  const auth = getStoredAuth()
  const user = auth?.data?.user || auth?.user || auth || {}
  
  const userName = user.name || ''
  const userEmail = user.email || ''
  const userPhone = user.phone || ''
  const userRoleName = user.role?.name || user.role_name || user.role || (user.is_super_admin ? 'System Administrator' : 'Administrator')
  const operatorId = user.id ? `OP-${user.id.toString().padStart(4, '0')}` : 'OP-4829'
  const lastAccessDate = user.updated_at 
    ? new Date(user.updated_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).replace(/ /g, '-')
    : '18-Mar-2026'

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-y-auto pb-10 pr-2">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">Account Profile</h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">Manage your operator identity</p>
        </div>
        <Button className="gap-2 px-8">
          <Save size={18} />
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Avatar & Role */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="flex flex-col items-center py-10">
            <div className="relative group">
              <div className="h-32 w-32 rounded-lg bg-[#0EA5E90D] flex items-center justify-center text-[#0EA5E9] border-2 border-[#0EA5E91A] overflow-hidden">
                <User size={64} strokeWidth={1.5} />
              </div>
              <button className="absolute -bottom-2 -right-2 h-10 w-10 bg-[#0EA5E9] text-white rounded-lg flex items-center justify-center shadow-lg border-4 border-white hover:bg-[#38BDF8] transition-all">
                <Camera size={18} />
              </button>
            </div>
            
            <div className="mt-6 text-center">
              <h2 className="text-[20px] font-black text-[#1E293B] tracking-tight">{userName}</h2>
              <p className="text-[12px] font-bold text-[#0EA5E9] uppercase tracking-widest mt-1">{userRoleName}</p>
            </div>

            <div className="mt-8 pt-8 border-t border-[#E2E8F0] w-full space-y-4">
               <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#64748B] font-medium">Operator ID</span>
                  <span className="text-[#1E293B] font-bold">{operatorId}</span>
               </div>
               <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#64748B] font-medium">Last Access</span>
                  <span className="text-[#1E293B] font-bold">{lastAccessDate}</span>
               </div>
               <div className="flex justify-between items-center text-[13px]">
                  <span className="text-[#64748B] font-medium">Security Status</span>
                  <span className="text-emerald-500 font-bold uppercase tracking-wider text-[11px]">Healthy</span>
               </div>
            </div>
          </Card>
        </div>

        {/* Right: Forms */}
        <div className="lg:col-span-8 space-y-8">
          <Card title="Basic Information">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Input label="Full Name" defaultValue={userName} icon={User} />
              <Input label="Email Address" defaultValue={userEmail} icon={Mail} />
              <Input label="Phone Number" defaultValue={userPhone} />
              <div className="space-y-1.5">
                <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">Primary Role</label>
                <div className="h-10 px-4 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0] flex items-center text-[14px] font-bold text-[#94A3B8]">
                  {userRoleName}
                </div>
              </div>
            </div>
          </Card>

          <Card title="Security Protocol" className="relative">
            <div className="absolute top-0 left-0 w-1 h-full bg-rose-500 rounded-l-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <Input label="Current Password" type="password" placeholder="••••••••" icon={Lock} />
              <div className="hidden md:block" />
              <Input label="New Password" type="password" placeholder="••••••••" icon={Lock} />
              <Input label="Confirm New Password" type="password" placeholder="••••••••" icon={Lock} />
            </div>
            <div className="mt-8 p-4 bg-rose-50 border border-rose-100 rounded-lg flex items-start gap-4">
              <Shield className="text-rose-500 shrink-0 mt-0.5" size={20} />
              <div>
                <p className="text-[13px] font-bold text-rose-600 uppercase tracking-wide">Security Advisory</p>
                <p className="text-[12px] font-medium text-rose-500 leading-relaxed mt-1">
                  Changing your password will terminate all active sessions. You will be required to log in again with new credentials.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default UserProfile
