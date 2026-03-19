import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion as Motion, AnimatePresence } from 'framer-motion'
import { getDefaultRouteForRole, getIsSuperAdmin, getStoredAuth } from '../utils/auth'

// ─── Martini Glass SVG Icon ─────────────────────────────────────────────────
const MartiniIcon = () => (
  <svg
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-12 h-12"
    aria-hidden="true"
  >
    {/* Glass rim */}
    <path
      d="M8 12 L32 38 L56 12 Z"
      stroke="white"
      strokeWidth="3"
      strokeLinejoin="round"
      fill="rgba(255,255,255,0.15)"
    />
    {/* Stem */}
    <line x1="32" y1="38" x2="32" y2="54" stroke="white" strokeWidth="3" strokeLinecap="round" />
    {/* Base */}
    <line x1="20" y1="54" x2="44" y2="54" stroke="white" strokeWidth="3" strokeLinecap="round" />
    {/* Olive on pick */}
    <circle cx="43" cy="18" r="4" fill="rgba(255,255,255,0.9)" />
    <line x1="43" y1="14" x2="43" y2="8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
    {/* Liquid surface shimmer line */}
    <line x1="17" y1="20" x2="47" y2="20" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
)

// ─── Animated Progress Bar ────────────────────────────────────────────────────
const ProgressBar = ({ progress }) => (
  <div
    className="w-full max-w-xs h-1 rounded-full overflow-hidden"
    style={{ background: 'rgba(59,130,246,0.15)' }}
    role="progressbar"
    aria-valuenow={progress}
    aria-valuemin={0}
    aria-valuemax={100}
  >
    <Motion.div
      className="h-full rounded-full"
      style={{
        background: 'linear-gradient(90deg, #2563eb, #60a5fa, #93c5fd, #2563eb)',
        backgroundSize: '200% 100%',
      }}
      initial={{ width: '0%' }}
      animate={{ width: `${progress}%` }}
      transition={{ ease: 'easeInOut', duration: 0.4 }}
    />
  </div>
)

// ─── Floating Particle ────────────────────────────────────────────────────────
const Particle = ({ style }) => (
  <Motion.div
    className="absolute rounded-full pointer-events-none"
    style={style}
    animate={{
      y: [0, -30, 0],
      opacity: [0.3, 0.7, 0.3],
      scale: [1, 1.2, 1],
    }}
    transition={{
      duration: style.duration,
      repeat: Infinity,
      ease: 'easeInOut',
      delay: style.delay,
    }}
  />
)

// ─── Particles config ─────────────────────────────────────────────────────────
const PARTICLES = [
  { width: 8,  height: 8,  top: '15%', left: '10%', background: 'rgba(96,165,250,0.25)', duration: 4,   delay: 0   },
  { width: 5,  height: 5,  top: '25%', left: '85%', background: 'rgba(147,197,253,0.3)', duration: 5,   delay: 1   },
  { width: 10, height: 10, top: '70%', left: '8%',  background: 'rgba(59,130,246,0.2)',  duration: 3.5, delay: 0.5 },
  { width: 6,  height: 6,  top: '60%', left: '88%', background: 'rgba(96,165,250,0.25)', duration: 4.5, delay: 2   },
  { width: 4,  height: 4,  top: '80%', left: '50%', background: 'rgba(147,197,253,0.2)', duration: 6,   delay: 1.5 },
  { width: 7,  height: 7,  top: '40%', left: '5%',  background: 'rgba(59,130,246,0.15)', duration: 5.5, delay: 0.8 },
  { width: 5,  height: 5,  top: '20%', left: '55%', background: 'rgba(96,165,250,0.2)',  duration: 4.2, delay: 2.5 },
]

// ─── Loading messages ─────────────────────────────────────────────────────────
const MESSAGES = [
  'Initializing system...',
  'Loading your workspace...',
  'Almost ready...',
]

