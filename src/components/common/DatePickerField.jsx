import React, { useState, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar } from 'lucide-react';
import { parseISO, format } from 'date-fns';

const DatePickerField = ({ 
  label, 
  value, 
  onChange, 
  placeholder = 'Select date (MM/DD/YYYY)',
  required = false,
  error,
  className = '',
  wrapperClassName = '',
  minDate,
  maxDate,
  disabled = false
}) => {
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (value) {
      if (typeof value === 'string') {
        try {
          const parsed = parseISO(value);
          setSelectedDate(isNaN(parsed) ? new Date(value) : parsed);
        } catch (e) {
          setSelectedDate(null);
        }
      } else {
        setSelectedDate(value);
      }
    } else {
      setSelectedDate(null);
    }
  }, [value]);

  const handleChange = (date) => {
    setSelectedDate(date);
    if (onChange) {
      onChange(date ? format(date, 'yyyy-MM-dd') : null);
    }
  };

  return (
    <div className={`space-y-1.5 flex flex-col min-w-0 ${wrapperClassName}`}>
      {label && (
        <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 truncate">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative group w-full z-10">
         <ReactDatePicker
            selected={selectedDate}
            onChange={handleChange}
            placeholderText={placeholder}
            dateFormat="MM/dd/yyyy"
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            className={`
              w-full h-11 px-4 pr-10 rounded-xl border border-slate-200 
              bg-slate-50 text-[14px] font-bold text-slate-700 
              outline-none focus:border-sky-500 focus:bg-white focus:ring-4 focus:ring-sky-500/10 
              transition-all shadow-inner 
              placeholder:text-slate-400 placeholder:font-medium
              ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}
              ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-50' : ''}
              ${className}
            `}
            wrapperClassName="w-full block"
            popperClassName="!z-[9999]"
         />
         <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-sky-500 transition-colors">
            <Calendar size={16} />
         </div>
      </div>
      {error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{error}</p>}
    </div>
  );
};

export default DatePickerField;
