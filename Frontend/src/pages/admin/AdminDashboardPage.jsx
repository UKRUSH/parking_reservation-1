import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import { parkingBookingApi } from '../../api/parkingBookingApi'
import { helmetBorrowingApi } from '../../api/helmetBorrowingApi'
import { userApi } from '../../api/userApi'
import { ticketApi } from '../../api/ticketApi'
import '../student/StudentDashboardPage.css'
import './AdminDashboardPage.css'

/* ── Icons ───────────────────────────────────────────────────────────────── */
const Icon = {
  Menu: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
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
        d="M8 14v-4m0 0V6h5a3 3 0 010 6H8z" />
      <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  ),
  Map: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Users: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
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
  Wrench: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Info: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Logout: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Check: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
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

/* ── Admin Sidebar ───────────────────────────────────────────────────────── */
function AdminSidebar({ open, onClose, user, logout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/admin/dashboard',         label: 'Dashboard',          Ico: Icon.Dashboard },
    { path: '/admin/bookings',          label: 'Parking Requests',   Ico: Icon.Bookings  },
    { path: '/admin/parking-management',label: 'Slot Management',    Ico: Icon.Parking   },
    { path: '/parking',                 label: 'Parking Map',        Ico: Icon.Map       },
    { path: '/admin/helmet-borrowings', label: 'Helmet Borrowings',  Ico: Icon.Helmet    },
    { path: '/admin/users',             label: 'User Management',    Ico: Icon.Users     },
    { path: '/tickets',                 label: 'Incident Tickets',   Ico: Icon.Shield    },
    { path: '/notifications',           label: 'Notifications',      Ico: Icon.Bell      },
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
            <div className="sd-sidebar-brand-sub">Admin Portal</div>
          </div>
        </div>

        <div className="sd-sidebar-user">
          <div className="sd-sidebar-avatar">{user?.name?.[0]?.toUpperCase() ?? 'A'}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sd-sidebar-user-name">{user?.name ?? 'Admin'}</div>
            <div className="sd-sidebar-user-role">Administrator</div>
          </div>
        </div>

        <div className="sd-nav-label">Management</div>
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
          <p>You have <strong>admin</strong> access to all campus systems.</p>
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

/* ── Quick-action card ───────────────────────────────────────────────────── */
function ActionCard({ emoji, label, desc, color, bg, onClick }) {
  return (
    <button
      className="ad-action-card"
      style={{ '--ac': color, '--aci': bg }}
      onClick={onClick}
    >
      <div className="ad-action-icon">{emoji}</div>
      <div className="ad-action-label">{label}</div>
      <div className="ad-action-desc">{desc}</div>
      <span className="ad-action-arrow">→</span>
    </button>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Main page
   ══════════════════════════════════════════════════════════════════════════ */
export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Data
  const [bookings,   setBookings]   = useState([])
  const [borrowings, setBorrowings] = useState([])
  const [users,      setUsers]      = useState([])
  const [tickets,    setTickets]    = useState([])
  const [loading,    setLoading]    = useState(true)

  useEffect(() => {
    Promise.allSettled([
      parkingBookingApi.getAll().then(r => setBookings(r.data.data || [])),
      helmetBorrowingApi.getAll().then(r => setBorrowings(r.data.data || [])),
      userApi.getAll().then(r => setUsers(r.data.data || [])),
      ticketApi.getAll().then(r => setTickets(r.data.data || [])),
    ]).finally(() => setLoading(false))
  }, [])

  // Derived stats
  const pendingBookings   = bookings.filter(b => b.status === 'PENDING')
  const approvedBookings  = bookings.filter(b => b.status === 'APPROVED')
  const pendingBorrowings = borrowings.filter(b => b.status === 'PENDING')
  const issuedBorrowings  = borrowings.filter(b => b.status === 'ISSUED')
  const openTickets       = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS')

  const firstName = user?.name?.split(' ')[0] ?? 'Admin'
  const initial   = user?.name?.[0]?.toUpperCase() ?? 'A'

  const ACTIONS = [
    { emoji:'🅿️', label:'Parking Requests',  desc:'Approve or reject student bookings',    color:'#16a34a', bg:'#f0fdf4', path:'/admin/bookings'          },
    { emoji:'🏗️', label:'Slot Management',   desc:'Add, edit and remove parking slots',    color:'#2563eb', bg:'#eff6ff', path:'/admin/parking-management' },
    { emoji:'🗺️', label:'Parking Map',       desc:'Live slot availability across zones',   color:'#0284c7', bg:'#f0f9ff', path:'/parking'                  },
    { emoji:'🪖', label:'Helmet Borrowings', desc:'Issue and track helmet loans',           color:'#d97706', bg:'#fffbeb', path:'/admin/helmet-borrowings'   },
    { emoji:'👥', label:'User Management',   desc:'View users and manage roles',            color:'#7c3aed', bg:'#f5f3ff', path:'/admin/users'              },
    { emoji:'🎫', label:'Incident Tickets',  desc:'Assign technicians, manage reports',     color:'#dc2626', bg:'#fef2f2', path:'/tickets'                  },
    { emoji:'🔔', label:'Notifications',     desc:'View system-wide alerts',                color:'#0891b2', bg:'#ecfeff', path:'/notifications'             },
    { emoji:'⚙️', label:'Parking Config',   desc:'Configure zones and slot settings',      color:'#475569', bg:'#f8fafc', path:'/admin/parking-management'  },
  ]

  return (
    <div className="sd-shell ad-admin">

      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        logout={logout}
      />

      <div className="sd-main">

        {/* ── Topbar ── */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <button className="sd-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
              <Icon.Menu />
            </button>
            <span className="sd-topbar-title">Admin Dashboard</span>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formatDate()}</span>
            <NotificationBell />
            <div className="sd-topbar-avatar" title={user?.name} onClick={() => setSidebarOpen(v => !v)}>
              {initial}
            </div>
          </div>
        </header>

        <div className="sd-body">

          {/* ── Hero ── */}
          <div className="ad-hero">
            <div className="ad-hero-text">
              <div className="ad-hero-badge">
                <span className="ad-hero-badge-dot" />
                Administrator
              </div>
              <h1 className="ad-hero-title">{getGreeting()}, {firstName} 👋</h1>
              <p className="ad-hero-sub">Manage bookings, users, helmets and incidents from one place.</p>
              <button className="ad-hero-cta" onClick={() => navigate('/admin/bookings')}>
                View Pending Requests
              </button>
            </div>

            <div className="ad-hero-visual">
              <div className="ad-hero-shield">🛡️</div>
              <div className="ad-hero-chip ad-hero-chip--tl">🅿️ Parking</div>
              <div className="ad-hero-chip ad-hero-chip--tr">🪖 Helmets</div>
              <div className="ad-hero-chip ad-hero-chip--br">🎫 Tickets</div>
            </div>
          </div>

          {/* ── Stats strip ── */}
          <div className="ad-stats-row">
            <div className="sd-stat-card">
              <div className="sd-stat-icon sd-stat-icon--amber"><Icon.Bookings /></div>
              <div>
                <div className="sd-stat-label">Pending Bookings</div>
                {loading
                  ? <div className="ad-skel" style={{ width:36, height:26, marginTop:2 }} />
                  : <div className="sd-stat-value">{pendingBookings.length}</div>}
              </div>
            </div>
            <div className="sd-stat-card">
              <div className="sd-stat-icon sd-stat-icon--green"><Icon.Check /></div>
              <div>
                <div className="sd-stat-label">Active Bookings</div>
                {loading
                  ? <div className="ad-skel" style={{ width:36, height:26, marginTop:2 }} />
                  : <div className="sd-stat-value">{approvedBookings.length}</div>}
              </div>
            </div>
            <div className="sd-stat-card">
              <div className="sd-stat-icon sd-stat-icon--purple"><Icon.Users /></div>
              <div>
                <div className="sd-stat-label">Total Users</div>
                {loading
                  ? <div className="ad-skel" style={{ width:36, height:26, marginTop:2 }} />
                  : <div className="sd-stat-value">{users.length}</div>}
              </div>
            </div>
            <div className="sd-stat-card">
              <div className="sd-stat-icon sd-stat-icon--red"><Icon.Shield /></div>
              <div>
                <div className="sd-stat-label">Open Tickets</div>
                {loading
                  ? <div className="ad-skel" style={{ width:36, height:26, marginTop:2 }} />
                  : <div className="sd-stat-value">{openTickets.length}</div>}
              </div>
            </div>
          </div>

          {/* ── Main content ── */}
          <div className="ad-content">

            {/* Quick Actions */}
            <div>
              <div className="ad-section-hd">
                <span className="ad-section-title">Quick Actions</span>
              </div>
              <div className="ad-action-grid">
                {ACTIONS.map(a => (
                  <ActionCard key={a.path + a.label} {...a} onClick={() => navigate(a.path)} />
                ))}
              </div>
            </div>

            {/* Pending panels */}
            <div className="ad-grid">

              {/* Pending Bookings */}
              <div className="ad-panel">
                <div className="ad-panel-header">
                  <span className="ad-panel-title">Pending Bookings</span>
                  {pendingBookings.length > 0 && (
                    <span className="ad-panel-badge">{pendingBookings.length} awaiting</span>
                  )}
                </div>
                <div className="ad-panel-body">
                  {loading ? (
                    [1,2,3].map(i => (
                      <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'center', padding:'0.5rem 0.375rem' }}>
                        <div className="ad-skel" style={{ width:8, height:8, borderRadius:'50%', flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div className="ad-skel" style={{ height:13, width:'55%', marginBottom:4 }} />
                          <div className="ad-skel" style={{ height:11, width:'70%' }} />
                        </div>
                      </div>
                    ))
                  ) : pendingBookings.length === 0 ? (
                    <div className="ad-mini-empty">
                      <div className="ad-mini-empty-icon">✅</div>
                      All bookings handled
                    </div>
                  ) : (
                    <>
                      {pendingBookings.slice(0, 5).map(b => (
                        <div key={b.id} className="ad-item">
                          <div className="ad-item-dot ad-item-dot--pending" />
                          <div className="ad-item-main">
                            <div className="ad-item-title">
                              {b.userName ?? 'Student'} — Slot {b.slotNumber ?? '?'}
                              {b.zone ? ` (Zone ${b.zone})` : ''}
                            </div>
                            <div className="ad-item-sub">{fmtShort(b.startTime)} → {fmtShort(b.endTime)}</div>
                          </div>
                          <span className="ad-item-badge ad-item-badge--pending">Pending</span>
                        </div>
                      ))}
                      {pendingBookings.length > 5 && (
                        <button className="ad-section-link" style={{ padding:'0.375rem 0.375rem 0', fontSize:'0.8rem' }}
                          onClick={() => navigate('/admin/bookings')}>
                          +{pendingBookings.length - 5} more → View all
                        </button>
                      )}
                    </>
                  )}
                </div>
                {pendingBookings.length > 0 && (
                  <div style={{ padding:'0 0.75rem 0.75rem' }}>
                    <button
                      onClick={() => navigate('/admin/bookings')}
                      style={{ width:'100%', background:'#fef2f2', border:'1.5px solid #fecaca', color:'#dc2626', fontWeight:600, fontSize:'0.8125rem', padding:'0.5rem', borderRadius:'10px', cursor:'pointer' }}
                    >
                      Review All Pending →
                    </button>
                  </div>
                )}
              </div>

              {/* Pending Helmet Borrowings */}
              <div className="ad-panel">
                <div className="ad-panel-header">
                  <span className="ad-panel-title">Helmet Borrowings</span>
                  {(pendingBorrowings.length + issuedBorrowings.length) > 0 && (
                    <span className="ad-panel-badge">{pendingBorrowings.length} pending</span>
                  )}
                </div>
                <div className="ad-panel-body">
                  {loading ? (
                    [1,2,3].map(i => (
                      <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'center', padding:'0.5rem 0.375rem' }}>
                        <div className="ad-skel" style={{ width:8, height:8, borderRadius:'50%', flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div className="ad-skel" style={{ height:13, width:'55%', marginBottom:4 }} />
                          <div className="ad-skel" style={{ height:11, width:'40%' }} />
                        </div>
                      </div>
                    ))
                  ) : pendingBorrowings.length === 0 && issuedBorrowings.length === 0 ? (
                    <div className="ad-mini-empty">
                      <div className="ad-mini-empty-icon">🪖</div>
                      No pending helmet requests
                    </div>
                  ) : (
                    [...pendingBorrowings, ...issuedBorrowings].slice(0, 5).map(b => (
                      <div key={b.id} className="ad-item">
                        <div className={`ad-item-dot ad-item-dot--${b.status.toLowerCase()}`} />
                        <div className="ad-item-main">
                          <div className="ad-item-title">
                            {b.userName ?? 'Student'} — {b.quantity === 2 ? '2 helmets' : '1 helmet'}
                          </div>
                          <div className="ad-item-sub">
                            {b.slotNumber ? `Slot ${b.slotNumber}` : b.purpose || 'No purpose'}
                          </div>
                        </div>
                        <span className={`ad-item-badge ad-item-badge--${b.status.toLowerCase()}`}>
                          {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {(pendingBorrowings.length + issuedBorrowings.length) > 0 && (
                  <div style={{ padding:'0 0.75rem 0.75rem' }}>
                    <button
                      onClick={() => navigate('/admin/helmet-borrowings')}
                      style={{ width:'100%', background:'#fffbeb', border:'1.5px solid #fde68a', color:'#d97706', fontWeight:600, fontSize:'0.8125rem', padding:'0.5rem', borderRadius:'10px', cursor:'pointer' }}
                    >
                      Manage Helmets →
                    </button>
                  </div>
                )}
              </div>

              {/* Open Tickets */}
              <div className="ad-panel">
                <div className="ad-panel-header">
                  <span className="ad-panel-title">Open Tickets</span>
                  {openTickets.length > 0 && (
                    <span className="ad-panel-badge">{openTickets.length} open</span>
                  )}
                </div>
                <div className="ad-panel-body">
                  {loading ? (
                    [1,2].map(i => (
                      <div key={i} style={{ display:'flex', gap:'0.75rem', alignItems:'center', padding:'0.5rem 0.375rem' }}>
                        <div className="ad-skel" style={{ width:8, height:8, borderRadius:'50%', flexShrink:0 }} />
                        <div style={{ flex:1 }}>
                          <div className="ad-skel" style={{ height:13, width:'65%', marginBottom:4 }} />
                          <div className="ad-skel" style={{ height:11, width:'40%' }} />
                        </div>
                      </div>
                    ))
                  ) : openTickets.length === 0 ? (
                    <div className="ad-mini-empty">
                      <div className="ad-mini-empty-icon">🎫</div>
                      No open tickets
                    </div>
                  ) : (
                    openTickets.slice(0, 4).map(t => (
                      <div key={t.id} className="ad-item">
                        <div className="ad-item-dot ad-item-dot--open" />
                        <div className="ad-item-main">
                          <div className="ad-item-title">{t.title ?? `Ticket #${t.id}`}</div>
                          <div className="ad-item-sub">{t.reporterName ?? 'Student'} · {fmtShort(t.createdAt)}</div>
                        </div>
                        <span className="ad-item-badge ad-item-badge--open">
                          {t.status === 'IN_PROGRESS' ? 'In Progress' : 'Open'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
                {openTickets.length > 0 && (
                  <div style={{ padding:'0 0.75rem 0.75rem' }}>
                    <button
                      onClick={() => navigate('/tickets')}
                      style={{ width:'100%', background:'#fef2f2', border:'1.5px solid #fecaca', color:'#dc2626', fontWeight:600, fontSize:'0.8125rem', padding:'0.5rem', borderRadius:'10px', cursor:'pointer' }}
                    >
                      Manage Tickets →
                    </button>
                  </div>
                )}
              </div>

              {/* System summary */}
              <div className="ad-panel">
                <div className="ad-panel-header">
                  <span className="ad-panel-title">System Summary</span>
                </div>
                <div className="ad-panel-body" style={{ gap:'0.625rem' }}>
                  {[
                    { label:'Total Bookings',    val: bookings.length,      icon:'📋', color:'#2563eb' },
                    { label:'Total Borrowings',  val: borrowings.length,    icon:'🪖', color:'#d97706' },
                    { label:'Registered Users',  val: users.length,         icon:'👥', color:'#7c3aed' },
                    { label:'Total Tickets',     val: tickets.length,       icon:'🎫', color:'#dc2626' },
                    { label:'Helmets Issued',    val: issuedBorrowings.length, icon:'✅', color:'#16a34a' },
                    { label:'Bookings Approved', val: approvedBookings.length, icon:'🟢', color:'#16a34a' },
                  ].map(({ label, val, icon, color }) => (
                    <div key={label} style={{ display:'flex', alignItems:'center', gap:'0.75rem', padding:'0.375rem 0.375rem', borderRadius:8 }}>
                      <span style={{ fontSize:'1.1rem', width:24, textAlign:'center', flexShrink:0 }}>{icon}</span>
                      <span style={{ flex:1, fontSize:'0.8125rem', color:'#475569', fontWeight:500 }}>{label}</span>
                      {loading
                        ? <div className="ad-skel" style={{ width:28, height:18 }} />
                        : <span style={{ fontSize:'1rem', fontWeight:800, color }}>{val}</span>}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
