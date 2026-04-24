import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { helmetBorrowingApi } from '../../api/helmetBorrowingApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import '../student/StudentDashboardPage.css'
import './MyBorrowingsPage.css'

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
  Helmet: () => (
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
  Refresh: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
function Sidebar({ open, onClose, user, logout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/student/dashboard', label: 'Dashboard',         Ico: Icon.Dashboard },
    { path: '/my-bookings',       label: 'My Bookings',       Ico: Icon.Bookings  },
    { path: '/parking',           label: 'Find Parking',      Ico: Icon.Parking   },
    { path: '/my-borrowings',     label: 'Helmet Borrowings', Ico: Icon.Helmet    },
    { path: '/notifications',     label: 'Notifications',     Ico: Icon.Bell      },
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
          {navItems.map(({ path, label, Ico }) => (
            <li key={path}>
              <button
                className={`sd-nav-item ${location.pathname === path ? 'active' : ''}`}
                onClick={() => go(path)}
              >
                <Ico />
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="sd-sidebar-tip">
          <div className="sd-sidebar-tip-icon"><Icon.Info /></div>
          <p>Helmet requests are made through <strong>Motorcycle bookings</strong>.</p>
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

/* ── Status config ───────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  PENDING:   { label: 'Pending',   color: '#b45309', bg: '#fef3c7', border: '#fde68a', dot: '#f59e0b', accent: '#f59e0b' },
  ISSUED:    { label: 'Issued',    color: '#1d4ed8', bg: '#eff6ff', border: '#bfdbfe', dot: '#3b82f6', accent: '#3b82f6' },
  REJECTED:  { label: 'Rejected',  color: '#dc2626', bg: '#fee2e2', border: '#fecaca', dot: '#ef4444', accent: '#ef4444' },
  RETURNED:  { label: 'Returned',  color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', dot: '#22c55e', accent: '#22c55e' },
  CANCELLED: { label: 'Cancelled', color: '#64748b', bg: '#f1f5f9', border: '#e2e8f0', dot: '#94a3b8', accent: '#94a3b8' },
}

/* ── Page ────────────────────────────────────────────────────────────────── */
export default function MyBorrowingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [borrowings, setBorrowings]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [cancelling, setCancelling]   = useState(null)

  const load = () => {
    setLoading(true)
    helmetBorrowingApi.getAll()
      .then(res => setBorrowings(res.data.data || []))
      .catch(() => setBorrowings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCancel = (id) => {
    setCancelling(id)
    helmetBorrowingApi.cancel(id)
      .then(() => load())
      .catch(() => {})
      .finally(() => setCancelling(null))
  }

  const total    = borrowings.length
  const pending  = borrowings.filter(b => b.status === 'PENDING').length
  const issued   = borrowings.filter(b => b.status === 'ISSUED').length
  const returned = borrowings.filter(b => b.status === 'RETURNED').length
  const initial  = user?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className="sd-shell">

      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        logout={logout}
      />

      <div className="sd-main">

        {/* Topbar */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <button className="sd-hamburger" onClick={() => setSidebarOpen(o => !o)} aria-label="Toggle menu">
              {sidebarOpen ? <Icon.X /> : <Icon.Menu />}
            </button>
            <span className="sd-topbar-title">Helmet Borrowings</span>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formatDate()}</span>
            <NotificationBell />
            <div className="sd-topbar-avatar" title={user?.name}>{initial}</div>
          </div>
        </header>

        <div className="sd-body">

          {/* Hero */}
          <div className="mb-hero">
            <div className="mb-hero-text">
              <p className="mb-hero-eyebrow">Campus Helmet Service</p>
              <h1 className="mb-hero-title">🪖 My Borrowings</h1>
              <p className="mb-hero-sub">Track and manage your helmet loan requests in real time.</p>
              <button className="mb-hero-cta" onClick={() => navigate('/my-bookings')}>
                + New Request via Bookings
              </button>
            </div>

            <div className="mb-hero-visual">
              <div className="mb-hero-helmet">
                <svg viewBox="0 0 140 110" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <ellipse cx="70" cy="68" rx="54" ry="30" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.25)" strokeWidth="2"/>
                  <path d="M24 68 Q24 28 70 20 Q116 28 116 68" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth="2"/>
                  <rect x="36" y="64" width="68" height="10" rx="5" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5"/>
                  <ellipse cx="70" cy="44" rx="26" ry="12" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.18)" strokeWidth="1"/>
                  <path d="M52 30 Q70 24 88 30" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="mb-hero-chip mb-hero-chip--tl">🏍️ Motorcycle</div>
              <div className="mb-hero-chip mb-hero-chip--tr">🪖 Safety First</div>
              <div className="mb-hero-chip mb-hero-chip--br">
                <span className="mb-hero-chip-dot" />Campus Service
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mb-stats-row">
            <div className="sd-stat-card">
              <div className="sd-stat-icon" style={{ background: '#fff7ed', color: '#ea580c' }}>
                <Icon.Helmet />
              </div>
              <div>
                <p className="sd-stat-label">Total</p>
                {loading
                  ? <div className="sd-skeleton" style={{ width: 36, height: 26 }} />
                  : <p className="sd-stat-value">{total}</p>}
              </div>
            </div>
            <div className="sd-stat-card">
              <div className="sd-stat-icon sd-stat-icon--amber"><Icon.Clock /></div>
              <div>
                <p className="sd-stat-label">Pending</p>
                {loading
                  ? <div className="sd-skeleton" style={{ width: 28, height: 26 }} />
                  : <p className="sd-stat-value">{pending}</p>}
              </div>
            </div>
            <div className="sd-stat-card">
              <div className="sd-stat-icon sd-stat-icon--blue"><Icon.Helmet /></div>
              <div>
                <p className="sd-stat-label">Issued</p>
                {loading
                  ? <div className="sd-skeleton" style={{ width: 28, height: 26 }} />
                  : <p className="sd-stat-value">{issued}</p>}
              </div>
            </div>
            <div className="sd-stat-card">
              <div className="sd-stat-icon sd-stat-icon--green"><Icon.Check /></div>
              <div>
                <p className="sd-stat-label">Returned</p>
                {loading
                  ? <div className="sd-skeleton" style={{ width: 28, height: 26 }} />
                  : <p className="sd-stat-value">{returned}</p>}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="mb-content">

            {/* Info banner */}
            <div className="mb-info-banner">
              <span className="mb-info-icon">🪖</span>
              <div>
                <p className="mb-info-title">Helmet requests are made through Motorcycle bookings</p>
                <p className="mb-info-desc">
                  When reserving a Motorcycle parking slot, you can optionally request a campus helmet at the same time.{' '}
                  <button className="mb-info-link" onClick={() => navigate('/my-bookings')}>
                    Go to My Bookings →
                  </button>
                </p>
              </div>
            </div>

            {/* List header */}
            <div className="mb-list-header">
              <span className="mb-list-title">All Borrowings</span>
              <button className="mb-list-refresh" onClick={load}>
                <Icon.Refresh /> Refresh
              </button>
            </div>

            {/* Borrowing list */}
            {loading ? (
              <div className="mb-list">
                {[1, 2, 3].map(i => (
                  <div key={i} className="sd-skeleton" style={{ height: 110, borderRadius: 16 }} />
                ))}
              </div>
            ) : borrowings.length === 0 ? (
              <div className="mb-empty">
                <div className="mb-empty-icon">🪖</div>
                <p className="mb-empty-title">No helmet borrowings yet</p>
                <p className="mb-empty-desc">Book a Motorcycle slot to request a campus helmet.</p>
                <button className="mb-empty-cta" onClick={() => navigate('/my-bookings')}>
                  Go to My Bookings →
                </button>
              </div>
            ) : (
              <div className="mb-list">
                {borrowings.map(b => {
                  const s = STATUS_CONFIG[b.status] ?? STATUS_CONFIG.CANCELLED
                  const isCancelling = cancelling === b.id
                  return (
                    <div key={b.id} className="mb-card" style={{ '--accent': s.accent }}>
                      <div className="mb-card-accent" />
                      <div className="mb-card-inner">

                        <div className="mb-card-top">
                          <div className="mb-card-icon">🪖</div>
                          <div className="mb-card-title-block">
                            <p className="mb-card-title">
                              {b.slotNumber
                                ? `Slot ${b.slotNumber}${b.zone ? ` · Zone ${b.zone}` : ''}`
                                : `Helmet Request #${b.id}`}
                            </p>
                            <p className="mb-card-qty">{b.quantity === 2 ? '2 helmets' : '1 helmet'}</p>
                          </div>
                          <span
                            className="mb-card-badge"
                            style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}
                          >
                            <span className="mb-card-badge-dot" style={{ background: s.dot }} />
                            {s.label}
                          </span>
                        </div>

                        {b.purpose && (
                          <p className="mb-card-purpose">Purpose: {b.purpose}</p>
                        )}

                        <div className="mb-card-timeline">
                          {b.bookingStart && (
                            <div className="mb-timeline-item">
                              <span className="mb-timeline-label">Parking</span>
                              <span className="mb-timeline-value">
                                {fmt(b.bookingStart)} → {fmt(b.bookingEnd)}
                              </span>
                            </div>
                          )}
                          <div className="mb-timeline-item">
                            <span className="mb-timeline-label">Requested</span>
                            <span className="mb-timeline-value">{fmt(b.createdAt)}</span>
                          </div>
                          {b.issuedAt && (
                            <div className="mb-timeline-item">
                              <span className="mb-timeline-label" style={{ color: '#3b82f6' }}>Issued</span>
                              <span className="mb-timeline-value" style={{ color: '#2563eb' }}>{fmt(b.issuedAt)}</span>
                            </div>
                          )}
                          {b.returnedAt && (
                            <div className="mb-timeline-item">
                              <span className="mb-timeline-label" style={{ color: '#16a34a' }}>Returned</span>
                              <span className="mb-timeline-value" style={{ color: '#16a34a' }}>{fmt(b.returnedAt)}</span>
                            </div>
                          )}
                        </div>

                        {b.rejectionReason && (
                          <div className="mb-card-rejection">
                            Reason: {b.rejectionReason}
                          </div>
                        )}

                        {b.status === 'PENDING' && (
                          <div className="mb-card-actions">
                            <button
                              className="mb-cancel-btn"
                              onClick={() => handleCancel(b.id)}
                              disabled={isCancelling}
                            >
                              {isCancelling ? 'Cancelling…' : 'Cancel Request'}
                            </button>
                          </div>
                        )}

                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
