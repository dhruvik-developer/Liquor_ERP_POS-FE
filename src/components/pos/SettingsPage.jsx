import React, { useState, useEffect } from 'react'
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Check,
  Search,
  Loader2
} from 'lucide-react'
import { CardDataModal, PromotionDataModal } from './DataModals'
import Button from '../common/Button'
import Card from '../common/Card'
import useFetch from '../../hooks/useFetch'
import useApi from '../../hooks/useApi'
import Loader from '../common/Loader'
import { formatDateTimeAmPm } from '../../utils/dateUtils'


const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('customer')
  const [showModal, setShowModal] = useState(null) 
  const [editingItem, setEditingItem] = useState(null)

  const { data: promotionsData, loading: promotionsLoading, error: promotionsError, refetch: refetchPromotions } = useFetch('/inventory/promotions/')
  const { data: cardsData, loading: cardsLoading, error: cardsError, refetch: refetchCards } = useFetch('/inventory/card-setups/')
  const { del, put, loading: apiLoading } = useApi()

  const handleEdit = (item) => {
    setEditingItem(item)
    setShowModal(activeTab === 'customer' ? 'promotion' : 'card')
  }

  const handleAdd = () => {
    setEditingItem(null)
    setShowModal(activeTab === 'customer' ? 'promotion' : 'card')
  }

  const handleDelete = async (id) => {
    const endpoint = activeTab === 'customer' ? `/inventory/promotions/${id}/` : `/inventory/card-setups/${id}/`
    const refetch = activeTab === 'customer' ? refetchPromotions : refetchCards
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        await del(endpoint)
        refetch()
      } catch (err) {
        console.error('Delete failed:', err)
      }
    }
  }

  const handleToggleStatus = async (item) => {
    const endpoint = activeTab === 'customer' ? `/inventory/promotions/${item.id}/` : `/inventory/card-setups/${item.id}/`
    const refetch = activeTab === 'customer' ? refetchPromotions : refetchCards
    try {
      await put(endpoint, { ...item, status: !item.status })
      refetch()
    } catch (err) {
      console.error('Status update failed:', err)
    }
  }

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
      <div className="bg-white rounded-lg border border-[#E2E8F0] shadow-sm p-1 flex items-center gap-1 w-fit">
        <button
          onClick={() => setActiveTab('customer')}
          className={`flex items-center px-6 py-2 rounded-md text-[14px] font-bold uppercase tracking-wider transition-all duration-200 ${
            activeTab === 'customer'
              ? 'bg-[#0EA5E91A] text-[#0EA5E9]'
              : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
          }`}
        >
          Customer Screen
        </button>
        <button
          onClick={() => setActiveTab('credit-card')}
          className={`flex items-center px-6 py-2 rounded-md text-[14px] font-bold uppercase tracking-wider transition-all duration-200 ${
            activeTab === 'credit-card'
              ? 'bg-[#0EA5E91A] text-[#0EA5E9]'
              : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#1E293B]'
          }`}
        >
          Credit Card Setup
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
            onClick={handleAdd}
            className="gap-2 px-8 h-12 rounded-xl text-[14px] bg-[#0EA5E9] hover:bg-[#0284C7] shadow-lg shadow-[#0EA5E933]"
          >
            <Plus size={18} />
            + Add
          </Button>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-6">
          {activeTab === 'customer' ? (
            <CustomerScreenTable 
              data={promotionsData || []} 
              loading={promotionsLoading} 
              error={promotionsError}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          ) : (
            <CreditCardSetupTable 
              data={cardsData || []} 
              loading={cardsLoading} 
              error={cardsError}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleStatus={handleToggleStatus}
            />
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal === 'card' && (
        <CardDataModal 
          onClose={() => setShowModal(null)} 
          item={editingItem} 
          refetch={refetchCards} 
        />
      )}
      {showModal === 'promotion' && (
        <PromotionDataModal 
          onClose={() => setShowModal(null)} 
          item={editingItem} 
          refetch={refetchPromotions}
        />
      )}

    </div>
  )
}

