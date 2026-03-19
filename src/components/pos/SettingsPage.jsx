import React, { useState } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check
} from 'lucide-react'
import { CardDataModal, PromotionDataModal } from './DataModals'
import Button from '../common/Button'
import Card from '../common/Card'

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('customer')
  const [showModal, setShowModal] = useState(null) 

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-hidden relative pb-8 pr-2">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">Application Settings</h1>
          <p className="text-[#64748B] font-bold text-[14px] mt-1 uppercase tracking-wider">Configure your POS experience</p>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="flex items-center gap-8 px-2 border-b border-[#E2E8F0]">
        <button 
          onClick={() => setActiveTab('customer')}
          className={`pb-4 pt-2 text-[14px] font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'customer' 
              ? 'text-[#0EA5E9]' 
              : 'text-[#94A3B8] hover:text-[#64748B]'
          }`}
        >
          Customer Screen
          {activeTab === 'customer' && (
            <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#0EA5E9] rounded-full" />
          )}
        </button>
        <button 
          onClick={() => setActiveTab('credit-card')}
          className={`pb-4 pt-2 text-[14px] font-bold uppercase tracking-wider transition-all relative ${
            activeTab === 'credit-card' 
              ? 'text-[#0EA5E9]' 
              : 'text-[#94A3B8] hover:text-[#64748B]'
          }`}
        >
          Credit Card Setup
          {activeTab === 'credit-card' && (
            <div className="absolute bottom-[-1px] left-0 right-0 h-[3px] bg-[#0EA5E9] rounded-full" />
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden">
        
        {/* Action Header */}
        <div className="p-6 flex items-center justify-between bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2">
             <div className="h-2 w-2 rounded-full bg-[#0EA5E9]"></div>
             <p className="text-[12px] font-bold text-[#64748B] uppercase tracking-wider">Managing {activeTab === 'customer' ? 'Promotions' : 'Card Fees'}</p>
          </div>
          <Button 
            onClick={() => setShowModal(activeTab === 'customer' ? 'promotion' : 'card')}
            className="gap-2 px-8"
          >
            <Plus size={18} />
            Add New Record
          </Button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'customer' ? <CustomerScreenTable /> : <CreditCardSetupTable />}
        </div>
      </div>

      {/* Modals */}
      {showModal === 'card' && <CardDataModal onClose={() => setShowModal(null)} />}
      {showModal === 'promotion' && <PromotionDataModal onClose={() => setShowModal(null)} />}

    </div>
  )
}

const CustomerScreenTable = () => {
  const [data, setData] = useState([
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200&auto=format&fit=crop", 
      title: "Get 15% Off All Local Wines",
      tagline: "This Week's Special",
      status: true,
      createdOn: "5:01 PM\n07-23-2025"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1569701881643-40714229987b?q=80&w=200&auto=format&fit=crop", 
      title: "Get 15% Off All Imported Wines",
      tagline: "This Week's Special",
      status: true,
      createdOn: "5:01 PM\n07-23-2025"
    }
  ])

  return (
    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white">
      <table className="w-full text-left border-collapse text-[14px]">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center w-24">Media</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Promotion</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Status</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors group">
              <td className="px-6 py-4">
                <div className="w-20 h-12 rounded-lg overflow-hidden border border-[#E2E8F0] shadow-sm">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="font-bold text-[#1E293B]">{item.title}</p>
                <p className="text-[12px] text-[#94A3B8] font-medium">{item.tagline}</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  <Toggle value={item.status} />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-4">
                  <button className="text-[#0EA5E9] p-2 hover:bg-[#0EA5E90D] rounded-lg transition-colors"><Edit3 size={18} /></button>
                  <button className="text-rose-400 p-2 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CreditCardSetupTable = () => {
  const [data, setData] = useState([
    { id: 1, name: 'Amex', fee: '2.50%', status: true },
    { id: 2, name: 'Discover', fee: '3.50%', status: true },
  ])

  return (
    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white">
      <table className="w-full text-left border-collapse text-[14px]">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center w-24">SR #</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Card Provider</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Surcharge Fee</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Status</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {data.map((item) => (
            <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors group">
              <td className="px-6 py-4 text-center text-[12px] font-bold text-[#94A3B8]">{item.id}</td>
              <td className="px-6 py-4 font-bold text-[#1E293B]">{item.name}</td>
              <td className="px-6 py-4">
                 <span className="text-[14px] font-bold text-[#0EA5E9]">{item.fee}</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  <Toggle value={item.status} />
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-4">
                  <button className="text-[#0EA5E9] p-2 hover:bg-[#0EA5E90D] rounded-lg transition-colors"><Edit3 size={18} /></button>
                  <button className="text-rose-400 p-2 hover:bg-rose-50 rounded-lg transition-colors"><Trash2 size={18} /></button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Toggle = ({ value }) => {
  const [on, setOn] = useState(value)
  return (
    <button 
      onClick={() => setOn(!on)}
      className={`w-10 h-5.5 rounded-full p-1 transition-all duration-300 relative ${
        on ? 'bg-[#0EA5E9]' : 'bg-[#E2E8F0]'
      }`}
    >
      <div className={`w-3.5 h-3.5 bg-white rounded-full shadow-sm transition-all duration-300 transform flex items-center justify-center ${
        on ? 'translate-x-4.5' : 'translate-x-0'
      }`}>
         {on && <Check size={8} className="text-[#0EA5E9] font-black" />}
      </div>
    </button>
  )
}

export default SettingsPage
