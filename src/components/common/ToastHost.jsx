import React, { useCallback, useEffect, useState } from 'react'
import Toast from './Toast'
import { APP_TOAST_EVENT } from '../../utils/toast'

const ToastHost = () => {
  const [toasts, setToasts] = useState([])

  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  useEffect(() => {
    const handleToast = (event) => {
      const { title, message, type = 'info', duration = 3500 } = event.detail || {}
      if (!message) return

      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
      setToasts((prev) => [...prev, { id, title, message, type, duration }])
    }

    window.addEventListener(APP_TOAST_EVENT, handleToast)
    return () => window.removeEventListener(APP_TOAST_EVENT, handleToast)
  }, [])

  return (
    <div className="fixed top-6 right-6 z-[400] flex flex-col gap-3 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            title={toast.title}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={() => closeToast(toast.id)}
          />
        </div>
      ))}
    </div>
  )
}

export default ToastHost
