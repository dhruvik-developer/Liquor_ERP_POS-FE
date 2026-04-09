import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'

const getOptionLabel = (children) => {
  if (typeof children === 'string' || typeof children === 'number') return String(children)
  if (Array.isArray(children)) {
    return children
      .map((child) => (typeof child === 'string' || typeof child === 'number' ? String(child) : ''))
      .join('')
      .trim()
  }
  return ''
}

const StyledDropdown = ({
  value = '',
  onChange,
  name,
  children,
  disabled = false,
  className = '',
  menuClassName = '',
  optionClassName = '',
  triggerClassName = '',
  placeholder = 'Select option...',
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [menuPlacement, setMenuPlacement] = useState('bottom')
  const [menuMaxHeight, setMenuMaxHeight] = useState(300)
  const dropdownRef = useRef(null)

  const options = useMemo(() => {
    return React.Children.toArray(children)
      .filter((child) => React.isValidElement(child) && (child.type === 'option' || child.type === 'Option'))
      .map((option, index) => ({
        key: option.key || `${name || 'dropdown'}-${index}`,
        value: option.props.value ?? getOptionLabel(option.props.children),
        label: getOptionLabel(option.props.children),
        disabled: Boolean(option.props.disabled),
      }))
  }, [children, name])

  const selectedOption = useMemo(() => {
    return options.find((option) => String(option.value) === String(value))
  }, [options, value])

  const displayLabel = selectedOption ? selectedOption.label : placeholder

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    const handleEscape = (event) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    const updateMenuPosition = () => {
      if (!dropdownRef.current) return
      const rect = dropdownRef.current.getBoundingClientRect()
      const viewportPadding = 12
      const menuGap = 8
      const minPreferredSpace = 180

      const spaceBelow = window.innerHeight - rect.bottom - viewportPadding
      const spaceAbove = rect.top - viewportPadding

      const shouldOpenUp = spaceBelow < minPreferredSpace && spaceAbove > spaceBelow
      const nextPlacement = shouldOpenUp ? 'top' : 'bottom'
      const availableSpace = shouldOpenUp ? spaceAbove : spaceBelow
      const nextMaxHeight = Math.max(120, Math.min(300, availableSpace - menuGap))

      setMenuPlacement(nextPlacement)
      setMenuMaxHeight(nextMaxHeight)
    }

    updateMenuPosition()
    window.addEventListener('resize', updateMenuPosition)
    window.addEventListener('scroll', updateMenuPosition, true)

    return () => {
      window.removeEventListener('resize', updateMenuPosition)
      window.removeEventListener('scroll', updateMenuPosition, true)
    }
  }, [isOpen])

  const handleSelect = (nextValue) => {
    if (disabled) return
    onChange?.({
      target: {
        name,
        value: nextValue,
      },
    })
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((current) => !current)}
        className={`w-full h-11 rounded-xl border border-[#0EA5E9] bg-white px-4 text-left text-[14px] font-bold text-[#0F172A] outline-none transition-all shadow-[inset_0_1px_0_#ffffff] ${
          disabled ? 'cursor-not-allowed opacity-60' : 'hover:border-[#0284C7]'
        } ${isOpen ? 'ring-4 ring-[#0EA5E91A]' : ''} ${triggerClassName}`}
      >
        <span className={`block truncate pr-8 ${!selectedOption ? 'text-slate-400' : ''}`}>
          {displayLabel}
        </span>
        <ChevronDown
          size={16}
          className={`pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute left-0 right-0 z-[70] overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl shadow-slate-900/10 ${
            menuPlacement === 'top' ? 'bottom-[calc(100%+8px)]' : 'top-[calc(100%+8px)]'
          } ${menuClassName}`}
        >
          <div className="py-2 overflow-y-auto scrollbar-hide" style={{ maxHeight: `${menuMaxHeight}px` }}>
            {options.map((option) => {
              const isSelected = String(option.value) === String(value)
              return (
                <button
                  key={option.key}
                  type="button"
                  disabled={option.disabled}
                  onClick={() => handleSelect(option.value)}
                  className={`flex w-full items-center justify-between px-4 py-3 text-left text-[14px] font-bold transition-colors ${
                    option.disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  } ${
                    isSelected
                      ? 'bg-[#EAF3FB] text-[#0284C7]'
                      : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                  } ${optionClassName}`}
                >
                  <span className="truncate pr-4">{option.label}</span>
                  {isSelected && <Check size={16} className="text-[#0EA5E9]" />}
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default StyledDropdown
