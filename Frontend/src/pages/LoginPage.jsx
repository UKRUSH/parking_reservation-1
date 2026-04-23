import { useState, useEffect, useRef } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi, loginWithGoogle } from '../api/authApi'
import './LoginPage.css'

const COLORS = ['#60a5fa', '#818cf8', '#a78bfa', '#38bdf8', '#c4b5fd', '#ffffff']

function ParticleCanvas() {
  const canvasRef = useRef(null)
  const mouseRef  = useRef({ x: -9999, y: -9999 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

    const resize = () => {
      canvas.width  = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const mkParticle = () => ({
      x:     Math.random() * canvas.width,
      y:     Math.random() * canvas.height,
      vx:    (Math.random() - 0.5) * 0.55,
      vy:    (Math.random() - 0.5) * 0.55,
      r:     Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    })

    const init = () => {
      resize()
      particles = Array.from({ length: 90 }, mkParticle)
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const mx = mouseRef.current.x
      const my = mouseRef.current.y

      for (let i = 0; i < particles.length; i++) {
        const a = particles[i]
        for (let j = i + 1; j < particles.length; j++) {
          const b = particles[j]
          const dx = a.x - b.x, dy = a.y - b.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 145) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(79,142,247,${0.18 * (1 - dist / 145)})`
            ctx.lineWidth = 1
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
        // grab effect
        const mdx = a.x - mx, mdy = a.y - my
        const md  = Math.sqrt(mdx * mdx + mdy * mdy)
        if (md < 160) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(148,160,255,${0.45 * (1 - md / 160)})`
          ctx.lineWidth = 1
          ctx.moveTo(a.x, a.y)
          ctx.lineTo(mx, my)
          ctx.stroke()
        }
      }

      for (const p of particles) {
        ctx.globalAlpha = p.alpha
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.fill()
        ctx.globalAlpha = 1

        p.x += p.vx
        p.y += p.vy
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width)  p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = 0
      }

      animId = requestAnimationFrame(draw)
    }

    const onMouse = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const onLeave = () => { mouseRef.current = { x: -9999, y: -9999 } }
    const onClick = (e) => {
      const rect = canvas.getBoundingClientRect()
      const cx = e.clientX - rect.left, cy = e.clientY - rect.top
      for (let i = 0; i < 3; i++) {
        const p = mkParticle()
        p.x = cx; p.y = cy
        particles.push(p)
      }
    }

    window.addEventListener('resize', () => { resize() })
    canvas.addEventListener('mousemove', onMouse)
    canvas.addEventListener('mouseleave', onLeave)
    canvas.addEventListener('click', onClick)
    init()
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      canvas.removeEventListener('mousemove', onMouse)
      canvas.removeEventListener('mouseleave', onLeave)
      canvas.removeEventListener('click', onClick)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 1 }}
    />
  )
}