// ─── Main SplashScreen Component ─────────────────────────────────────────────
const SplashScreen = () => {
  const navigate = useNavigate()
  const [progress, setProgress]   = useState(0)
  const [msgIndex, setMsgIndex]   = useState(0)
  const [exiting, setExiting]     = useState(false)

  /* ── Progress + message ticks ── */
  useEffect(() => {
    const TOTAL_MS       = 3000
    const TICK_MS        = 30
    const INCREMENT      = (100 / (TOTAL_MS / TICK_MS))
    const MESSAGE_THRESHOLDS = [0, 40, 75]

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(prev + INCREMENT, 100)
        // Update message based on progress
        for (let i = MESSAGE_THRESHOLDS.length - 1; i >= 0; i--) {
          if (next >= MESSAGE_THRESHOLDS[i]) {
            setMsgIndex(i)
            break
          }
        }
        if (next >= 100) {
          clearInterval(timer)
          setExiting(true)
          setTimeout(() => {
            const authData = getStoredAuth()
            if (authData) {
              navigate('/pos')
              return
            }
            navigate('/login')
          }, 600)
        }
        return next
      })
    }, TICK_MS)

    return () => clearInterval(timer)
  }, [navigate])

  return (
    <AnimatePresence>
      {!exiting && (
        <Motion.div
          key="splash"
          className="relative flex items-center justify-center min-h-screen w-full overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 50%, #f0f9ff 100%)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          {/* ── Decorative blobs ── */}
          <div
            className="absolute -top-32 -left-32 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(96,165,250,0.12) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
            style={{
              background: 'radial-gradient(circle, rgba(59,130,246,0.1) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* ── Floating particles ── */}
          {PARTICLES.map((p, i) => (
            <Particle key={i} style={p} />
          ))}

          {/* ── Glass card ── */}
          <Motion.div
            className="relative z-10 flex flex-col items-center gap-8 px-12 py-14 rounded-3xl"
            style={{
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              boxShadow:
                '0 8px 32px rgba(59,130,246,0.1), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
              border: '1px solid rgba(255,255,255,0.7)',
              minWidth: '340px',
            }}
            initial={{ opacity: 0, y: 28, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          >
            {/* ── Logo circle ── */}
            <Motion.div
              className="flex items-center justify-center w-24 h-24 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #2563eb 0%, #3b82f6 50%, #60a5fa 100%)',
                boxShadow:
                  '0 12px 32px rgba(37,99,235,0.35), 0 2px 8px rgba(37,99,235,0.2), inset 0 1px 0 rgba(255,255,255,0.25)',
              }}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.65, delay: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            >
              <MartiniIcon />
            </Motion.div>

            {/* ── App name ── */}
            <Motion.div
              className="flex flex-col items-center gap-1.5"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h1
                className="text-4xl font-bold tracking-tight select-none"
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  letterSpacing: '-0.02em',
                }}
              >
                Liquor<span style={{ fontWeight: 800 }}>POS</span>
              </h1>

              {/* ── Subtitle with animated text swap ── */}
              <div className="h-5 overflow-hidden">
                <AnimatePresence mode="wait">
                  <Motion.p
                    key={msgIndex}
                    className="text-sm font-medium text-center"
                    style={{ color: '#94a3b8' }}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                  >
                    {MESSAGES[msgIndex]}
                  </Motion.p>
                </AnimatePresence>
              </div>
            </Motion.div>

            {/* ── Progress bar + percentage ── */}
            <Motion.div
              className="flex flex-col items-center gap-2 w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.7 }}
            >
              <ProgressBar progress={Math.round(progress)} />
              <span
                className="text-xs font-medium tabular-nums"
                style={{ color: '#cbd5e1' }}
              >
                {Math.round(progress)}%
              </span>
            </Motion.div>

            {/* ── Dots loader ── */}
            <Motion.div
              className="flex gap-1.5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {[0, 1, 2].map(i => (
                <Motion.span
                  key={i}
                  className="block w-1.5 h-1.5 rounded-full"
                  style={{ background: '#3b82f6' }}
                  animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: i * 0.2,
                  }}
                />
              ))}
            </Motion.div>
          </Motion.div>

          {/* ── Version badge ── */}
          <Motion.span
            className="absolute bottom-6 right-6 text-xs font-medium"
            style={{ color: '#c1ccd9' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
          >
            v1.0.2
          </Motion.span>
        </Motion.div>
      )}
    </AnimatePresence>
  )
}

export default SplashScreen