const CustomerScreenTable = ({ data, loading, error, onEdit, onDelete, onToggleStatus }) => {
  if (loading) return (
    <div className="h-full flex items-center justify-center p-12">
      <Loader size={64} />
    </div>
  )

  if (error) return (
    <div className="p-8 text-center text-rose-500 font-bold bg-rose-50 rounded-xl border border-rose-100">
      {error}
    </div>
  )

  const formatDateTime = (dateStr) => {
    const dt = formatDateTimeAmPm(dateStr)
    if (!dt) return '-'
    return (
      <div className="leading-tight">
        <p className="font-bold text-[#475569]">{dt.time}</p>
        <p className="text-[11px] text-[#94A3B8] font-medium">{dt.date}</p>
      </div>
    )
  }

  return (
    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-[14px]">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center w-16">#</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center w-32">Image</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Title</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Tagline</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Status</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Created On</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {data.length === 0 && (
            <tr>
              <td colSpan="7" className="px-6 py-12 text-center text-[#94A3B8] font-bold italic">
                No promotions found. Add one to see it here.
              </td>
            </tr>
          )}
          {data.map((item, index) => (
            <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors group">
              <td className="px-6 py-4 text-center text-[12px] font-bold text-[#94A3B8]">
                {index + 1}
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  <div className="w-24 h-14 rounded-lg overflow-hidden border border-[#E2E8F0] shadow-sm bg-slate-50">
                    <img 
                      src={item.image || "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=200&auto=format&fit=crop"} 
                      alt={item.title} 
                      className="w-full h-full object-cover" 
                      onError={(e) => { e.target.src = "https://via.placeholder.com/200x100?text=No+Image" }}
                    />
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <p className="font-bold text-[#1E293B] leading-tight">{item.title}</p>
              </td>
              <td className="px-6 py-4">
                <p className="text-[14px] text-[#475569] font-medium leading-tight">{item.tagline || '-'}</p>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  <Toggle value={item.status} onClick={() => onToggleStatus(item)} />
                </div>
              </td>
              <td className="px-6 py-4">
                {formatDateTime(item.created_at || item.createdOn)}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-center gap-3">
                  <button 
                    onClick={() => onEdit(item)}
                    className="text-[#0EA5E9] p-2 hover:bg-[#0EA5E90D] rounded-lg transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="text-rose-400 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const CreditCardSetupTable = ({ data, loading, error, onEdit, onDelete, onToggleStatus }) => {
  if (loading) return (
    <div className="h-full flex items-center justify-center p-12">
      <Loader size={64} />
    </div>
  )

  if (error) return (
    <div className="p-8 text-center text-rose-500 font-bold bg-rose-50 rounded-xl border border-rose-100">
      {error}
    </div>
  )

  return (
    <div className="border border-[#E2E8F0] rounded-lg overflow-hidden bg-white shadow-sm">
      <table className="w-full text-left border-collapse text-[14px]">
        <thead>
          <tr className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center w-24">SR #</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Card Name</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider">Fee</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Status</th>
            <th className="px-6 py-4 text-[11px] font-bold text-[#64748B] uppercase tracking-wider text-center">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {data.length === 0 && (
            <tr>
              <td colSpan="5" className="px-6 py-12 text-center text-[#94A3B8] font-bold italic">
                No card setups found.
              </td>
            </tr>
          )}
          {data.map((item, index) => (
            <tr key={item.id} className="hover:bg-[#F8FAFC] transition-colors group">
              <td className="px-6 py-4 text-center text-[12px] font-bold text-[#94A3B8]">{index + 1}</td>
              <td className="px-6 py-4 font-bold text-[#1E293B]">{item.name}</td>
              <td className="px-6 py-4">
                 <span className="text-[14px] font-bold text-[#0EA5E9]">{item.fee}%</span>
              </td>
              <td className="px-6 py-4">
                <div className="flex justify-center">
                  <Toggle value={item.status} onClick={() => onToggleStatus(item)} />
                </div>
              </td>
              <td className="px-6 py-4 border-l border-[#F1F5F9]">
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => onEdit(item)}
                    className="text-[#0EA5E9] p-2 hover:bg-[#0EA5E90D] rounded-lg transition-colors"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button 
                    onClick={() => onDelete(item.id)}
                    className="text-rose-400 p-2 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const Toggle = ({ value, onClick }) => {
  const [on, setOn] = useState(value)
  
  useEffect(() => {
    setOn(value)
  }, [value])

  const handleToggle = () => {
    setOn(!on)
    if (onClick) onClick()
  }

  return (
    <button 
      onClick={handleToggle}
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
