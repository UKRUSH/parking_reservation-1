import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { parkingBookingApi } from '../../api/parkingBookingApi'
import { parkingSlotApi } from '../../api/parkingSlotApi'
import { helmetBorrowingApi } from '../../api/helmetBorrowingApi'
import ParkingMap from '../../components/parking/ParkingMap'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import '../student/StudentDashboardPage.css'
import './MyBookingsPage.css'

/* ── Icons ───────────────────────────────────────────────────────────────── */
const Icon = {
  Menu: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Plus: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Back: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Car: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-2m-8 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  Calendar: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Clock: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Map: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Search: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Parking: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M8 14v-4m0 0V6h5a3 3 0 010 6H8z" />
      <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  ),
  // Sidebar nav icons
  Dashboard: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Bookings: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Helmet: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Shield: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Bell: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Logout: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Info: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
function Sidebar({ open, onClose, user, logout, pending }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard',          Ico: Icon.Dashboard },
    { path: '/my-bookings',       label: 'My Bookings',        Ico: Icon.Bookings,  badge: pending || null },
    { path: '/parking',           label: 'Find Parking',       Ico: Icon.Map },
    { path: '/my-borrowings',     label: 'Helmet Borrowings',  Ico: Icon.Helmet },
    { path: '/tickets',           label: 'Incident Tickets',   Ico: Icon.Shield },
    { path: '/notifications',     label: 'Notifications',      Ico: Icon.Bell },
  ]

  const go = (path) => { navigate(path); onClose() }

  return (
    <>
      <div className={`sd-overlay ${open ? '' : 'hidden'}`} onClick={onClose} />
      <aside className={`sd-sidebar ${open ? 'open' : ''}`}>
        <div className="sd-sidebar-header">
          <div className="sd-sidebar-logo">SC</div>
          <div>
            <div className="sd-sidebar-brand">Smart Campus</div>
            <div className="sd-sidebar-brand-sub">Parking Portal</div>
          </div>
        </div>

        <div className="sd-sidebar-user">
          <div className="sd-sidebar-avatar">{user?.name?.[0]?.toUpperCase() ?? '?'}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sd-sidebar-user-name">{user?.name ?? 'Student'}</div>
            <div className="sd-sidebar-user-role">Student</div>
          </div>
        </div>

        <div className="sd-nav-label">Menu</div>
        <ul className="sd-nav">
          {navItems.map(({ path, label, Ico, badge }) => (
            <li key={path}>
              <button
                className={`sd-nav-item ${location.pathname === path ? 'active' : ''}`}
                onClick={() => go(path)}
              >
                <Ico />
                {label}
                {badge ? <span className="sd-nav-badge sd-nav-badge--yellow">{badge}</span> : null}
              </button>
            </li>
          ))}
        </ul>

        <div className="sd-sidebar-tip">
          <div className="sd-sidebar-tip-icon"><Icon.Info /></div>
          <p>Bookings are open within <strong>2 days</strong> in advance.</p>
        </div>

        <div className="sd-sidebar-footer">
          <button className="sd-sidebar-logout" onClick={logout}>
            <Icon.Logout /> Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
const VEHICLE_TYPES = [
  { id: 'CAR',        label: 'Car',        desc: 'Sedan, hatchback, compact', emoji: '🚗', color: '#3b82f6' },
  { id: 'MOTORCYCLE', label: 'Motorcycle', desc: 'Bike, scooter',             emoji: '🏍️', color: '#8b5cf6' },
  { id: 'SUV',        label: 'SUV',        desc: 'Truck, van, 4×4',           emoji: '🚙', color: '#10b981' },
]

const STATUS_FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

function fmtDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
function fmtTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}
function fmtDateTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}
function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}
function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}
function duration(start, end) {
  const mins = (new Date(end) - new Date(start)) / 60000
  if (mins <= 0) return ''
  const h = Math.floor(mins / 60), m = mins % 60
  return h > 0 ? `${h}h${m > 0 ? ` ${m}m` : ''}` : `${m}m`
}

