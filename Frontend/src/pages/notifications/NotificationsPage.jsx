import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { notificationApi } from '../../api/notificationApi'
import { useNotifications } from '../../context/NotificationContext'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import '../student/StudentDashboardPage.css'
import '../admin/AdminDashboardPage.css'
import '../technician/TechnicianDashboardPage.css'
import './NotificationsPage.css'

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
  Map: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
  Clock: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="12" height="12">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Wrench: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Parking: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v-4m0 0V6h5a3 3 0 010 6H8z" />
      <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  ),
  Users: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
}

/* ── Notification type config ─────────────────────────────────────────────── */
const TYPE_CONFIG = {
  BOOKING_APPROVED:    { emoji: '✅', bg: '#dcfce7', label: 'Booking Approved'    },
  BOOKING_REJECTED:    { emoji: '❌', bg: '#fee2e2', label: 'Booking Rejected'    },
  BOOKING_CANCELLED:   { emoji: '🚫', bg: '#f1f5f9', label: 'Booking Cancelled'  },
  BOOKING_REMINDER:    { emoji: '⏰', bg: '#fefce8', label: 'Booking Reminder'    },
  BOOKING_ENDING_SOON: { emoji: '⚡', bg: '#fff7ed', label: 'Ending Soon'         },
  BOOKING_ENDED:       { emoji: '🏁', bg: '#f1f5f9', label: 'Booking Ended'      },
  HELMET_ISSUED:       { emoji: '🪖', bg: '#fff7ed', label: 'Helmet Issued'       },
  HELMET_REJECTED:     { emoji: '🚫', bg: '#fee2e2', label: 'Helmet Rejected'     },
  HELMET_RETURNED:     { emoji: '✅', bg: '#dcfce7', label: 'Helmet Returned'     },
  TICKET_CREATED:       { emoji: '🎟️', bg: '#faf5ff', label: 'New Ticket'        },
  TICKET_ASSIGNED:      { emoji: '🔧', bg: '#ecfdf5', label: 'Ticket Assigned'   },
  TICKET_STATUS_CHANGED:{ emoji: '🎫', bg: '#f5f3ff', label: 'Ticket Updated'    },
  TICKET_COMMENT_ADDED: { emoji: '💬', bg: '#eff6ff', label: 'New Comment'       },
}

const defaultType = { emoji: '🔔', bg: '#f1f5f9', label: 'Notification' }

function typeConfig(type) {
  return TYPE_CONFIG[type] ?? defaultType
}

