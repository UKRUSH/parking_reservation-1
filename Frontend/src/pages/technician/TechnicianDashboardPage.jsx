import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import { ticketApi } from '../../api/ticketApi'
import '../student/StudentDashboardPage.css'
import './TechnicianDashboardPage.css'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const Icon = {
  Menu: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
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
  Wrench: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

/* ── Helpers ──────────────────────────────────────────────────────────────── */
function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

const STATUS_BADGE = {
  OPEN:        'tdp-badge tdp-badge--open',
  IN_PROGRESS: 'tdp-badge tdp-badge--progress',
  RESOLVED:    'tdp-badge tdp-badge--resolved',
  CLOSED:      'tdp-badge tdp-badge--closed',
  REJECTED:    'tdp-badge tdp-badge--rejected',
}

const PRIORITY_BADGE = {
  LOW:      'tdp-pri tdp-pri--low',
  MEDIUM:   'tdp-pri tdp-pri--medium',
  HIGH:     'tdp-pri tdp-pri--high',
  CRITICAL: 'tdp-pri tdp-pri--critical',
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
function TechSidebar({ open, onClose, user, logout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/technician/dashboard', label: 'Dashboard',        Ico: Icon.Wrench },
    { path: '/tickets',              label: 'Assigned Tickets', Ico: Icon.Shield },
    { path: '/notifications',        label: 'Notifications',    Ico: Icon.Bell   },
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
            <div className="sd-sidebar-brand-sub">Technician Portal</div>
          </div>
        </div>

        <div className="sd-sidebar-user">
          <div className="sd-sidebar-avatar">{user?.name?.[0]?.toUpperCase() ?? 'T'}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sd-sidebar-user-name">{user?.name ?? 'Technician'}</div>
            <div className="sd-sidebar-user-role">Technician</div>
          </div>
        </div>

        <div className="sd-nav-label">Navigation</div>
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
          <p>Update ticket status after completing repairs to notify the reporter.</p>
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

/* ── Skeleton rows ────────────────────────────────────────────────────────── */
function SkeletonRows() {
  return Array.from({ length: 4 }).map((_, i) => (
    <tr key={i}>
      {[40, 180, 90, 70, 130].map((w, j) => (
        <td key={j} style={{ padding: '0.875rem 1.125rem' }}>
          <span className="tdp-skel" style={{ width: w }} />
        </td>
      ))}
      <td style={{ padding: '0.875rem 1.125rem' }}>
        <span className="tdp-skel" style={{ width: 60 }} />
      </td>
    </tr>
  ))
}

/* ── Main page ────────────────────────────────────────────────────────────── */
export default function TechnicianDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tickets, setTickets]         = useState([])
  const [loading, setLoading]         = useState(true)

  useEffect(() => {
    ticketApi.getAll()
      .then(res => setTickets(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const inProgress = tickets.filter(t => t.status === 'IN_PROGRESS').length
  const resolved   = tickets.filter(t => t.status === 'RESOLVED').length
  const open       = tickets.filter(t => t.status === 'OPEN').length
  const total      = tickets.length

  const firstName = user?.name?.split(' ')[0] ?? 'Technician'

  return (
    <div className="sd-shell td-tech">
      <TechSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        logout={logout}
      />

      <div className="sd-main">
        {/* Topbar */}
        <header className="sd-topbar">
          <button className="sd-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Icon.Menu />
          </button>
          <div className="sd-topbar-title">Technician Dashboard</div>
          <div className="sd-topbar-right">
            <NotificationBell />
          </div>
        </header>

        {/* Hero */}
        <div className="tdp-hero">
          <div className="tdp-hero-text">
            <div className="tdp-hero-eyebrow">Technician Portal · Dashboard</div>
            <h1 className="tdp-hero-title">Welcome, {firstName} 👋</h1>
            <p className="tdp-hero-sub">Here are all tickets assigned to you. Update their status as you work through them.</p>
          </div>
          <div className="tdp-hero-visual">
            <div className="tdp-hero-icon">🔧</div>
            <span className="tdp-hero-chip tdp-hero-chip--tl">🔵 {open} Open</span>
            <span className="tdp-hero-chip tdp-hero-chip--tr">🟡 {inProgress} In Progress</span>
            <span className="tdp-hero-chip tdp-hero-chip--br">✅ {resolved} Resolved</span>
          </div>
        </div>

        {/* Stats */}
        <div className="tdp-stats">
          <div className="tdp-stat-card">
            <div className="tdp-stat-icon tdp-stat-icon--slate">📋</div>
            <div>
              <div className="tdp-stat-val">{loading ? <span className="tdp-skel" style={{ width: 32, display: 'inline-block' }} /> : total}</div>
              <div className="tdp-stat-label">Total Assigned</div>
            </div>
          </div>
          <div className="tdp-stat-card">
            <div className="tdp-stat-icon tdp-stat-icon--teal">🔵</div>
            <div>
              <div className="tdp-stat-val">{loading ? <span className="tdp-skel" style={{ width: 32, display: 'inline-block' }} /> : open}</div>
              <div className="tdp-stat-label">Open</div>
            </div>
          </div>
          <div className="tdp-stat-card">
            <div className="tdp-stat-icon tdp-stat-icon--amber">🟡</div>
            <div>
              <div className="tdp-stat-val">{loading ? <span className="tdp-skel" style={{ width: 32, display: 'inline-block' }} /> : inProgress}</div>
              <div className="tdp-stat-label">In Progress</div>
            </div>
          </div>
          <div className="tdp-stat-card">
            <div className="tdp-stat-icon tdp-stat-icon--green">✅</div>
            <div>
              <div className="tdp-stat-val">{loading ? <span className="tdp-skel" style={{ width: 32, display: 'inline-block' }} /> : resolved}</div>
              <div className="tdp-stat-label">Resolved</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="tdp-content">
          <div className="tdp-section-hd">
            <div className="tdp-section-title">Assigned Tickets</div>
            <button className="tdp-section-link" onClick={() => navigate('/tickets')}>
              View all →
            </button>
          </div>

          <div className="tdp-panel">
            <table className="tdp-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Title</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading && <SkeletonRows />}

                {!loading && tickets.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <div className="tdp-empty">
                        <div className="tdp-empty-icon">🎉</div>
                        <div className="tdp-empty-title">No tickets assigned yet</div>
                        <div className="tdp-empty-sub">An admin will assign tickets to you. Check back soon.</div>
                      </div>
                    </td>
                  </tr>
                )}

                {!loading && tickets.map(t => (
                  <tr key={t.id}>
                    <td><span className="tdp-ticket-id">#{t.id}</span></td>
                    <td>
                      <div className="tdp-ticket-title">{t.title}</div>
                      {t.location && <div className="tdp-ticket-loc">📍 {t.location}</div>}
                    </td>
                    <td>
                      <span className={STATUS_BADGE[t.status] ?? 'tdp-badge'}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <span className={PRIORITY_BADGE[t.priority] ?? 'tdp-pri'}>
                        {t.priority}
                      </span>
                    </td>
                    <td><span className="tdp-ticket-date">{fmt(t.createdAt)}</span></td>
                    <td>
                      <button
                        className="tdp-btn-view"
                        onClick={() => navigate(`/tickets/${t.id}`)}
                      >
                        Open →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
