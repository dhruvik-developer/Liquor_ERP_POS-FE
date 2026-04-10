import React, { useEffect, useMemo } from 'react'
import { Search, UserPlus, X } from 'lucide-react'
import AddCustomerQuickModal from './AddCustomerQuickModal'

const AVATAR_TONES = [
  'bg-[#DBEAFE] text-[#2563EB]',
  'bg-[#CCFBF1] text-[#0F766E]',
  'bg-[#F3E8FF] text-[#9333EA]',
  'bg-[#FEF3C7] text-[#D97706]',
  'bg-[#FCE7F3] text-[#DB2777]',
]

const getCustomerName = (customer) => (
  customer?.name ||
  customer?.full_name ||
  customer?.customer_name ||
  'Unnamed Customer'
)

const getCustomerPhone = (customer) => (
  customer?.phone ||
  customer?.mobile_number ||
  customer?.phone_number ||
  '-'
)

const getCustomerEmail = (customer) => customer?.email || ''

const getInitials = (name) => (
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'CU'
)

const CustomerSelectModal = ({
  isOpen,
  customers = [],
  loading = false,
  onClose,
  onSelect,
  onCustomerAdded,
}) => {
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isAddCustomerOpen, setIsAddCustomerOpen] = React.useState(false)

  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose?.()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  useEffect(() => {
    if (!isOpen) {
      setSearchQuery('')
      setIsAddCustomerOpen(false)
    }
  }, [isOpen])

  const filteredCustomers = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()
    if (!normalizedQuery) return customers

    return customers.filter((customer) => {
      const haystack = [
        getCustomerName(customer),
        getCustomerPhone(customer),
        getCustomerEmail(customer),
      ]
        .join(' ')
        .toLowerCase()

      return haystack.includes(normalizedQuery)
    })
  }, [customers, searchQuery])

  if (!isOpen) return null

  const handleOpenAddCustomer = () => setIsAddCustomerOpen(true)

  const handleCustomerCreated = (customer) => {
    setIsAddCustomerOpen(false)
    onCustomerAdded?.(customer)
  }

  return (
    <>
      <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/45 p-4 backdrop-blur-[2px]">
        <div className="w-full max-w-[560px] overflow-hidden rounded-[22px] border border-[#DCE4EF] bg-white shadow-[0_30px_80px_rgba(15,23,42,0.22)]">
          <div className="flex items-center justify-between border-b border-[#E7EDF5] px-5 py-4">
            <h2 className="text-[15px] font-black tracking-tight text-[#0F172A] font-poppins">Search Customer</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-full text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]"
              aria-label="Close customer selection"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-5 px-5 py-5">
            <div className="flex h-10 items-center gap-2 rounded-xl border border-[#DCE4EF] bg-[#F8FAFC] px-3">
              <Search size={16} className="text-[#64748B]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Search by name, phone, or email..."
                className="w-full bg-transparent text-[14px] text-[#0F172A] outline-none placeholder:text-[#94A3B8]"
              />
            </div>

            <div className="max-h-[300px] space-y-2.5 overflow-y-auto pr-1">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={index}
                    className="h-[74px] animate-pulse rounded-2xl border border-[#E7EDF5] bg-[#F8FAFC]"
                  />
                ))
              ) : filteredCustomers.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#D7E1EE] bg-[#F8FAFC] px-5 py-10 text-center">
                  <p className="text-[15px] font-bold text-[#0F172A]">No customer found</p>
                  <p className="mt-1 text-[13px] text-[#64748B]">Try another name, phone number, or email.</p>
                </div>
              ) : (
                filteredCustomers.map((customer, index) => {
                  const name = getCustomerName(customer)
                  const phone = getCustomerPhone(customer)
                  const email = getCustomerEmail(customer)
                  const toneClass = AVATAR_TONES[index % AVATAR_TONES.length]

                  return (
                    <div
                      key={customer?.id || `${name}-${phone}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-2xl border border-[#E7EDF5] bg-white px-4 py-3 shadow-[0_6px_20px_rgba(148,163,184,0.08)]"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[14px] font-black ${toneClass}`}>
                          {getInitials(name)}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[14px] font-bold text-[#0F172A]">{name}</p>
                          <p className="truncate text-[13px] text-[#64748B]">{phone}</p>
                          {email ? <p className="truncate text-[12px] text-[#94A3B8]">{email}</p> : null}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onSelect?.(customer)}
                        className="h-10 shrink-0 rounded-xl bg-[#1EA7EE] px-4 text-[13px] font-black text-white transition hover:bg-[#0EA5E9]"
                      >
                        Select
                      </button>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[#E7EDF5] bg-[#FBFCFE] px-5 py-5">
            <p className="text-[13px] text-[#64748B]">Can&apos;t find the customer?</p>
            <button
              type="button"
              onClick={handleOpenAddCustomer}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#DCE4EF] bg-white px-4 text-[14px] font-black text-[#0F172A] transition hover:bg-[#F8FAFC]"
            >
              <UserPlus size={16} />
              Add New Customer
            </button>
          </div>
        </div>
      </div>

      <AddCustomerQuickModal
        isOpen={isAddCustomerOpen}
        onClose={() => setIsAddCustomerOpen(false)}
        onSuccess={handleCustomerCreated}
      />
    </>
  )
}

export default CustomerSelectModal
