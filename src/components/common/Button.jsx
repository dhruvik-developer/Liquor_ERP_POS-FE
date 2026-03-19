import React from 'react'

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-lg font-medium transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-[14px]'
  
  const variants = {
    primary: 'bg-[#0EA5E9] text-white hover:bg-[#38BDF8] shadow-sm',
    secondary: 'bg-[#F1F5F9] text-[#64748B] hover:bg-[#E2E8F0]',
    outline: 'border border-[#E2E8F0] bg-white text-[#1E293B] hover:bg-[#F8FAFC]',
    ghost: 'text-[#64748B] hover:bg-[#F8FAFC]',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-sm'
  }
  
  const sizes = {
    sm: 'h-8 px-3',
    md: 'h-10 px-4',
    lg: 'h-12 px-6 text-[16px]'
  }

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
