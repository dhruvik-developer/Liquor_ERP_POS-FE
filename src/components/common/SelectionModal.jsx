import React, { useState, useMemo } from 'react'
import { X, Search, CheckCircle2, ChevronUp, ChevronDown, Keyboard, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import QuickAddModal from './QuickAddModal'

const SelectionModal = ({ isOpen, onClose, title, data = [], onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false)
  const itemsPerPage = 10

  const filteredData = useMemo(() => {
    return data.filter(item => {
      const name = (typeof item === 'object' ? item.name : item).toLowerCase()
      return name.includes(searchQuery.toLowerCase())
    })
  }, [data, searchQuery])

  const totalPages = Math.ceil((filteredData.length + 1) / itemsPerPage)

  const displayItems = useMemo(() => {
    const allItems = ['<-Add New->', ...filteredData]
    const start = (currentPage - 1) * itemsPerPage
    return allItems.slice(start, start + itemsPerPage)
  }, [filteredData, currentPage])

  if (!isOpen) return null

  const handleSelect = (item) => {
    if (item === '<-Add New->') {
      setIsQuickAddOpen(true)
    } else {
      onSelect?.(item)
      onClose()
    }
  }

  const moveSelection = (direction) => {
    setSelectedIndex(prev => {
      const next = prev + direction
      if (next >= 0 && next < displayItems.length) return next
      return prev
    })
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 overflow-auto">
      <div className="w-full max-w-4xl bg-[#f0f4f8] rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200 relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800 font-poppins">{title}</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="flex flex-1 p-6 gap-6 overflow-hidden">
          {/* Main Content Area */}
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            
            {/* Search Section */}
            <div className="flex gap-3">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  placeholder="Search Value"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 outline-none transition-all focus:border-sky-500 focus:ring-4 focus:ring-sky-500/10"
                />
                <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
              </div>
              <button className="h-11 px-6 rounded-xl bg-sky-500 text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:bg-sky-600 transition-all active:scale-95">
                <Search size={16} />
                Search
              </button>
            </div>

            {/* List Section */}
            <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-1 divide-y divide-slate-100 scrollbar-hide">
                {displayItems.map((item, index) => {
                  const isSelected = selectedIndex === index
                  const isAddNew = item === '<-Add New->'
                  return (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedIndex(index)
                        handleSelect(item)
                      }}
                      className={`px-5 py-3.5 cursor-pointer text-sm font-bold transition-all flex items-center justify-between ${
                        isSelected 
                          ? 'bg-sky-50 text-sky-600 shadow-[inset_4px_0_0_#0EA5E9]' 
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <span className={isAddNew ? 'text-sky-500' : ''}>
                          {typeof item === 'object' ? item.name : item}
                        </span>
                      </div>
                      {typeof item === 'object' && item.subText && (
                        <span className={`text-[10px] uppercase font-black tracking-widest ${isSelected ? 'text-sky-500' : 'text-slate-400'}`}>
                          {item.subText}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Pagination footer */}
            <div className="flex items-center justify-between px-2 pt-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center gap-2"
              >
                <ChevronLeft size={14} />
                Prev
              </button>
              <div className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                Page {currentPage} of {totalPages || 1}
              </div>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="h-9 px-4 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={14} />
                </button>
                <div className="flex items-center gap-2 ml-4">
                  <span className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Goto Page</span>
                  <input
                    type="text"
                    defaultValue={currentPage}
                    className="w-10 h-9 rounded-lg border border-slate-200 bg-white text-center text-xs font-black text-slate-700 focus:border-sky-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const page = parseInt(e.target.value)
                        if (page > 0 && page <= totalPages) setCurrentPage(page)
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Action Panel */}
          <div className="w-[110px] flex flex-col gap-3">
             <button 
               onClick={() => handleSelect(displayItems[selectedIndex])}
               className="w-full flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-sky-500/20 bg-white text-sky-500 hover:bg-sky-50 transition-all shadow-sm active:scale-95 group font-inter"
             >
                <div className="w-10 h-10 rounded-full bg-sky-500 text-white flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:scale-110 transition-transform">
                   <CheckCircle2 size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Select</span>
             </button>

             <button 
               onClick={() => moveSelection(-1)}
               className="w-full flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
             >
                <ChevronUp size={24} className="group-hover:-translate-y-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Up</span>
             </button>

             <button 
               onClick={() => moveSelection(1)}
               className="w-full flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95 group"
             >
                <ChevronDown size={24} className="group-hover:translate-y-1 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Down</span>
             </button>

             <button className="w-full flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-slate-100 bg-white text-slate-500 hover:bg-slate-50 transition-all shadow-sm active:scale-95 group">
                <Keyboard size={24} className="group-hover:scale-110 transition-transform" />
                <span className="text-[10px] font-black uppercase tracking-widest">Keys</span>
             </button>

             <button 
               onClick={onClose}
               className="w-full flex flex-col items-center justify-center gap-2 py-4 rounded-xl border border-red-500/10 bg-white text-red-500 hover:bg-red-50 transition-all shadow-sm active:scale-95 group"
             >
                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                   <XCircle size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">Close</span>
             </button>
          </div>
        </div>

        {/* Quick Add Modal Overlay */}
        <QuickAddModal 
          isOpen={isQuickAddOpen}
          type={title}
          onClose={() => setIsQuickAddOpen(false)}
          onSave={(data) => {
            console.log('Saved new entry:', data)
            // Mock save logic
            setIsQuickAddOpen(false)
          }}
        />
      </div>
    </div>
  )
}

export default SelectionModal
