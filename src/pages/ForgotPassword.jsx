import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { KeyRound, Mail, ArrowLeft } from 'lucide-react'
import Loader from '../components/common/Loader'
import Button from '../components/common/Button'
import Input from '../components/common/Input'

const ForgotPassword = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setIsSent(true)
    }, 1500)
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
          <p className="mt-2 text-[15px] text-[#64748B]">Please enter your email to receive recovery instructions.</p>
        </div>

        {isSent ? (
          <div className="text-center space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-lg text-emerald-600 text-[14px] font-bold">
               Instruction packet dispatched to {email}
            </div>
            <Button className="w-full h-12" onClick={() => navigate('/login')}>
              Return to Login
            </Button>
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input 
              label="Operator Email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your registered email"
              icon={Mail}
              iconPosition="right"
              required
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-[46px] text-[15px] font-medium gap-3 mt-4 rounded-lg"
            >
              {isLoading ? <Loader size={20} className="text-white" /> : null}
              <span>{isLoading ? 'Processing...' : 'Send Recovery Packet'}</span>
            </Button>

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