export default function LoginPage() {
  const { user, loading, login } = useAuth()
  const navigate = useNavigate()

  const [tab, setTab]           = useState('login')
  const [form, setForm]         = useState({ name: '', email: '', password: '' })
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (loading) return null
  if (user) return <Navigate to="/" replace />

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      let res
      if (tab === 'login') {
        res = await authApi.login({ email: form.email, password: form.password })
      } else {
        res = await authApi.register({ name: form.name, email: form.email, password: form.password })
      }
      const authData = res.data.data   // { token, user: { roles, ... } }
      login(authData)
      const isAdmin = authData?.user?.roles?.includes('ADMIN')
      navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard', { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const switchTab = (t) => { setTab(t); setError(''); setForm({ name: '', email: '', password: '' }) }

  return (
    <div className="login-bg" style={{ fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>

      {/* ── Particles ── */}
      <ParticleCanvas />

      {/* ── Top nav ── */}
      <nav style={{
        position: 'relative', zIndex: 20, flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 40px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg,#2563eb,#60a5fa)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 900, color: '#fff',
          }}>P</div>
          <span style={{ fontWeight: 800, fontSize: 18, color: '#fff', letterSpacing: '-0.3px' }}>
            Smart Campus
          </span>
        </div>

        {/* Live badge */}
        <div className="live-badge">
          <span className="live-dot" />
          LIVE PLATFORM
        </div>
      </nav>

      {/* ── Main content ── */}
      <div style={{
        position: 'relative', zIndex: 20,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flex: 1,
        padding: '0 20px 0 60px',
        gap: 0,
        overflow: 'hidden',
      }}>

        {/* ── Left: Form card ── */}
        <div className="login-card" style={{
          width: '100%', maxWidth: 480,
          padding: '32px 40px 28px',
        }}>
          {/* Back link */}
          <a
            href="#"
            onClick={e => { e.preventDefault(); navigate('/') }}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 12, color: '#6b7280',
              textDecoration: 'none', marginBottom: 10,
              transition: 'color 0.2s' }}
            onMouseOver={e => e.currentTarget.style.color = '#1e3a8a'}
            onMouseOut={e => e.currentTarget.style.color = '#6b7280'}
          >
            ← Back to home
          </a>

          {/* Portal label */}
          <div className="portal-label">Smart Campus Portal</div>

          {/* Heading */}
          <h1 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
            {tab === 'login' ? <>Welcome back 👋</> : <>Create account ✨</>}
          </h1>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6b7280' }}>
            {tab === 'login'
              ? 'Sign in to your Smart Campus account'
              : 'Register to access parking & more'}
          </p>

          {/* Tabs */}
          <div className="login-tabs">
            <button className={`login-tab${tab === 'login' ? ' active' : ''}`} onClick={() => switchTab('login')}>
              Sign In
            </button>
            <button className={`login-tab${tab === 'register' ? ' active' : ''}`} onClick={() => switchTab('register')}>
              Register
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

            {tab === 'register' && (
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 700,
                  letterSpacing: '1px', color: '#374151',
                  textTransform: 'uppercase', marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  className="login-input"
                  type="text" name="name"
                  value={form.name} onChange={handleChange}
                  placeholder="John Silva" required
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700,
                letterSpacing: '1px', color: '#374151',
                textTransform: 'uppercase', marginBottom: 7 }}>
                Email Address
              </label>
              <input
                className="login-input"
                type="email" name="email"
                value={form.email} onChange={handleChange}
                placeholder="you@example.com" required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700,
                letterSpacing: '1px', color: '#374151',
                textTransform: 'uppercase', marginBottom: 7 }}>
                Password
              </label>
              <input
                className="login-input"
                type="password" name="password"
                value={form.password} onChange={handleChange}
                placeholder={tab === 'register' ? 'Min 6 characters' : '••••••••'} required
              />
            </div>

            {/* Remember me / forgot */}
            {tab === 'login' && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 7,
                  fontSize: 13, color: '#6b7280', cursor: 'pointer' }}>
                  <input
                    className="login-check"
                    type="checkbox"
                    checked={remember}
                    onChange={e => setRemember(e.target.checked)}
                  />
                  Remember me
                </label>
                <a href="#" onClick={e => e.preventDefault()}
                  style={{ fontSize: 13, color: '#60a5fa', textDecoration: 'none', fontWeight: 500 }}>
                  Forgot password?
                </a>
              </div>
            )}

            {error && <div className="login-error">{error}</div>}

            <button type="submit" className="login-btn" disabled={submitting}>
              {submitting
                ? 'Please wait...'
                : tab === 'login' ? 'Sign in →' : 'Create Account →'}
            </button>
          </form>

          {/* Divider */}
          <div className="login-divider" style={{ margin: '10px 0' }}><span>or continue with</span></div>

          {/* Google */}
          <button className="google-btn" onClick={loginWithGoogle}>
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>

          {/* Switch tab link */}
          <p style={{ textAlign: 'center', marginTop: 10, marginBottom: 0, fontSize: 12,
            color: '#6b7280' }}>
            {tab === 'login'
              ? <>Don't have an account?{' '}
                  <button onClick={() => switchTab('register')}
                    style={{ background: 'none', border: 'none', color: '#60a5fa',
                      fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
                    Create one free →
                  </button>
                </>
              : <>Already have an account?{' '}
                  <button onClick={() => switchTab('login')}
                    style={{ background: 'none', border: 'none', color: '#60a5fa',
                      fontWeight: 600, cursor: 'pointer', fontSize: 12 }}>
                    Sign in →
                  </button>
                </>
            }
          </p>
        </div>

        {/* ── Right: Image ── */}
        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
          maxWidth: 780, overflow: 'hidden',
          paddingRight: 0,
        }}>
          <img
            src="/park1.png"
            alt="Smart Campus Parking"
            className="park-image"
            style={{ width: '100%', maxWidth: 600, maxHeight: 'calc(100vh - 140px)', objectFit: 'contain', userSelect: 'none', marginRight: -80 }}
          />
        </div>
      </div>

      {/* ── Bottom stats ── */}
      <div style={{
        position: 'relative', zIndex: 20, flexShrink: 0,
        display: 'flex', justifyContent: 'center', gap: 12,
        padding: '0 40px 16px',
      }}>
        {[
          { value: '144', label: 'PARKING SLOTS' },
          { value: '6',   label: 'ZONES' },
          { value: '98%', label: 'SATISFACTION' },
        ].map(s => (
          <div key={s.label} className="stat-badge">
            <div style={{ fontSize: 18, fontWeight: 800, color: '#fff' }}>{s.value}</div>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.45)',
              letterSpacing: '1px', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

    </div>
  )
}
