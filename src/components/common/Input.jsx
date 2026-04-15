import React, { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { getAutoClearZeroInputProps } from '../../utils/zeroValueInput'

const Input = ({
  label,
  icon: Icon,
  iconPosition = 'left',
  rightElement,
  enablePasswordToggle,
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
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  const shouldShowPasswordToggle = enablePasswordToggle ?? type === 'password'
  const effectiveType = shouldShowPasswordToggle && isPasswordVisible ? 'text' : type
  const effectiveIconPosition = shouldShowPasswordToggle && iconPosition === 'right'
    ? 'left'
    : iconPosition
  const effectiveRightElement = rightElement ?? (
    shouldShowPasswordToggle ? (
      <button
        type="button"
        onClick={() => setIsPasswordVisible(current => !current)}
        className="text-[#94A3B8] transition-colors hover:text-[#0EA5E9] focus:outline-none"
        aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
      >
        {isPasswordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    ) : null
  )

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label className="text-[14px] font-medium text-[#1E293B] ml-0.5">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && effectiveIconPosition === 'left' && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0EA5E9] transition-colors">
            <Icon size={18} />
          </div>
        )}
        {!effectiveRightElement && Icon && effectiveIconPosition === 'right' && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] group-focus-within:text-[#0EA5E9] transition-colors text-xl font-light">
            <Icon size={18} />
          </div>
        )}
        {effectiveRightElement ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {effectiveRightElement}
          </div>
        ) : null}
        <input
          type={effectiveType}
          inputMode={inputMode}
          value={value}
          defaultValue={defaultValue}
          className={`
            w-full h-11 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC]
            ${Icon && effectiveIconPosition === 'left' ? 'pl-10' : 'pl-4'} 
            ${(Icon && effectiveIconPosition === 'right') || effectiveRightElement ? 'pr-10' : 'pr-4'} 
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
