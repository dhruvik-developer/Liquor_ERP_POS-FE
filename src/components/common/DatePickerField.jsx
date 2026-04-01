import React, { useState, useEffect } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
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

  const years = Array.from({ length: 151 }, (_, i) => new Date().getFullYear() + 20 - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className={`space-y-1.5 flex flex-col min-w-0 ${wrapperClassName}`}>
      {label && (
        <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}
      <div className="relative group w-full">
         <ReactDatePicker
            selected={selectedDate}
            onChange={handleChange}
            placeholderText={placeholder}
            dateFormat="MM/dd/yyyy"
            minDate={minDate}
            maxDate={maxDate}
            disabled={disabled}
            popperPlacement="bottom-start"
            renderCustomHeader={({
              date,
              changeYear,
              changeMonth,
              decreaseMonth,
              increaseMonth,
              prevMonthButtonDisabled,
              nextMonthButtonDisabled,
            }) => (
              <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-100 rounded-t-xl">
                <button
                  type="button"
                  onClick={decreaseMonth}
                  disabled={prevMonthButtonDisabled}
                  className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <ChevronLeft size={16} className="text-slate-600" />
                </button>
                
                <div className="flex gap-1.5">
                  <select
                    value={date.getFullYear()}
                    onChange={({ target: { value } }) => changeYear(parseInt(value))}
                    className="bg-transparent text-[13px] font-bold text-slate-800 outline-none cursor-pointer hover:text-[#0EA5E9] transition-colors"
                  >
                    {years.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>

                  <select
                    value={months[date.getMonth()]}
                    onChange={({ target: { value } }) => changeMonth(months.indexOf(value))}
                    className="bg-transparent text-[13px] font-bold text-slate-800 outline-none cursor-pointer hover:text-[#0EA5E9] transition-colors"
                  >
                    {months.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="button"
                  onClick={increaseMonth}
                  disabled={nextMonthButtonDisabled}
                  className="p-1.5 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <ChevronRight size={16} className="text-slate-600" />
                </button>
              </div>
            )}
            className={`
              w-full h-[38px] px-3 rounded-lg border border-[#E2E8F0] 
              bg-white text-[14px] font-medium text-[#1E293B] 
              outline-none transition-all
              focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E91A]
              placeholder:text-[#94A3B8]
              ${disabled ? 'opacity-60 cursor-not-allowed bg-slate-100' : ''}
              ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-50' : ''}
              ${className}
            `}
            wrapperClassName="w-full block"
            popperClassName="custom-datepicker-popper !z-[9999]"
            popperModifiers={[
              {
                name: 'preventOverflow',
                options: {
                  rootBoundary: 'viewport',
                },
              },
              {
                name: 'flip',
                options: {
                  fallbackPlacements: ['top-start', 'bottom-end'],
                },
              },
            ]}
         />
      </div>
      {error && <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest ml-1">{error}</p>}
    </div>
  );
};

export default DatePickerField;