/* ── Booking Form Modal ──────────────────────────────────────────────────── */
function BookingFormModal({ slot, vehicleType, onClose, onBooked }) {
  const vehicleLabel = VEHICLE_TYPES.find(v => v.id === vehicleType)?.label ?? vehicleType
  const todayStr    = localDateStr()
  const maxDateStr  = localDateStr(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000))

  const defaultTimes = () => {
    const now = new Date(); now.setMinutes(0, 0, 0); now.setHours(now.getHours() + 1)
    const s = now.toTimeString().slice(0, 5); now.setHours(now.getHours() + 2)
    return { start: s, end: now.toTimeString().slice(0, 5) }
  }
  const { start: defStart, end: defEnd } = defaultTimes()

  const [form, setForm] = useState({ vehicleNumber: '', date: todayStr, startTime: defStart, endTime: defEnd, purpose: '' })
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState(null)
  const [slotBookings, setSlotBookings] = useState([])
  const [loadingSlot, setLoadingSlot]   = useState(true)
  const [slotError, setSlotError]       = useState(null)
  const [helmetWanted, setHelmetWanted] = useState(false)
  const [helmetCount, setHelmetCount]   = useState(1)
  const [helmetPurpose, setHelmetPurpose]   = useState('')
  const [hasActiveHelmet, setHasActiveHelmet] = useState(false)
  const [helmetCheckLoading, setHelmetCheckLoading] = useState(vehicleType === 'MOTORCYCLE')

  useEffect(() => {
    if (vehicleType !== 'MOTORCYCLE') return
    helmetBorrowingApi.getAll()
      .then(res => setHasActiveHelmet((res.data.data || []).some(b => b.status === 'PENDING' || b.status === 'ISSUED')))
      .catch(() => {})
      .finally(() => setHelmetCheckLoading(false))
  }, [vehicleType])

  const fetchSlotBookings = () => {
    setLoadingSlot(true); setSlotError(null)
    parkingBookingApi.getBySlot(slot.id)
      .then(res => setSlotBookings(res.data.data || []))
      .catch(err => setSlotError(err.response?.status === 404 ? 'Endpoint not found.' : 'Could not load schedule.'))
      .finally(() => setLoadingSlot(false))
  }
  useEffect(() => { fetchSlotBookings() }, [slot.id])

  const set = (f, v) => setForm(p => ({ ...p, [f]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^[A-Z]{2,3} [0-9]{4}$/.test(form.vehicleNumber)) {
      setError('Enter a valid plate: 2–3 letters then 4 digits (e.g. AB 1234)'); return
    }
    const startDT = `${form.date}T${form.startTime}:00`
    const endDT   = `${form.date}T${form.endTime}:00`
    if (form.date < todayStr || form.date > maxDateStr) { setError('Bookings only allowed within 2 days.'); return }
    if (endDT <= startDT) { setError('End time must be after start time'); return }
    if (new Date(startDT) < new Date()) { setError('Start time cannot be in the past'); return }
    setSubmitting(true); setError(null)
    try {
      await parkingBookingApi.create({ slotId: slot.id, startTime: startDT, endTime: endDT, vehicleNumber: form.vehicleNumber, purpose: form.purpose.trim() || `${vehicleLabel} parking` })
      if (vehicleType === 'MOTORCYCLE' && helmetWanted && !hasActiveHelmet) {
        try { await helmetBorrowingApi.create({ purpose: helmetPurpose.trim() || undefined, quantity: helmetCount }) } catch {}
      }
      onBooked()
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally { setSubmitting(false) }
  }

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'1rem', backdropFilter:'blur(3px)' }}>
      <div style={{ background:'#fff', borderRadius:'20px', boxShadow:'0 24px 64px rgba(0,0,0,0.2)', width:'100%', maxWidth:'480px', maxHeight:'90vh', display:'flex', flexDirection:'column', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'1.125rem 1.5rem', borderBottom:'1px solid #f1f5f9' }}>
          <div>
            <div style={{ fontSize:'1rem', fontWeight:800, color:'#1e293b' }}>Reserve Slot</div>
            <div style={{ fontSize:'0.75rem', color:'#94a3b8', marginTop:'0.1rem' }}>{slot.slotNumber} · Zone {slot.zone} · {vehicleLabel}</div>
          </div>
          <button onClick={onClose} style={{ width:32, height:32, borderRadius:'50%', background:'#f1f5f9', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', color:'#64748b', fontWeight:700 }}>✕</button>
        </div>

        <div style={{ overflowY:'auto', flex:1 }}>
          {/* Slot info */}
          <div style={{ margin:'1rem 1.5rem 0', background:'#eff6ff', border:'1.5px solid #bfdbfe', borderRadius:'12px', padding:'0.875rem 1rem', display:'flex', alignItems:'center', gap:'0.875rem' }}>
            <div style={{ background:'#2563eb', color:'#fff', borderRadius:'10px', width:42, height:42, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'0.875rem', flexShrink:0 }}>{slot.slotNumber}</div>
            <div style={{ fontSize:'0.8125rem', color:'#1d4ed8', lineHeight:1.4 }}>
              <div style={{ fontWeight:700 }}>Zone {slot.zone}</div>
              <div style={{ opacity:0.7 }}>{vehicleLabel} parking space</div>
            </div>
          </div>

          {/* Slot schedule */}
          <div style={{ margin:'0.875rem 1.5rem 0' }}>
            <p style={{ fontSize:'0.6875rem', fontWeight:700, color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:'0.5rem' }}>Existing Bookings</p>
            {loadingSlot ? <p style={{ fontSize:'0.8125rem', color:'#94a3b8' }}>Loading…</p>
            : slotError ? <p style={{ fontSize:'0.8125rem', color:'#ef4444' }}>{slotError}</p>
            : slotBookings.length === 0 ? <p style={{ fontSize:'0.8125rem', color:'#22c55e', fontWeight:600 }}>No bookings — fully available.</p>
            : (
              <div style={{ display:'flex', flexDirection:'column', gap:'0.25rem', maxHeight:'100px', overflowY:'auto' }}>
                {slotBookings.map(b => (
                  <div key={b.id} style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'8px', padding:'0.3rem 0.625rem', fontSize:'0.75rem', fontFamily:'monospace', color:'#dc2626', fontWeight:600 }}>
                    {fmtDateTime(b.startTime)} — {fmtTime(b.endTime)}
                  </div>
                ))}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} style={{ padding:'1rem 1.5rem 1.5rem', display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            {/* Vehicle number */}
            <div>
              <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:'#374151', marginBottom:'0.3rem' }}>Vehicle Number <span style={{ color:'#ef4444' }}>*</span></label>
              <input type="text" placeholder="e.g. AB 1234 or CAB 5678"
                value={form.vehicleNumber}
                onChange={e => {
                  const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                  let l='', d='', i=0
                  while(i<raw.length && /[A-Z]/.test(raw[i]) && l.length<3) l+=raw[i++]
                  while(i<raw.length && /[0-9]/.test(raw[i]) && d.length<4) d+=raw[i++]
                  set('vehicleNumber', d.length>0 ? `${l} ${d}` : l)
                }}
                maxLength={8} required
                style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'10px', padding:'0.5rem 0.75rem', fontSize:'0.875rem', fontFamily:'monospace', letterSpacing:'0.1em', outline:'none' }}
              />
              <p style={{ fontSize:'0.6875rem', color:'#94a3b8', marginTop:'0.25rem' }}>2–3 letters followed by 4 digits · e.g. AB 1234</p>
            </div>

            {/* Date */}
            <div>
              <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:'#374151', marginBottom:'0.3rem' }}>Date <span style={{ color:'#ef4444' }}>*</span></label>
              <input type="date" min={todayStr} max={maxDateStr} value={form.date} onChange={e => set('date', e.target.value)} required
                style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'10px', padding:'0.5rem 0.75rem', fontSize:'0.875rem', outline:'none' }} />
            </div>

            {/* Times */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
              {['startTime', 'endTime'].map(k => (
                <div key={k}>
                  <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:'#374151', marginBottom:'0.3rem' }}>{k === 'startTime' ? 'Start' : 'End'} Time <span style={{ color:'#ef4444' }}>*</span></label>
                  <input type="time" value={form[k]} onChange={e => set(k, e.target.value)} required
                    style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'10px', padding:'0.5rem 0.75rem', fontSize:'0.875rem', outline:'none' }} />
                </div>
              ))}
            </div>

            {/* Duration hint */}
            {form.startTime && form.endTime && form.startTime < form.endTime && (() => {
              const [sh,sm] = form.startTime.split(':').map(Number)
              const [eh,em] = form.endTime.split(':').map(Number)
              const mins = (eh*60+em)-(sh*60+sm)
              if (mins <= 0) return null
              const h = Math.floor(mins/60), m = mins%60
              return <p style={{ fontSize:'0.75rem', color:'#22c55e', fontWeight:600 }}>⏱ Duration: {h>0 ? `${h}h ` : ''}{m>0 ? `${m}m` : ''}</p>
            })()}

            {/* Purpose */}
            <div>
              <label style={{ display:'block', fontSize:'0.8125rem', fontWeight:600, color:'#374151', marginBottom:'0.3rem' }}>Purpose <span style={{ fontSize:'0.75rem', fontWeight:400, color:'#94a3b8' }}>(optional)</span></label>
              <input type="text" placeholder={`${vehicleLabel} parking`} value={form.purpose} onChange={e => set('purpose', e.target.value)}
                style={{ width:'100%', border:'1.5px solid #e2e8f0', borderRadius:'10px', padding:'0.5rem 0.75rem', fontSize:'0.875rem', outline:'none' }} />
            </div>

            {/* Helmet section */}
            {vehicleType === 'MOTORCYCLE' && (
              <div style={{ background:'#fff7ed', border:'1.5px solid #fed7aa', borderRadius:'12px', padding:'1rem' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', marginBottom:'0.625rem' }}>
                  <span style={{ fontSize:'1.25rem' }}>🪖</span>
                  <span style={{ fontSize:'0.875rem', fontWeight:700, color:'#c2410c' }}>Helmet Borrowing</span>
                </div>
                {helmetCheckLoading ? <p style={{ fontSize:'0.8125rem', color:'#c2410c' }}>Checking…</p>
                : hasActiveHelmet ? <p style={{ fontSize:'0.8125rem', color:'#c2410c', background:'#fff', border:'1px solid #fed7aa', borderRadius:'8px', padding:'0.5rem 0.75rem' }}>You have an active helmet request.</p>
                : (
                  <>
                    <label style={{ display:'flex', alignItems:'center', gap:'0.5rem', cursor:'pointer', fontSize:'0.875rem', color:'#92400e' }}>
                      <input type="checkbox" checked={helmetWanted} onChange={e => setHelmetWanted(e.target.checked)} style={{ width:16, height:16, accentColor:'#ea580c' }} />
                      Also request a campus helmet
                    </label>
                    {helmetWanted && (
                      <div style={{ marginTop:'0.75rem', display:'flex', flexDirection:'column', gap:'0.625rem' }}>
                        <div style={{ display:'flex', gap:'0.5rem' }}>
                          {[1,2].map(n => (
                            <button key={n} type="button" onClick={() => setHelmetCount(n)}
                              style={{ padding:'0.375rem 1rem', borderRadius:'8px', fontSize:'0.875rem', fontWeight:700, border:'1.5px solid', cursor:'pointer', transition:'all 0.15s',
                                background: helmetCount===n ? '#ea580c' : '#fff',
                                color: helmetCount===n ? '#fff' : '#c2410c',
                                borderColor: helmetCount===n ? '#ea580c' : '#fed7aa' }}>
                              🪖 {n}
                            </button>
                          ))}
                        </div>
                        <input type="text" placeholder="Helmet purpose (optional)" value={helmetPurpose} onChange={e => setHelmetPurpose(e.target.value)}
                          style={{ width:'100%', border:'1.5px solid #fed7aa', borderRadius:'8px', padding:'0.4375rem 0.75rem', fontSize:'0.8125rem', background:'#fff', outline:'none' }} />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {error && (
              <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'10px', padding:'0.625rem 0.875rem', fontSize:'0.8125rem', color:'#dc2626' }}>
                {error}
              </div>
            )}

            <div style={{ display:'flex', gap:'0.75rem' }}>
              <button type="button" onClick={onClose}
                style={{ flex:1, border:'1.5px solid #e2e8f0', background:'#fff', color:'#64748b', padding:'0.625rem', borderRadius:'10px', fontSize:'0.875rem', fontWeight:600, cursor:'pointer' }}>
                Cancel
              </button>
              <button type="submit" disabled={submitting}
                style={{ flex:2, background:'#2563eb', border:'none', color:'#fff', padding:'0.625rem', borderRadius:'10px', fontSize:'0.875rem', fontWeight:700, cursor:'pointer', opacity:submitting?0.6:1 }}>
                {submitting ? 'Booking…' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

/* ── Vehicle Selector ────────────────────────────────────────────────────── */
function VehicleSelector({ onSelect }) {
  return (
    <div className="bk-flow-body">
      <div style={{ marginBottom:'1.25rem' }}>
        <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#1e293b', marginBottom:'0.25rem' }}>Choose Your Vehicle Type</h3>
        <p style={{ fontSize:'0.875rem', color:'#94a3b8' }}>We'll show available spaces for your vehicle</p>
      </div>
      <div className="bk-vehicle-grid">
        {VEHICLE_TYPES.map(v => (
          <button key={v.id} className="bk-vehicle-card" onClick={() => onSelect(v.id)}>
            <div className="bk-vehicle-emoji-wrap" style={{ '--vc': v.color }}>
              <span className="bk-vehicle-emoji">{v.emoji}</span>
            </div>
            <div className="bk-vehicle-label">{v.label}</div>
            <div className="bk-vehicle-desc">{v.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

/* ── Slot Picker ─────────────────────────────────────────────────────────── */
function SlotPicker({ vehicleType, onBack, onBooked }) {
  const [slots, setSlots]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [selected, setSelected] = useState(null)
  const label = VEHICLE_TYPES.find(v => v.id === vehicleType)?.label

  useEffect(() => {
    setLoading(true); setError(null)
    parkingSlotApi.getSlots(vehicleType)
      .then(res => setSlots(res.data.data || []))
      .catch(() => setError('Could not load parking map. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [vehicleType])

  return (
    <div className="bk-flow-body">
      <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.25rem' }}>
        <button className="bk-back-btn" onClick={onBack}><Icon.Back /> Back</button>
        <div>
          <h3 style={{ fontSize:'1rem', fontWeight:800, color:'#1e293b' }}>{label} Spaces</h3>
          <p style={{ fontSize:'0.75rem', color:'#94a3b8' }}>Click a green slot to reserve</p>
        </div>
      </div>
      {loading ? <p style={{ color:'#94a3b8', textAlign:'center', padding:'2rem' }}>Loading parking map…</p>
      : error ? <p style={{ color:'#ef4444', background:'#fef2f2', padding:'0.75rem 1rem', borderRadius:'10px', fontSize:'0.875rem' }}>{error}</p>
      : slots.length === 0 ? <p style={{ color:'#94a3b8', textAlign:'center', padding:'2rem' }}>No spaces found for this vehicle type.</p>
      : <ParkingMap slots={slots} selectedId={selected?.id} onSelect={setSelected} />}
      {selected && (
        <BookingFormModal slot={selected} vehicleType={vehicleType} onClose={() => setSelected(null)} onBooked={onBooked} />
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Main page
   ══════════════════════════════════════════════════════════════════════════ */
export default function MyBookingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [bookings, setBookings]         = useState([])
  const [loading, setLoading]           = useState(true)
  const [step, setStep]                 = useState('list')   // 'list' | 'vehicle' | 'map'
  const [vehicleType, setVehicleType]   = useState(null)
  const [filter, setFilter]             = useState('ALL')
  const [search, setSearch]             = useState('')

  const loadBookings = () => {
    setLoading(true)
    parkingBookingApi.getAll()
      .then(res => setBookings(res.data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadBookings() }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    await parkingBookingApi.cancel(id)
    loadBookings()
  }

  const handleBooked = () => { setStep('list'); setVehicleType(null); loadBookings() }

  // Stats
  const counts = bookings.reduce((acc, b) => { acc[b.status] = (acc[b.status] || 0) + 1; return acc }, {})
  const pending = counts['PENDING'] || 0

  // Filtered list
  const displayed = bookings.filter(b => {
    const matchFilter = filter === 'ALL' || b.status === filter
    const q = search.toLowerCase()
    const matchSearch = !q || b.slotNumber?.toLowerCase().includes(q) || b.zone?.toLowerCase().includes(q) || b.vehicleNumber?.toLowerCase().includes(q) || b.purpose?.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const stepState = (s) => {
    if (step === 'vehicle') return s === 0 ? 'active' : 'pending'
    if (step === 'map')     return s === 0 ? 'done'   : 'active'
    return 'pending'
  }

  return (
    <div className="sd-shell">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        logout={logout}
        pending={pending}
      />

      <div className="sd-main">

        {/* ── Topbar ── */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <button className="sd-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
              <Icon.Menu />
            </button>
            <span className="sd-topbar-title">My Parking Bookings</span>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formatDate()}</span>
            <NotificationBell />
            <button
              onClick={() => setStep('vehicle')}
              style={{ display:'flex', alignItems:'center', gap:'0.375rem', background:'#1d4ed8', color:'#fff', border:'none', borderRadius:'9999px', padding:'0.4rem 1rem', fontSize:'0.8125rem', fontWeight:600, cursor:'pointer' }}
            >
              <Icon.Plus /> New Booking
            </button>
            <div className="sd-topbar-avatar" title={user?.name} onClick={() => setSidebarOpen(v => !v)}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
        </header>

        <div className="sd-body">

          {/* ── Hero ── */}
          <div className="bk-hero">
            <div className="bk-hero-text">
              <div className="bk-hero-eyebrow">Campus Parking System</div>
              <h1 className="bk-hero-title">My Bookings</h1>
              <p className="bk-hero-sub">Reserve, track, and manage your campus parking spaces</p>
              <div className="bk-hero-actions">
                <button className="bk-hero-btn" onClick={() => setStep('vehicle')}>
                  <Icon.Plus /> Reserve a Space
                </button>
              </div>
            </div>

            {/* Decorative parking grid */}
            <div className="bk-hero-visual">
              <div className="bk-hero-slots">
                {[0,1,0,1,0,1,1,0,0,1,0,1].map((taken, i) => (
                  <div key={i} className={`bk-hero-slot bk-hero-slot--${taken ? 'taken' : 'free'}`}>
                    {taken && (
                      <svg className="bk-hero-slot-car" viewBox="0 0 64 32" fill="currentColor">
                        <rect x="8" y="10" width="48" height="14" rx="3" />
                        <rect x="16" y="5" width="28" height="9" rx="2" />
                        <circle cx="18" cy="26" r="4" /><circle cx="46" cy="26" r="4" />
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Stats strip ── */}
          <div className="bk-stats-row">
            {[
              { label: 'Total',      key: 'TOTAL',     color: 'sd-stat-icon--blue',  val: bookings.length },
              { label: 'Pending',    key: 'PENDING',   color: 'sd-stat-icon--amber', val: counts['PENDING']   ?? 0 },
              { label: 'Approved',   key: 'APPROVED',  color: 'sd-stat-icon--green', val: counts['APPROVED']  ?? 0 },
              { label: 'Cancelled',  key: 'CANCELLED', color: 'sd-stat-icon--blue',  val: (counts['CANCELLED'] ?? 0) + (counts['REJECTED'] ?? 0) },
            ].map(({ label, key, color, val }) => (
              <div key={key} className="sd-stat-card" style={{ cursor: key !== 'TOTAL' ? 'pointer' : 'default' }}
                onClick={() => key !== 'TOTAL' && setFilter(key === 'CANCELLED' ? 'CANCELLED' : key)}>
                <div className={`sd-stat-icon ${color}`}>
                  <Icon.Parking />
                </div>
                <div>
                  <div className="sd-stat-label">{label}</div>
                  <div className="sd-stat-value">{val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Booking flow panel ── */}
          {step !== 'list' && (
            <div style={{ padding:'1.5rem 1.75rem 0' }}>
              <div className="bk-flow-panel">
                <div className="bk-flow-header">
                  <div className={`bk-flow-step bk-flow-step--${stepState(0)}`}>
                    <span className="bk-flow-step-num">
                      {stepState(0) === 'done' ? '✓' : '1'}
                    </span>
                    Vehicle Type
                  </div>
                  <div className="bk-flow-divider" />
                  <div className={`bk-flow-step bk-flow-step--${stepState(1)}`}>
                    <span className="bk-flow-step-num">2</span>
                    Select Slot
                  </div>
                  <div style={{ flex:1, display:'flex', justifyContent:'flex-end' }}>
                    <button
                      onClick={() => { setStep('list'); setVehicleType(null) }}
                      style={{ fontSize:'0.8125rem', color:'#94a3b8', background:'none', border:'none', cursor:'pointer', fontWeight:500 }}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>

                {step === 'vehicle' && (
                  <VehicleSelector onSelect={type => { setVehicleType(type); setStep('map') }} />
                )}
                {step === 'map' && (
                  <SlotPicker vehicleType={vehicleType} onBack={() => setStep('vehicle')} onBooked={handleBooked} />
                )}
              </div>
            </div>
          )}

          {/* ── Booking list ── */}
          {step === 'list' && (
            <>
              {/* Filters */}
              <div className="bk-toolbar">
                <div className="bk-search-wrap">
                  <svg className="bk-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    className="bk-search"
                    type="text"
                    placeholder="Search by slot, zone, or vehicle plate…"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                  />
                </div>
                <div className="bk-filter-tabs">
                  {STATUS_FILTERS.map(f => (
                    <button
                      key={f}
                      className={`bk-filter-tab ${filter === f ? 'active' : ''}`}
                      onClick={() => setFilter(f)}
                    >
                      {f === 'ALL' ? `All (${bookings.length})` : f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bk-content">
                {loading ? (
                  <div className="bk-empty">
                    <div className="bk-empty-icon"><Icon.Parking /></div>
                    <div className="bk-empty-title">Loading bookings…</div>
                  </div>
                ) : displayed.length === 0 ? (
                  <div className="bk-empty">
                    <div className="bk-empty-icon"><Icon.Car /></div>
                    <div className="bk-empty-title">{bookings.length === 0 ? 'No bookings yet' : 'No results found'}</div>
                    <div className="bk-empty-desc">
                      {bookings.length === 0
                        ? 'Reserve your first campus parking space.'
                        : 'Try a different search or filter.'}
                    </div>
                    {bookings.length === 0 && (
                      <button className="bk-empty-cta" onClick={() => setStep('vehicle')}>
                        <Icon.Plus /> Reserve a Space
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bk-list">
                    <div className="bk-section-label">{displayed.length} booking{displayed.length !== 1 ? 's' : ''}</div>
                    {displayed.map(b => (
                      <div key={b.id} className={`bk-card bk-card--${b.status}`}>
                        {/* Slot badge */}
                        <div className={`bk-slot-badge bk-slot-badge--${b.status}`}>
                          <span className="bk-slot-badge-num">{b.slotNumber ?? '—'}</span>
                          {b.zone && <span className="bk-slot-badge-zone">Zone {b.zone}</span>}
                        </div>

                        {/* Info */}
                        <div className="bk-card-body">
                          <div className="bk-card-row1">
                            <div className="bk-card-title">
                              Slot {b.slotNumber}
                              {b.zone && <span className="bk-zone-chip">Zone {b.zone}</span>}
                            </div>
                            <span className={`bk-status-badge bk-status-badge--${b.status}`}>{b.status}</span>
                          </div>

                          <div className="bk-card-meta">
                            <span className="bk-meta-item">
                              <svg className="bk-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {fmtDate(b.startTime)}
                            </span>
                            <span className="bk-meta-item">
                              <svg className="bk-meta-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {fmtTime(b.startTime)} → {fmtTime(b.endTime)}
                              {b.startTime && b.endTime && (
                                <span style={{ color:'#94a3b8', marginLeft:'0.25rem' }}>({duration(b.startTime, b.endTime)})</span>
                              )}
                            </span>
                          </div>

                          {b.vehicleNumber && (
                            <div className="bk-card-vehicle">🚗 {b.vehicleNumber}</div>
                          )}

                          {b.purpose && (
                            <div className="bk-card-purpose">📋 {b.purpose}</div>
                          )}

                          {b.rejectionReason && (
                            <div className="bk-card-reject">⚠ {b.rejectionReason}</div>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="bk-card-actions">
                          {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                            <button className="bk-cancel-btn" onClick={() => handleCancel(b.id)}>
                              Cancel
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
