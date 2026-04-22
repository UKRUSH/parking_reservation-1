import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import NotificationBell from '../../components/common/NotificationBell'
import { parkingBookingApi } from '../../api/parkingBookingApi'
import { parkingSlotApi } from '../../api/parkingSlotApi'
import './StudentDashboardPage.css'

/* ── Icons ───────────────────────────────────────────────────────────────── */
const Icon = {
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
  Parking: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
  Check: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Plus: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  ),
  Chevron: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Menu: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  X: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="20" height="20">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Helmet: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  EmptyBox: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
  Car: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M5 17H3a2 2 0 01-2-2V9a2 2 0 012-2h14a2 2 0 012 2v6a2 2 0 01-2 2h-2m-8 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  Shield: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Info: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  MapPin: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Refresh: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function fmtShort(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function fmtRelative(dt) {
  if (!dt) return '—'
  const diff = new Date(dt) - new Date()
  const h = Math.floor(diff / 3600000)
  if (h < 1)  return 'Starting soon'
  if (h < 24) return `in ${h}h`
  const d = Math.floor(h / 24)
  return `in ${d}d`
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
function Sidebar({ open, onClose, user, logout, pending }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard',        Ico: Icon.Dashboard },
    { path: '/my-bookings',       label: 'My Bookings',      Ico: Icon.Bookings, badge: pending || null },
    { path: '/parking',           label: 'Find Parking',     Ico: Icon.Parking },
    { path: '/my-borrowings',     label: 'Helmet Borrowings',Ico: Icon.Helmet },
    { path: '/notifications',     label: 'Notifications',    Ico: Icon.Bell },
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

        {/* Sidebar bottom tip */}
        <div className="sd-sidebar-tip">
          <div className="sd-sidebar-tip-icon"><Icon.Info /></div>
          <p>Bookings are open within <strong>2 days</strong> in advance.</p>
        </div>

        <div className="sd-sidebar-footer">
          <button className="sd-sidebar-logout" onClick={logout}>
            <Icon.Logout />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

/* ── Availability bar ────────────────────────────────────────────────────── */
function AvailBar({ available, total, color }) {
  const pct = total > 0 ? Math.round((available / total) * 100) : 0
  return (
    <div className="sd-avail-bar-wrap">
      <div className="sd-avail-bar-track">
        <div className="sd-avail-bar-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="sd-avail-bar-label">{pct}%</span>
    </div>
  )
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function StudentDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bookings, setBookings]       = useState([])
  const [slots, setSlots]             = useState([])
  const [loadingBookings, setLB]      = useState(true)
  const [loadingSlots, setLS]         = useState(true)

  useEffect(() => {
    parkingBookingApi.getAll()
      .then(res => setBookings(res.data.data || []))
      .catch(() => setBookings([]))
      .finally(() => setLB(false))

    parkingSlotApi.getSlots()
      .then(res => setSlots(res.data.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLS(false))
  }, [])

  const now      = new Date()
  const total    = bookings.length
  const pending  = bookings.filter(b => b.status === 'PENDING').length
  const approved = bookings.filter(b => b.status === 'APPROVED').length

  const recent   = [...bookings]
    .sort((a, b) => new Date(b.startTime) - new Date(a.startTime))
    .slice(0, 4)

  const upcoming = bookings
    .filter(b => b.status === 'APPROVED' && new Date(b.startTime) > now)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
    .slice(0, 3)

  // Slot availability per type
  const slotGroups = ['CAR', 'MOTORCYCLE', 'SUV'].map(type => {
    const group = slots.filter(s => s.type === type)
    return { type, total: group.length, available: group.filter(s => s.available).length }
  })

  const firstName = user?.name?.split(' ')[0] ?? 'Student'
  const initial   = user?.name?.[0]?.toUpperCase() ?? '?'
  const loadingStats = loadingBookings

  const AVAIL_COLORS = { CAR: '#3b82f6', MOTORCYCLE: '#10b981', SUV: '#f59e0b' }
  const VEHICLE_LABELS = { CAR: 'Car', MOTORCYCLE: 'Motorcycle', SUV: 'SUV' }
  const VEHICLE_EMOJI  = { CAR: '🚗', MOTORCYCLE: '🏍️', SUV: '🚙' }

  const RULES = [
    { icon: '🕐', text: 'Book at least 15 minutes before your arrival.' },
    { icon: '🚫', text: 'Do not park in reserved or restricted zones.' },
    { icon: '🔄', text: 'Cancel unused bookings so others can use the slot.' },
    { icon: '📋', text: 'Always carry your booking confirmation ID.' },
    { icon: '⏱️', text: 'Overstaying your booking window may result in a fine.' },
  ]

  const HOW_TO = [
    { step: '01', title: 'Choose Vehicle', desc: 'Select Car, Motorcycle or SUV to filter matching slots.', color: '#3b82f6' },
    { step: '02', title: 'Pick a Slot',    desc: 'Tap any green slot on the live parking map.', color: '#10b981' },
    { step: '03', title: 'Get Approved',   desc: 'Admin reviews and approves your request — check Notifications.', color: '#8b5cf6' },
  ]

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

        {/* Topbar */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <button className="sd-hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
              {sidebarOpen ? <Icon.X /> : <Icon.Menu />}
            </button>
            <span className="sd-topbar-title">Dashboard</span>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formatDate()}</span>
            <NotificationBell />
            <div className="sd-topbar-avatar" title={user?.name}>{initial}</div>
          </div>
        </header>

        <div className="sd-body">

          {/* Hero */}
          <div className="sd-hero">

            {/* Left — text */}
            <div className="sd-hero-text">
              <p className="sd-hero-eyebrow">{getGreeting()}</p>
              <h1 className="sd-hero-title">{firstName} 👋</h1>
              <p className="sd-hero-sub">Manage your campus parking reservations from here.</p>
              <button className="sd-hero-cta" onClick={() => navigate('/my-bookings')}>
                <Icon.Plus /> New Booking
              </button>
            </div>

            {/* Right — parking visual */}
            <div className="sd-hero-visual">
              {/* Slot grid */}
              <div className="sd-hero-grid">
                {[
                  true,false,true,true,
                  false,true,false,true,
                  true,true,false,true,
                ].map((avail, i) => (
                  <div key={i} className={`sd-hero-slot ${avail ? 'sd-hero-slot--free' : 'sd-hero-slot--taken'}`}>
                    {!avail && (
                      <svg viewBox="0 0 24 14" fill="currentColor" className="sd-hero-slot-car">
                        <rect x="2" y="4" width="20" height="7" rx="2"/>
                        <rect x="5" y="2" width="12" height="5" rx="1.5"/>
                        <circle cx="6"  cy="12" r="2.2"/>
                        <circle cx="18" cy="12" r="2.2"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>

              {/* Floating chips */}
              <div className="sd-hero-chip sd-hero-chip--tl">🚗 Car Zone</div>
              <div className="sd-hero-chip sd-hero-chip--tr">🏍️ Moto Zone</div>
              <div className="sd-hero-chip sd-hero-chip--bl">🚙 SUV Zone</div>
              <div className="sd-hero-chip sd-hero-chip--br">
                <span className="sd-hero-chip-dot" />24/7 Access
              </div>
            </div>

          </div>

          {/* Stats */}
          <div className="sd-stats-row">
            <div className="sd-stat-card">
              <div className="sd-stat-icon sd-stat-icon--blue"><Icon.Calendar /></div>
              <div>
                <p className="sd-stat-label">Total Bookings</p>
                {loadingStats ? <div className="sd-skeleton" style={{ width: 36, height: 26 }} /> : <p className="sd-stat-value">{total}</p>}
              </div>
            </div>
            <div className="sd-stat-card">
              <div className="sd-stat-icon sd-stat-icon--amber"><Icon.Clock /></div>
              <div>
                <p className="sd-stat-label">Pending</p>
                {loadingStats ? <div className="sd-skeleton" style={{ width: 28, height: 26 }} /> : <p className="sd-stat-value">{pending}</p>}
              </div>
            </div>
            <div className="sd-stat-card">
              <div className="sd-stat-icon sd-stat-icon--green"><Icon.Check /></div>
              <div>
                <p className="sd-stat-label">Approved</p>
                {loadingStats ? <div className="sd-skeleton" style={{ width: 28, height: 26 }} /> : <p className="sd-stat-value">{approved}</p>}
              </div>
            </div>
          </div>

          {/* ── Parking availability row ── */}
          <div className="sd-avail-row">
            <div className="sd-avail-header">
              <span className="sd-avail-title">Live Parking Availability</span>
              <button className="sd-avail-refresh" onClick={() => {
                setLS(true)
                parkingSlotApi.getSlots().then(r => setSlots(r.data.data || [])).catch(() => {}).finally(() => setLS(false))
              }}>
                <Icon.Refresh /> Refresh
              </button>
            </div>
            <div className="sd-avail-cards">
              {slotGroups.map(({ type, total: t, available: a }) => (
                <div key={type} className="sd-avail-card" onClick={() => navigate('/parking')}>
                  <div className="sd-avail-emoji">{VEHICLE_EMOJI[type]}</div>
                  <div className="sd-avail-info">
                    <div className="sd-avail-type">{VEHICLE_LABELS[type]}</div>
                    {loadingSlots
                      ? <div className="sd-skeleton" style={{ width: 60, height: 14, marginTop: 4 }} />
                      : <>
                          <div className="sd-avail-count">
                            <span style={{ color: AVAIL_COLORS[type], fontWeight: 700 }}>{a}</span>
                            <span className="sd-avail-sep"> / {t}</span>
                            <span className="sd-avail-free"> free</span>
                          </div>
                          <AvailBar available={a} total={t} color={AVAIL_COLORS[type]} />
                        </>
                    }
                  </div>
                  <span className="sd-avail-arrow">→</span>
                </div>
              ))}
            </div>
          </div>

          {/* Content grid */}
          <div className="sd-grid">

            {/* ── Left panel ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Quick actions */}
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <span className="sd-panel-title">Quick Actions</span>
                </div>
                <div className="sd-actions-grid">
                  <button className="sd-action-btn sd-action-btn--blue" onClick={() => navigate('/my-bookings')}>
                    <div className="sd-action-icon sd-action-icon--blue"><Icon.Bookings /></div>
                    <div>
                      <p className="sd-action-text-title">My Bookings</p>
                      <p className="sd-action-text-desc">View all reservations</p>
                    </div>
                    <span className="sd-action-chevron"><Icon.Chevron /></span>
                  </button>
                  <button className="sd-action-btn sd-action-btn--green" onClick={() => navigate('/parking')}>
                    <div className="sd-action-icon sd-action-icon--green"><Icon.Parking /></div>
                    <div>
                      <p className="sd-action-text-title">Find Parking</p>
                      <p className="sd-action-text-desc">Live slot map</p>
                    </div>
                    <span className="sd-action-chevron"><Icon.Chevron /></span>
                  </button>
                  <button className="sd-action-btn sd-action-btn--purple" onClick={() => navigate('/notifications')}>
                    <div className="sd-action-icon sd-action-icon--purple"><Icon.Bell /></div>
                    <div>
                      <p className="sd-action-text-title">Notifications</p>
                      <p className="sd-action-text-desc">Approvals &amp; updates</p>
                    </div>
                    <span className="sd-action-chevron"><Icon.Chevron /></span>
                  </button>
                  <button className="sd-action-btn sd-action-btn--orange" onClick={() => navigate('/my-bookings')}>
                    <div className="sd-action-icon sd-action-icon--orange"><Icon.Plus /></div>
                    <div>
                      <p className="sd-action-text-title">New Booking</p>
                      <p className="sd-action-text-desc">Reserve a slot now</p>
                    </div>
                    <span className="sd-action-chevron"><Icon.Chevron /></span>
                  </button>
                </div>
              </div>

              {/* How to Book */}
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <span className="sd-panel-title">How to Book a Slot</span>
                </div>
                <div className="sd-howto-list">
                  {HOW_TO.map(({ step, title, desc, color }) => (
                    <div key={step} className="sd-howto-item">
                      <div className="sd-howto-step" style={{ background: color + '18', color }}>{step}</div>
                      <div>
                        <p className="sd-howto-title">{title}</p>
                        <p className="sd-howto-desc">{desc}</p>
                      </div>
                    </div>
                  ))}
                  <button className="sd-howto-cta" onClick={() => navigate('/parking')}>
                    <Icon.MapPin /> Go to Parking Map
                  </button>
                </div>
              </div>

            </div>

            {/* ── Right column ── */}
            <div className="sd-right-col">

              {/* Recent bookings */}
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <span className="sd-panel-title">Recent Bookings</span>
                  <button className="sd-panel-link" onClick={() => navigate('/my-bookings')}>View all</button>
                </div>
                {loadingStats ? (
                  <div className="sd-booking-list">
                    {[1,2,3].map(i => <div key={i} className="sd-skeleton" style={{ height: 54, borderRadius: 12 }} />)}
                  </div>
                ) : recent.length === 0 ? (
                  <div className="sd-empty-state">
                    <div className="sd-empty-icon"><Icon.EmptyBox /></div>
                    No bookings yet.
                    <button className="sd-empty-link" onClick={() => navigate('/my-bookings')}>
                      Make your first booking →
                    </button>
                  </div>
                ) : (
                  <div className="sd-booking-list">
                    {recent.map(b => (
                      <div key={b.id} className="sd-booking-item">
                        <span className={`sd-booking-dot sd-booking-dot--${b.status}`} />
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <p className="sd-booking-slot">Slot {b.slotNumber}{b.zone ? ` · Zone ${b.zone}` : ''}</p>
                          <p className="sd-booking-time">{fmtShort(b.startTime)}</p>
                        </div>
                        <span className={`sd-booking-status sd-booking-status--${b.status}`}>
                          {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Upcoming bookings */}
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <span className="sd-panel-title">Upcoming Reservations</span>
                </div>
                {loadingStats ? (
                  <div className="sd-booking-list">
                    {[1,2].map(i => <div key={i} className="sd-skeleton" style={{ height: 60, borderRadius: 12 }} />)}
                  </div>
                ) : upcoming.length === 0 ? (
                  <div className="sd-empty-state">
                    <div className="sd-empty-icon">
                      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    No upcoming approved bookings.
                  </div>
                ) : (
                  <div className="sd-booking-list">
                    {upcoming.map(b => (
                      <div key={b.id} className="sd-upcoming-item">
                        <div className="sd-upcoming-badge">{fmtRelative(b.startTime)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="sd-booking-slot">Slot {b.slotNumber}{b.zone ? ` · Zone ${b.zone}` : ''}</p>
                          <p className="sd-booking-time">{fmtShort(b.startTime)} → {fmtShort(b.endTime)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Parking rules */}
              <div className="sd-panel">
                <div className="sd-panel-header">
                  <span className="sd-panel-title">Parking Rules</span>
                  <span className="sd-rules-badge"><Icon.Shield /> Campus Policy</span>
                </div>
                <ul className="sd-rules-list">
                  {RULES.map((r, i) => (
                    <li key={i} className="sd-rule-item">
                      <span className="sd-rule-emoji">{r.icon}</span>
                      <span className="sd-rule-text">{r.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
