import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Search, 
  Plus, 
  Key, 
  Pencil, 
  Trash2, 
  ChevronDown,
  UserCircle,
  Users as UserGroup,
  Store
} from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'

const PeopleManagement = () => {
  const [activeTab, setActiveTab] = useState('users')

  const tabs = [
    { id: 'users', label: 'Users', icon: UserCircle },
    { id: 'customers', label: 'Customers', icon: UserGroup },
    { id: 'vendors', label: 'Vendors', icon: Store }
  ]

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 pb-8 pr-2">
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-1 flex items-center gap-1 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-6 py-2 rounded-md text-[14px] font-bold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-[#0EA5E91A] text-[#0EA5E9]'
                : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 min-h-0">
        {activeTab === 'users' ? (
          <UsersTab />
        ) : activeTab === 'customers' ? (
          <CustomersTab />
        ) : (
          <VendorsTab />
        )}
      </div>
    </div>
  )
}

const UsersTab = () => {
  const users = [
    { name: 'Purchase Manager', email: 'purchase-manager@pos.com', role: 'Purchase Manager', phone: '919874562120', status: true, stores: 1, time: '5:01 PM', date: '07-23-2025' },
    { name: 'demo admin', email: 'demo-user@pos.com', role: 'admin', phone: '919999999999', status: true, stores: 0, time: '5:28 AM', date: '07-23-2025' }
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Input placeholder="User Name or Email" className="w-64" />
          <div className="relative w-48">
            <select className="w-full h-10 px-4 pr-10 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] text-[14px] font-bold text-[#1E293B] outline-none appearance-none focus:border-[#0EA5E9] focus:bg-white focus:ring-4 focus:ring-[#0EA5E90D] transition-all">
              <option>Filter By Role</option>
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" size={18} />
          </div>
          <Button>Filter</Button>
          <div className="flex-1" />
          <Link to="/pos/people/users/add">
            <Button className="gap-2">
              <Plus size={18} />
              Add User
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-auto flex-1 text-[14px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">User</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Role</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Status</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {users.map((user, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#0EA5E9] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#0EA5E9] hover:underline cursor-pointer">{user.name}</p>
                        <p className="text-[12px] text-[#94A3B8]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-[#475569]">{user.role}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className={`h-2.5 w-2.5 rounded-full ${user.status ? 'bg-emerald-500' : 'bg-[#94A3B8]'}`} />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-3">
                      <Key size={14} className="text-amber-500 hover:scale-125 transition cursor-pointer" />
                      <Pencil size={14} className="text-[#0EA5E9] hover:scale-125 transition cursor-pointer" />
                      <Trash2 size={14} className="text-rose-500 hover:scale-125 transition cursor-pointer" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const CustomersTab = () => {
  const customers = [
    { name: 'Purchase Manager', email: 'purchase-manager@pos.com', phone: '919874562120', time: '5:01 PM', date: '07-23-2025' },
    { name: 'demo admin', email: 'demo-user@pos.com', phone: '919999999999', time: '5:28 AM', date: '07-23-2025' }
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <Input placeholder="Customer Name or Email" icon={Search} className="w-72" />
          <Link to="/pos/people/customers/add">
            <Button className="gap-2">
              <Plus size={18} />
              Create Customer
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-auto flex-1 text-[14px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Customer</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Phone Number</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {customers.map((customer, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-[#0EA5E9] hover:underline cursor-pointer">{customer.name}</p>
                    <p className="text-[12px] text-[#94A3B8]">{customer.email}</p>
                  </td>
                  <td className="px-6 py-4 text-center font-medium text-[#475569]">{customer.phone}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-4">
                      <Pencil size={14} className="text-[#0EA5E9] hover:scale-125 transition cursor-pointer" />
                      <Trash2 size={14} className="text-rose-500 hover:scale-125 transition cursor-pointer" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

const VendorsTab = () => {
  const vendors = [
    { name: 'Jebin Corp', company: 'ABC Company', invoice: '427.00', paid: '00.00', balance: '427.00' },
    { name: 'John Corn', company: 'Amazon LLC', invoice: '5000.00', paid: '00.00', balance: '5000.00' }
  ]

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="bg-white rounded-lg border border-[#E2E8F0] p-5 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <Input placeholder="Vendor or Company" icon={Search} className="w-72" />
          <Link to="/pos/people/vendors/add">
            <Button className="gap-2">
              <Plus size={18} />
              Add Vendor
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm overflow-hidden flex flex-col min-h-[400px]">
        <div className="overflow-auto flex-1 text-[14px]">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Vendor</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Company</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-right">Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {vendors.map((vendor, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <p className="font-bold text-[#0EA5E9] underline cursor-pointer hover:text-[#38BDF8]">{vendor.name}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-[#475569]">{vendor.company}</td>
                  <td className="px-6 py-4 text-right font-bold text-[#1E293B]">${vendor.balance}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default PeopleManagement
