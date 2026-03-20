import React from 'react';

const ResponsiveTable = ({ headers, data, renderRow, emptyMessage = 'No data available' }) => {
  return (
    <div className="w-full overflow-x-auto scrollbar-hide rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-left border-collapse min-w-[800px]">
         <thead className="bg-[#F8FAFC] border-b border-slate-100">
            <tr>
               {headers.map((header, idx) => (
                 <th key={idx} className={`px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap ${header.className || ''}`}>
                    {header.label}
                 </th>
               ))}
            </tr>
         </thead>
         <tbody className="divide-y divide-slate-50">
            {data.length > 0 ? (
               data.map((row, idx) => renderRow(row, idx))
            ) : (
               <tr>
                  <td colSpan={headers.length} className="px-6 py-12 text-center text-sm font-bold text-slate-400">
                     {emptyMessage}
                  </td>
               </tr>
            )}
         </tbody>
      </table>
    </div>
  );
};

export default ResponsiveTable;
