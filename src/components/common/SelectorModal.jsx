import React, { useState, useEffect } from 'react'
import { 
  X, 
  Search, 
  CheckCircle2, 
  ChevronUp, 
  ChevronDown, 
  Keyboard, 
  XCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

const SelectorModal = ({ title, data = [], onSelect, onClose, onAddNew }) => {
  const [selectedIndex, setSelectedIndex] = useState(0) 
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  // Filter data based on search query
  const filteredData = data.filter(item => {
    const name = (typeof item === 'object' ? item.name : item).toLowerCase()
    return name.includes(searchQuery.toLowerCase())
  })

  const totalPages = Math.ceil((filteredData.length + 1) / itemsPerPage) || 1
  
  // Slice data for current page (keeping <Add New> at index 0 on page 1)
  const displayItems = currentPage === 1 
    ? ['<Add New>', ...filteredData.slice(0, itemsPerPage - 1)]
    : filteredData.slice((currentPage - 1) * itemsPerPage - 1, currentPage * itemsPerPage - 1)

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowUp') {
        setSelectedIndex(prev => Math.max(0, prev - 1))
      } else if (e.key === 'ArrowDown') {
        setSelectedIndex(prev => Math.min(displayItems.length - 1, prev + 1))
      } else if (e.key === 'Enter') {
        const selectedItem = displayItems[selectedIndex]
        if (selectedItem === '<Add New>') {
          onAddNew()
        } else if (selectedItem) {
          onSelect(selectedItem)
        }
      } else if (e.key === 'Escape') {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedIndex, displayItems, onSelect, onClose, onAddNew])

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-neutral-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-4xl flex flex-col overflow-hidden animate-in zoom-in duration-300 border border-neutral-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-5 border-b border-neutral-50 bg-neutral-50/30">
          <h2 className="text-xl font-black text-neutral-800 tracking-tight">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-neutral-100 rounded-full transition-all text-neutral-400 hover:text-rose-500 active:scale-95">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex flex-1 overflow-hidden p-8 gap-8">
          
          {/* List Content */}
          <div className="flex-1 flex flex-col gap-6">
            
            {/* Search Section */}
            <div className="flex gap-4">
              <div className="relative flex-1 group">
                <input
                  type="text"
                  placeholder="Search values..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1)
                    setSelectedIndex(0)
                  }}
                  className="w-full h-12 px-5 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-700 outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all font-inter"
                />
                <div className="absolute top-0 right-14 h-full flex items-center pointer-events-none">
                  <div className="h-6 w-px bg-neutral-100"></div>
                </div>
                <Search size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 group-focus-within:text-primary transition-colors" />
              </div>
              <button 
                onClick={onAddNew}
                className="bg-primary hover:bg-primary-medium text-white px-8 rounded-xl flex items-center gap-2 font-bold text-sm transition-all shadow-lg shadow-primary/20 active:scale-95"
              >
                <Plus size={18} />
                Create New
              </button>
            </div>

            {/* List Section */}
            <div className="flex-1 border border-neutral-100 rounded-2xl overflow-hidden bg-neutral-50/30 shadow-inner min-h-[400px]">
              <div className="divide-y divide-neutral-50">
                {displayItems.map((item, index) => {
                  const isSelected = selectedIndex === index
                  const isAddNew = item === '<Add New>'
                  
                  return (
                    <div
                      key={index}
                      onClick={() => setSelectedIndex(index)}
                      onDoubleClick={() => {
                        if (isAddNew) onAddNew()
                        else onSelect(item)
                      }}
                      className={`px-6 py-4 cursor-pointer transition-all flex items-center justify-between group ${
                        isSelected 
                          ? 'bg-primary-light text-primary font-black shadow-[inset_4px_0_0_#0EA5E9]' 
                          : 'hover:bg-white text-neutral-600'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {isAddNew ? (
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-primary text-white' : 'bg-primary-light text-primary'}`}>
                            <Plus size={14} />
                          </div>
                        ) : (
                          <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-primary animate-pulse' : 'bg-transparent'}`}></div>
                        )}
                        <span className="text-sm font-bold uppercase tracking-wide">
                          {item.name || (isAddNew ? 'Create New Entry' : item)}
                        </span>
                      </div>
                      {item.subText && (
                        <span className={`text-[10px] uppercase font-black tracking-widest ${isSelected ? 'text-primary' : 'text-neutral-400'}`}>
                          {item.subText}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
              {displayItems.length === 0 && (
                <div className="p-20 text-center flex flex-col items-center gap-4">
                  <div className="h-16 w-16 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-300">
                    <Search size={32} />
                  </div>
                  <p className="text-sm font-bold text-neutral-400 italic">No matching results found</p>
                </div>
              )}
            </div>

            {/* Pagination Section */}
            <div className="flex items-center justify-between pt-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="h-10 px-5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-all flex items-center gap-2 disabled:opacity-30 active:scale-95"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Page</span>
                <div className="flex items-center gap-1.5">
                  {[...Array(totalPages)].map((_, i) => (
                    <button 
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`h-8 w-8 rounded-lg text-xs font-black transition-all ${
                        currentPage === i + 1 
                          ? 'bg-primary text-white shadow-md' 
                          : 'bg-white border border-neutral-200 text-neutral-400 hover:border-primary hover:text-primary'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="h-10 px-5 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-500 hover:bg-neutral-50 hover:text-neutral-800 transition-all flex items-center gap-2 disabled:opacity-30 active:scale-95"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>

          </div>

          {/* Sidebar Action Panel */}
          <div className="w-[120px] flex flex-col gap-4">
            <ModalActionBtn 
              icon={<CheckCircle2 size={24} />} 
              label="Confirm" 
              color="text-emerald-500" 
              active={true}
              onClick={() => {
                const selectedItem = displayItems[selectedIndex]
                if (selectedItem === '<Add New>') onAddNew()
                else if (selectedItem) onSelect(selectedItem)
              }}
            />
            <ModalActionBtn 
              icon={<ChevronUp size={24} />} 
              label="Move Up" 
              onClick={() => setSelectedIndex(prev => Math.max(0, prev - 1))}
            />
            <ModalActionBtn 
              icon={<ChevronDown size={24} />} 
              label="Move Dn" 
              onClick={() => setSelectedIndex(prev => Math.min(displayItems.length - 1, prev + 1))}
            />
            <ModalActionBtn 
              icon={<Keyboard size={24} />} 
              label="Manual" 
            />
            <ModalActionBtn 
              icon={<XCircle size={24} />} 
              label="Cancel" 
              color="text-rose-500"
              onClick={onClose}
            />
          </div>

        </div>
      </div>
    </div>
  )
}

const ModalActionBtn = ({ icon, label, color = "text-neutral-400", active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full py-5 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all shadow-sm active:scale-95 ${
      active 
        ? 'bg-white border-primary ring-4 ring-primary/5' 
        : 'bg-white border-neutral-100 hover:bg-neutral-50 hover:border-neutral-200'
    }`}
  >
    <div className={`${active ? 'text-primary' : color} transition-colors animate-in zoom-in duration-300`}>{icon}</div>
    <span className="text-[9px] font-black uppercase tracking-widest text-neutral-500">{label}</span>
  </button>
)

export default SelectorModal