function fmtRelTime(dt) {
  if (!dt) return '—'
  const diff = Date.now() - new Date(dt).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins < 1)   return 'Just now'
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7)   return `${days}d ago`
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
function Sidebar({ open, onClose, user, logout, unreadCount, isAdmin, isTech }) {
  const navigate  = useNavigate()
  const location  = useLocation()

  const navItems = isAdmin
    ? [
        { path: '/admin/dashboard',          label: 'Dashboard',         Ico: Icon.Dashboard },
        { path: '/admin/bookings',           label: 'Parking Requests',  Ico: Icon.Bookings  },
        { path: '/admin/parking-management', label: 'Slot Management',   Ico: Icon.Parking   },
        { path: '/parking',                  label: 'Parking Map',       Ico: Icon.Map       },
        { path: '/admin/helmet-borrowings',  label: 'Helmet Borrowings', Ico: Icon.Helmet    },
        { path: '/admin/users',              label: 'User Management',   Ico: Icon.Users     },
        { path: '/tickets',                  label: 'Incident Tickets',  Ico: Icon.Shield    },
        { path: '/notifications',            label: 'Notifications',     Ico: Icon.Bell, badge: unreadCount || null },
      ]
    : isTech
    ? [
        { path: '/technician/dashboard', label: 'Dashboard',        Ico: Icon.Wrench },
        { path: '/tickets',              label: 'Assigned Tickets', Ico: Icon.Shield },
        { path: '/notifications',        label: 'Notifications',    Ico: Icon.Bell, badge: unreadCount || null },
      ]
    : [
        { path: '/student/dashboard', label: 'Dashboard',         Ico: Icon.Dashboard },
        { path: '/my-bookings',       label: 'My Bookings',       Ico: Icon.Bookings  },
        { path: '/parking',           label: 'Find Parking',      Ico: Icon.Map       },
        { path: '/my-borrowings',     label: 'Helmet Borrowings', Ico: Icon.Helmet    },
        { path: '/tickets',           label: 'Incident Tickets',  Ico: Icon.Shield    },
        { path: '/notifications',     label: 'Notifications',     Ico: Icon.Bell, badge: unreadCount || null },
      ]

  const go = (path) => { navigate(path); onClose() }
  const roleLabel = isAdmin ? 'Administrator' : isTech ? 'Technician' : 'Student'
  const portalLabel = isAdmin ? 'Admin Portal' : isTech ? 'Technician Portal' : 'Parking Portal'

  return (
    <>
      <div className={`sd-overlay ${open ? '' : 'hidden'}`} onClick={onClose} />
      <aside className={`sd-sidebar ${open ? 'open' : ''}`}>
        <div className="sd-sidebar-header">
          <div className="sd-sidebar-logo">SC</div>
          <div>
            <div className="sd-sidebar-brand">Smart Campus</div>
            <div className="sd-sidebar-brand-sub">{portalLabel}</div>
          </div>
        </div>

        <div className="sd-sidebar-user">
          <div className="sd-sidebar-avatar">{user?.name?.[0]?.toUpperCase() ?? '?'}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sd-sidebar-user-name">{user?.name ?? 'User'}</div>
            <div className="sd-sidebar-user-role">{roleLabel}</div>
          </div>
        </div>

        <div className="sd-nav-label">{isAdmin ? 'Management' : isTech ? 'Navigation' : 'Menu'}</div>
        <ul className="sd-nav">
          {navItems.map(({ path, label, Ico, badge }) => (
            <li key={path}>
              <button
                className={`sd-nav-item ${location.pathname === path ? 'active' : ''}`}
                onClick={() => go(path)}
              >
                <Ico />
                {label}
                {badge ? <span className="sd-nav-badge sd-nav-badge--purple">{badge}</span> : null}
              </button>
            </li>
          ))}
        </ul>

        <div className="sd-sidebar-tip">
          <div className="sd-sidebar-tip-icon"><Icon.Info /></div>
          <p>{isTech
            ? 'Notifications alert you when tickets are assigned or updated.'
            : isAdmin
            ? 'Notifications keep you informed of system activity and requests.'
            : 'Notifications keep you updated on bookings and helmet requests.'
          }</p>
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

/* ── Skeleton loader ─────────────────────────────────────────────────────── */
function SkeletonList() {
  return (
    <div className="nt-skeleton">
      {[120, 90, 150, 100].map((w, i) => (
        <div key={i} className="nt-skeleton-card">
          <div className="nt-skel" style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="nt-skel" style={{ height: 14, width: `${w}px`, maxWidth: '60%' }} />
            <div className="nt-skel" style={{ height: 12, width: '80%' }} />
            <div className="nt-skel" style={{ height: 10, width: 80 }} />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Main page
   ══════════════════════════════════════════════════════════════════════════ */
export default function NotificationsPage() {
  const { user, logout, hasRole }    = useAuth()
  const navigate                     = useNavigate()
  const { fetchUnreadCount }         = useNotifications()

  const isAdmin = hasRole('ADMIN')
  const isTech  = hasRole('TECHNICIAN')

  const [notifications, setNotifications] = useState([])
  const [loading, setLoading]             = useState(true)
  const [filter, setFilter]               = useState('ALL')
  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [busyId, setBusyId]               = useState(null)

  const load = () => {
    setLoading(true)
    notificationApi.getAll()
      .then(res => setNotifications(res.data.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    setBusyId(id + '-read')
    try {
      await notificationApi.markAsRead(id)
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
      fetchUnreadCount()
    } finally { setBusyId(null) }
  }

  const markAll = async () => {
    await notificationApi.markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    fetchUnreadCount()
  }

  const remove = async (id) => {
    setBusyId(id + '-del')
    try {
      await notificationApi.delete(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
      fetchUnreadCount()
    } finally { setBusyId(null) }
  }

  // Derived
  const unread    = notifications.filter(n => !n.read).length
  const displayed = notifications.filter(n => {
    if (filter === 'UNREAD') return !n.read
    if (filter === 'READ')   return n.read
    return true
  })

  const shellClass = isAdmin ? 'sd-shell ad-admin' : isTech ? 'sd-shell td-tech' : 'sd-shell'

  return (
    <div className={shellClass}>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        logout={logout}
        unreadCount={unread}
        isAdmin={isAdmin}
        isTech={isTech}
      />

      <div className="sd-main">

        {/* ── Topbar ── */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <button className="sd-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
              <Icon.Menu />
            </button>
            <span className="sd-topbar-title">Notifications</span>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formatDate()}</span>
            <NotificationBell />
            <div className="sd-topbar-avatar" title={user?.name} onClick={() => setSidebarOpen(v => !v)}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
        </header>

        <div className="sd-body">

          {/* ── Hero ── */}
          <div className="nt-hero">
            <div className="nt-hero-text">
              <div className="nt-hero-eyebrow">Smart Campus · Alerts</div>
              <h1 className="nt-hero-title">Notifications</h1>
              <p className="nt-hero-sub">
                {unread > 0
                  ? `You have ${unread} unread notification${unread !== 1 ? 's' : ''}`
                  : 'All caught up — no unread notifications'}
              </p>
            </div>

            <div className="nt-hero-visual">
              <div className="nt-hero-bell">🔔</div>
              <div className="nt-hero-chip nt-hero-chip--tl">
                <span className="nt-hero-chip-dot" />
                Bookings
              </div>
              <div className="nt-hero-chip nt-hero-chip--tr">
                <span className="nt-hero-chip-dot" />
                Helmets
              </div>
              <div className="nt-hero-chip nt-hero-chip--br">
                <span className="nt-hero-chip-dot" />
                Tickets
              </div>
            </div>
          </div>

          {/* ── Stats strip ── */}
          <div className="nt-stats-row">
            {[
              { label: 'Total',  color: 'sd-stat-icon--blue',  val: notifications.length },
              { label: 'Unread', color: 'sd-stat-icon--purple', val: unread },
              { label: 'Read',   color: 'sd-stat-icon--green', val: notifications.length - unread },
            ].map(({ label, color, val }) => (
              <div key={label} className="sd-stat-card">
                <div className={`sd-stat-icon ${color}`}>
                  <Icon.Bell />
                </div>
                <div>
                  <div className="sd-stat-label">{label}</div>
                  <div className="sd-stat-value">{val}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Content ── */}
          <div className="nt-content">

            {/* Toolbar */}
            <div className="nt-toolbar">
              <div className="nt-filter-tabs">
                {['ALL', 'UNREAD', 'READ'].map(f => (
                  <button
                    key={f}
                    className={`nt-filter-tab ${filter === f ? 'active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'ALL'    ? `All (${notifications.length})` : null}
                    {f === 'UNREAD' ? `Unread (${unread})` : null}
                    {f === 'READ'   ? `Read (${notifications.length - unread})` : null}
                  </button>
                ))}
              </div>
              {unread > 0 && (
                <button className="nt-mark-all-btn" onClick={markAll}>
                  ✓ Mark all as read
                </button>
              )}
            </div>

            {/* List */}
            {loading ? (
              <SkeletonList />
            ) : displayed.length === 0 ? (
              <div className="nt-empty">
                <div className="nt-empty-icon">
                  {filter === 'UNREAD' ? '📭' : filter === 'READ' ? '📬' : '🔕'}
                </div>
                <div className="nt-empty-title">
                  {filter === 'UNREAD' ? 'No unread notifications'
                  : filter === 'READ'  ? 'No read notifications yet'
                  : 'No notifications yet'}
                </div>
                <div className="nt-empty-desc">
                  {filter === 'ALL'
                    ? 'Notifications about bookings, helmets, and tickets will appear here.'
                    : 'Try a different filter.'}
                </div>
              </div>
            ) : (
              <>
                <div className="nt-section-label">
                  {displayed.length} notification{displayed.length !== 1 ? 's' : ''}
                </div>
                <div className="nt-list">
                  {displayed.map(n => {
                    const tc = typeConfig(n.type)
                    return (
                      <div
                        key={n.id}
                        className={`nt-card ${n.read ? '' : 'nt-card--unread'}`}
                        onClick={() => !n.read && markRead(n.id)}
                        style={{ cursor: n.read ? 'default' : 'pointer' }}
                      >
                        {/* Icon */}
                        <div className="nt-icon-wrap" style={{ background: tc.bg }}>
                          {tc.emoji}
                        </div>

                        {/* Content */}
                        <div className="nt-card-content">
                          <div className="nt-card-title">{n.title}</div>
                          <div className="nt-card-msg">{n.message}</div>
                          <div className="nt-card-meta">
                            <span className="nt-card-time">
                              <Icon.Clock /> {fmtRelTime(n.createdAt)}
                            </span>
                            {!n.read && <span className="nt-card-unread-dot" />}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="nt-card-actions" onClick={e => e.stopPropagation()}>
                          {!n.read && (
                            <button
                              className="nt-read-btn"
                              onClick={() => markRead(n.id)}
                              disabled={busyId === n.id + '-read'}
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            className="nt-del-btn"
                            onClick={() => remove(n.id)}
                            disabled={busyId === n.id + '-del'}
                          >
                            {busyId === n.id + '-del' ? '…' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
