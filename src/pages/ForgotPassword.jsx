import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion as Motion } from 'framer-motion'
import { KeyRound, Mail, ArrowLeft, Loader2 } from 'lucide-react'
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
        className="w-full max-w-md bg-white rounded-lg border border-[#E2E8F0] shadow-2xl p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1.5 bg-[#0EA5E9]"></div>
        
        <div className="mb-10 text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-lg bg-[#0EA5E90D] border border-[#0EA5E91A] text-[#0EA5E9]">
            <KeyRound size={32} />
          </div>
          <h1 className="text-[28px] font-black tracking-tight text-[#1E293B]">Reset Access</h1>
          <p className="mt-2 text-[14px] font-bold text-[#64748B] uppercase tracking-wider">Authentication Protocol</p>
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
            <p className="text-[14px] font-medium text-[#64748B] text-center leading-relaxed">
              Enter your registered operator email to receive access recovery instructions.
            </p>
            <Input 
              label="Operator Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              icon={Mail}
              required
            />

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-14 text-[14px] gap-3"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>{isLoading ? 'Processing...' : 'Send Recovery Packet'}</span>
            </Button>

            <Link
              to="/login"
              className="flex items-center justify-center gap-2 text-[12px] font-bold uppercase tracking-wider text-[#94A3B8] hover:text-[#0EA5E9] transition-colors"
            >
              <ArrowLeft size={14} />
              Return to Login
            </Link>
          </form>
        )}

        <p className="mt-12 text-center text-[11px] font-bold uppercase tracking-widest text-[#94A3B8]">
          © 2026 Liquor POS ERP. SECURE SYSTEM.
        </p>
      </Motion.div>
    </div>
  )
}

export default ForgotPassword
