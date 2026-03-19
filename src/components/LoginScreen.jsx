import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { Wine, User, Shield, Lock, Mail, Loader2 } from 'lucide-react'
import Button from './common/Button'
import Input from './common/Input'

const roleConfig = {
  staff: {
    title: 'POS Terminal Login',
  },
  admin: {
    title: 'Admin Console Login',
  }
}

const LoginScreen = ({ type = 'staff' }) => {
  const navigate = useNavigate()
  const config = useMemo(() => roleConfig[type] || roleConfig.staff, [type])
  const [formValues, setFormValues] = useState({
    email: '',
    password: '',
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = event => {
    const { name, value } = event.target
    setFormValues(current => ({ ...current, [name]: value }))
    setFieldErrors(current => ({ ...current, [name]: '' }))
    setApiError('')
  }

  const validate = values => {
    const errors = {}
    if (!values.email.trim()) errors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) errors.email = 'Invalid email format'
    if (!values.password.trim()) errors.password = 'Password is required'
    return errors
  }

  const handleSubmit = async event => {
    event.preventDefault()
    const errors = validate(formValues)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setIsLoading(true)
    // Simulating login for UI demonstration
    setTimeout(() => {
      localStorage.setItem('auth_token', 'mock_token')
      localStorage.setItem('auth_user', JSON.stringify({ name: 'Admin User', role: 'admin', email: formValues.email }))
      navigate('/pos', { replace: true })
      setIsLoading(false)
    }, 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-6">
      <Motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-lg border border-[#E2E8F0] shadow-2xl p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0EA5E9]"></div>
        
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-[#0EA5E90D] border border-[#0EA5E91A] text-[#0EA5E9]">
            {type === 'admin' ? <Shield size={32} /> : <Wine size={32} />}
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-[#1E293B]">{config.title}</h1>
          <p className="mt-2 text-[14px] font-bold text-[#64748B] uppercase tracking-wider">Enterprise Access Protocol</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input 
            label="Operator Email"
            name="email"
            type="email"
            value={formValues.email}
            onChange={handleChange}
            placeholder="admin@example.com"
            icon={Mail}
            error={fieldErrors.email}
            required
          />

          <div className="space-y-1">
            <Input 
              label="Security Password"
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleChange}
              placeholder="••••••••"
              icon={Lock}
              error={fieldErrors.password}
              required
            />
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-[12px] font-bold uppercase tracking-wider text-[#0EA5E9] hover:underline underline-offset-4"
              >
                Reset Access?
              </Link>
            </div>
          </div>

          {apiError && (
            <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-600">
              {apiError}
            </div>
          )}

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-14 text-[14px] gap-3"
          >
            {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
            <span>{isLoading ? 'Decrypting...' : 'Initiate Login'}</span>
          </Button>
        </form>

        <p className="mt-12 text-center text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
          © 2026 Liquor POS ERP. SECURE SYSTEM.
        </p>
      </Motion.div>
    </div>
  )
}

export default LoginScreen
