import { useMemo, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { User, Shield, Lock, Mail } from 'lucide-react'
import Loader from './common/Loader'
import Button from './common/Button'
import Input from './common/Input'
import loginIcon from '../assets/icon/login.png'
import api from '../services/api'
import { getDefaultRouteForRole } from '../utils/auth'

const roleConfig = {
  staff: {
    title: 'Login',
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
    if (!values.email.trim()) errors.email = 'Username or email is required'
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
    try {
      const response = await api.post('/auth/login/', {
        email: formValues.email,
        password: formValues.password
      })
      const responseData = response.data?.data
      const tokens = responseData?.tokens
      const accessToken = tokens?.access_token

      console.log('[Login]: Response received', response.data)
      
      if (accessToken) {
        console.log('[Login]: Access token extracted successfully')
        localStorage.setItem('access_token', accessToken)

        // Store user data if available and preserve a role fallback from selected login type.
        const apiUser = responseData?.user
        const userToStore = apiUser
          ? {
              ...apiUser,
              role: apiUser.role ?? apiUser.role_name ?? type,
            }
          : {
          name: 'Admin User',
          role: type,
          email: formValues.email
        }

        localStorage.setItem('auth_user', JSON.stringify(userToStore))

        const targetRoute = getDefaultRouteForRole(userToStore)
        navigate(targetRoute, { replace: true })
      } else {
        console.error('[Login]: Access token missing in response', response.data)
        setApiError('Authentication failed: Token not found in response.')
      }
    } catch (err) {
      setApiError(err?.response?.data?.message || err.message || 'Login request failed. Please check credentials.')
    } finally {
      setIsLoading(false)
    }
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
            {type === 'admin' ? <Shield size={36} /> : <img src={loginIcon} alt="Login" className="h-[46px] w-[46px] object-contain" />}
          </div>
          <h1 className="text-[32px] font-semibold tracking-tight text-[#111827]">{config.title}</h1>
          <p className="mt-2 text-[15px] text-[#64748B]">Please sign in to access the system.</p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <Input 
            label="Username or Email"
            name="email"
            type="text"
            value={formValues.email}
            onChange={handleChange}
            placeholder="Enter your username or email"
            icon={User}
            iconPosition="right"
            error={fieldErrors.email}
            required
          />

          <div className="space-y-1 mt-6">
            <Input 
              label="Password"
              name="password"
              type="password"
              value={formValues.password}
              onChange={handleChange}
              placeholder="Enter your password"
              icon={Lock}
              iconPosition="right"
              error={fieldErrors.password}
              required
            />
            <div className="flex justify-end pt-1">
              <Link
                to="/forgot-password"
                className="text-[13.5px] text-[#0EA5E9] hover:underline underline-offset-4"
              >
                Forgot Password?
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
            className="w-full h-[46px] text-[15px] font-medium gap-3 mt-4 rounded-lg"
          >
            {isLoading ? <Loader size={20} className="text-white" /> : null}
            <span>{isLoading ? 'Authenticating...' : 'Login'}</span>
          </Button>
        </form>

        <p className="mt-8 text-center text-[14px] text-[#64748B]">
          &copy; {new Date().getFullYear()} Liquor POS. All Rights Reserved.
        </p>
      </Motion.div>
    </div>
  )
}

export default LoginScreen
