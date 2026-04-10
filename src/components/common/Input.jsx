import React from 'react'
import { getAutoClearZeroInputProps } from '../../utils/zeroValueInput'

const Input = ({
  label,
  icon: Icon,
  iconPosition = 'left',
  error,
  className = '',
  clearZeroDefault,
  type,
  inputMode,
  value,
  defaultValue,
  onFocus,
  onMouseUp,
  ...props
}) => {
  const shouldAutoClearZero =
    clearZeroDefault ??
    (
      type === 'number' ||
      inputMode === 'numeric' ||
      inputMode === 'decimal'
    )

  const autoClearZeroInputProps = shouldAutoClearZero
    ? getAutoClearZeroInputProps(value ?? defaultValue, { onFocus, onMouseUp })
    : { onFocus, onMouseUp }

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && iconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0EA5E9] transition-colors">
            <Icon size={18} />
          </div>
        )}
        {Icon && iconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0EA5E9] transition-colors text-xl font-light">
            <Icon size={18} />
          </div>
        )}
        <input
          type={type}
          inputMode={inputMode}
          value={value}
          defaultValue={defaultValue}
          className={`
            w-full h-11 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]
            ${Icon && iconPosition === 'left' ? 'pl-10' : 'pl-4'} 
            ${Icon && iconPosition === 'right' ? 'pr-10' : 'pr-4'} 
            text-[14px] font-medium text-[#1E293B] 
            outline-none transition-all
            focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#0EA5E91A]
            placeholder:text-[#94A3B8]
            ${error ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-50' : ''}
            ${className}
          `}
          {...autoClearZeroInputProps}
          {...props}
        />
      </div>
      {error && <p className="text-[12px] text-rose-500 ml-1">{error}</p>}
    </div>
  )
}

export default Input
