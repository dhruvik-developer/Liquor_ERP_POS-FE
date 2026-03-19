import React from 'react'
import { Search, X, Calendar } from 'lucide-react'
import Button from '../common/Button'
import Input from '../common/Input'
import Card from '../common/Card'

const CashDrawerPage = () => {
  const shifts = [
    { 
      id: 1, 
      cashier: 'Jon Doe', 
      start: '26-Nov-25 09:41 PM', 
      end: '26-Nov-25 11:41 PM', 
      opening: '183.29', 
      closing: '200' 
    },
    { 
      id: 2, 
      cashier: 'Jane Doe', 
      start: '27-Nov-25 09:40 PM', 
      end: '27-Nov-25 11:40 PM', 
      opening: '25.73', 
      closing: '300' 
    }
  ]

  return (
    <div className="flex flex-col h-full space-y-6 animate-in fade-in duration-500 overflow-auto pb-8 pr-2">
      
      {/* Date Range Filter Section */}
      <Card title="Date Range Filter">
        <div className="flex items-center gap-6 mt-2">
          <Input 
            label="Start Date"
            defaultValue="11/26/2025"
            icon={Calendar}
            className="flex-1"
          />
          <Input 
            label="End Date"
            defaultValue="11/26/2025"
            icon={Calendar}
            className="flex-1"
          />

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <Button className="gap-2 px-8">
              <Search size={18} />
              Search
            </Button>
            <Button variant="outline" className="gap-2 px-6">
              <X size={18} />
              Clear
            </Button>
          </div>
        </div>
      </Card>

      {/* Shifts Table Section */}
      <div className="flex-1 bg-white rounded-lg border border-[#E2E8F0] shadow-sm flex flex-col overflow-hidden min-h-[500px]">
        <div className="overflow-auto bg-white flex-1">
          <table className="w-full text-left border-collapse text-[14px]">
            <thead className="sticky top-0 z-10 bg-[#F8FAFC] border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Shift ID</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Cashier Name</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Shift Start</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap">Shift End</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Opening</th>
                <th className="px-6 py-4 text-[12px] font-bold text-[#64748B] uppercase tracking-wider whitespace-nowrap text-center">Closing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {shifts.map((shift, idx) => (
                <tr key={idx} className="hover:bg-[#F8FAFC] transition-colors group">
                  <td className="px-6 py-4 font-bold text-[#0EA5E9] hover:underline cursor-pointer">{shift.id}</td>
                  <td className="px-6 py-4 font-bold text-[#1E293B]">{shift.cashier}</td>
                  <td className="px-6 py-4 font-medium text-[#64748B] whitespace-nowrap text-[13px]">{shift.start}</td>
                  <td className="px-6 py-4 font-medium text-[#64748B] whitespace-nowrap text-[13px]">{shift.end}</td>
                  <td className="px-6 py-4 font-bold text-[#1E293B] text-center tracking-tight">${shift.opening}</td>
                  <td className="px-6 py-4 font-bold text-[#1E293B] text-center tracking-tight">${shift.closing}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {shifts.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center py-24 text-[#94A3B8] italic gap-4">
               <div className="h-16 w-16 bg-[#F8FAFC] rounded-full flex items-center justify-center text-[#E2E8F0]">
                  <Calendar size={32} />
               </div>
               <p className="text-[14px] font-bold uppercase tracking-wider">No shift records found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CashDrawerPage
