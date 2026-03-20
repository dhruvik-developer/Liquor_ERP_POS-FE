import React from 'react';

const FormWrapper = ({ children, title, description, actions, className = '' }) => {
  return (
    <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-5 md:p-8 w-full flex flex-col">
       {(title || actions) && (
         <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
               {title && <h2 className="text-[18px] font-bold text-slate-800 tracking-tight">{title}</h2>}
               {description && <p className="text-[12px] font-bold text-slate-400 mt-1">{description}</p>}
            </div>
            {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
         </div>
       )}
       <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-6 gap-y-4 md:gap-y-6 ${className}`}>
         {children}
       </div>
    </div>
  );
};

export default FormWrapper;
