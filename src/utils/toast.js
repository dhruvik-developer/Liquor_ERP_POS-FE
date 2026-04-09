export const APP_TOAST_EVENT = 'app-toast'

const dispatchToast = (detail) => {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(APP_TOAST_EVENT, { detail }))
}

export const showToast = ({
  title,
  message,
  type = 'info',
  duration = 3500,
}) => {
  dispatchToast({ title, message, type, duration })
}

export const showErrorToast = (
  message = 'This action is not allowed for demo.',
  title = 'Something Went wrong!'
) => {
  showToast({ title, message, type: 'error' })
}

export const showSuccessToast = (message = 'Saved successfully!') => {
  showToast({ title: 'Success', message, type: 'success' })
}

export const extractErrorMessage = (error, fallback = 'This action is not allowed for demo.') => {
  const data = error?.response?.data
  if (typeof data?.message === 'string' && data.message.trim()) return data.message
  if (typeof data?.detail === 'string' && data.detail.trim()) return data.detail
  if (Array.isArray(data?.non_field_errors) && data.non_field_errors.length > 0) {
    return `${data.non_field_errors[0]}`
  }
  if (typeof error?.message === 'string' && error.message.trim()) return error.message
  return fallback
}
