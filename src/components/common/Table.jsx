import React from 'react'

const Table = ({ headers, data, onRowClick, className = '' }) => {
  return (
    <div className={`overflow-hidden rounded-lg border border-[#E2E8F0] bg-white ${className}`}>
      <table className="w-full text-left text-[14px]">
        <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
          <tr>
            {headers.map((header, idx) => (
              <th 
                key={idx} 
                className="px-6 py-4 font-medium text-[#64748B] uppercase tracking-wider text-[12px]"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0]">
          {data.map((row, rowIdx) => (
            <tr 
              key={rowIdx}
              onClick={() => onRowClick && onRowClick(row)}
              className={`
                transition-colors 
                ${onRowClick ? 'cursor-pointer hover:bg-[#F8FAFC]' : ''}
                group
              `}
            >
              {Object.values(row).map((cell, cellIdx) => (
                <td key={cellIdx} className="px-6 py-4 font-medium text-[#1E293B]">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default Table
