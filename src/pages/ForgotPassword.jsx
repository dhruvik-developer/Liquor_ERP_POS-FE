import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { KeyRound, Mail, ArrowLeft, Lock } from 'lucide-react'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import Input from '../components/common/Input'
import { postJson } from '../services/http'
import { showSuccessToast } from '../utils/toast'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [formValues, setFormValues] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [isAdminVerified, setIsAdminVerified] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')

  const handleChange = event => {
    const { name, value } = event.target
    setFormValues(current => ({ ...current, [name]: value }))
    setFieldErrors(current => ({ ...current, [name]: '' }))
    setStatusMessage('')
  }

  const validateEmailStep = () => {
    const errors = {}
    if (!formValues.email.trim()) {
      errors.email = 'Email is required'
    }
    return errors
  }

  const validatePasswordStep = () => {
    const errors = {}

    if (!formValues.newPassword.trim()) {
      errors.newPassword = 'New password is required'
    }

    if (!formValues.confirmPassword.trim()) {
      errors.confirmPassword = 'Confirm password is required'
    } else if (formValues.newPassword !== formValues.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match'
    }

    return errors
  }

  const handleAdminCheck = async event => {
    event.preventDefault()
    const errors = validateEmailStep()
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await postJson('/auth/forgot-password/check-admin/', {
        email: formValues.email.trim(),
      })

      if (response?.status && response?.data?.is_admin) {
        setIsAdminVerified(true)
        setStatusMessage(response.message || 'Admin verified. You can reset the password now.')
        return
      }

      setIsAdminVerified(false)
      setStatusMessage(
        response?.message || 'You do not have access to forgot password. Only admin users can continue.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async event => {
    event.preventDefault()
    const errors = {
      ...validateEmailStep(),
      ...validatePasswordStep(),
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    setStatusMessage('')

    try {
      const response = await postJson('/auth/forgot-password/', {
        email: formValues.email.trim(),
        new_password: formValues.newPassword,
        confirm_password: formValues.confirmPassword,
      })

      if (response?.status === false) {
        setStatusMessage(response.message || 'Unable to reset password right now.')
        return
      }

      showSuccessToast(response?.message || 'Password reset successfully.')
      setIsSent(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUseDifferentEmail = () => {
    setIsAdminVerified(false)
    setFieldErrors({})
    setStatusMessage('')
    setFormValues(current => ({
      ...current,
      newPassword: '',
      confirmPassword: '',
    }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-[420px] bg-white rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-10 relative overflow-hidden"
      >
        
        <div className="mb-8 text-center">
          <div className="mx-auto mb-6 flex h-[84px] w-[84px] items-center justify-center rounded-full bg-[#E0F2FE] text-[#0EA5E9]">
            <KeyRound size={36} />
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight text-[#111827]">Reset Access</h1>
          <p className="mt-2 text-[15px] text-[#64748B]">
            {isAdminVerified
              ? 'Admin verified. Please enter your new password to continue.'
              : 'Please enter your email to receive recovery instructions.'}
          </p>
        </div>

        {isSent ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-[14px] font-bold">
              Password reset completed for {formValues.email}
            </div>
            <Button className="w-full h-12" onClick={() => navigate('/login')}>
              Return to Login
            </Button>
          </div>
        ) : (
          <form
            className="space-y-6"
            onSubmit={isAdminVerified ? handleResetPassword : handleAdminCheck}
          >
            <Input
              label="Operator Email"
              name="email"
              type="text"
              value={formValues.email}
              onChange={handleChange}
              placeholder="Enter your registered email"
              icon={Mail}
              iconPosition="right"
              error={fieldErrors.email}
              readOnly={isAdminVerified}
              required
            />

            {isAdminVerified ? (
              <>
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formValues.newPassword}
                  onChange={handleChange}
                  placeholder="Enter your new password"
                  icon={Lock}
                  error={fieldErrors.newPassword}
                  required
                />

                <Input
                  label="Confirm Password"
                  name="confirmPassword"
                  type="password"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your new password"
                  icon={Lock}
                  error={fieldErrors.confirmPassword}
                  required
                />
              </>
            ) : null}

            {statusMessage ? (
              <div
                className={`rounded-lg border px-4 py-3 text-[13px] font-bold ${
                  isAdminVerified
                    ? 'border-emerald-100 bg-emerald-50 text-emerald-600'
                    : 'border-rose-100 bg-rose-50 text-rose-600'
                }`}
              >
                {statusMessage}
              </div>
            ) : null}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-[46px] text-[15px] font-medium gap-3 mt-4 rounded-lg"
            >
              {isLoading ? <Loader size={20} className="text-white" /> : null}
              <span>
                {isLoading
                  ? 'Processing...'
                  : isAdminVerified
                    ? 'Reset Password'
                    : 'Send Recovery Packet'}
              </span>
            </Button>

            {isAdminVerified ? (
              <button
                type="button"
                onClick={handleUseDifferentEmail}
                className="w-full text-[14px] text-[#0EA5E9] hover:underline underline-offset-4"
              >
                Use Different Email
              </button>
            ) : null}

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-[14px] text-[#64748B] hover:text-[#0EA5E9] transition-colors mt-6"
            >
              <ArrowLeft size={16} />
              Return to Login
            </Link>
          </form>
        )}

        <p className="mt-8 text-center text-[14px] text-[#64748B]">
          &copy; {new Date().getFullYear()} Liquor POS. All Rights Reserved.
        </p>
      </Motion.div>
    </div>
  )
}

export default ForgotPassword
