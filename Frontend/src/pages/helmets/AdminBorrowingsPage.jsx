import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { helmetBorrowingApi } from '../../api/helmetBorrowingApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import '../student/StudentDashboardPage.css'
import '../admin/AdminDashboardPage.css'
import './AdminBorrowingsPage.css'

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
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v-4m0 0V6h5a3 3 0 010 6H8z" />
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
  Refresh: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  Search: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  Clear: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="14" height="14">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function fmtDate(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function fmtTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
}

function fmtRelTime(dt) {
  if (!dt) return null
  const diff = Date.now() - new Date(dt).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (mins  <  1) return 'Just now'
  if (mins  < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days  <  7) return `${days}d ago`
  return null
}

function userInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

/* ── Admin Sidebar ───────────────────────────────────────────────────────── */
function AdminSidebar({ open, onClose, user, logout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/admin/dashboard',          label: 'Dashboard',         Ico: Icon.Dashboard },
    { path: '/admin/bookings',           label: 'Parking Requests',  Ico: Icon.Bookings  },
    { path: '/admin/parking-management', label: 'Slot Management',   Ico: Icon.Parking   },
    { path: '/parking',                  label: 'Parking Map',       Ico: Icon.Map       },
    { path: '/admin/helmet-borrowings',  label: 'Helmet Borrowings', Ico: Icon.Helmet    },
    { path: '/admin/users',              label: 'User Management',   Ico: Icon.Users     },
    { path: '/tickets',                  label: 'Incident Tickets',  Ico: Icon.Shield    },
    { path: '/notifications',            label: 'Notifications',     Ico: Icon.Bell      },
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

/* ── Skeleton rows ───────────────────────────────────────────────────────── */
function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i}>
      <td><span className="hb-skel" style={{ width: 20, height: 14 }} /></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="hb-skel" style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0 }} />
          <div>
            <span className="hb-skel" style={{ width: 88, height: 13, display: 'block' }} />
            <span className="hb-skel" style={{ width: 118, height: 11, display: 'block', marginTop: 5 }} />
          </div>
        </div>
      </td>
      <td>
        <span className="hb-skel" style={{ width: 64, height: 22, borderRadius: 8, display: 'block' }} />
        <span className="hb-skel" style={{ width: 100, height: 11, display: 'block', marginTop: 5 }} />
      </td>
      <td><span className="hb-skel" style={{ width: 52, height: 22, borderRadius: 9999 }} /></td>
      <td>
        <span className="hb-skel" style={{ width: 80, height: 13, display: 'block' }} />
        <span className="hb-skel" style={{ width: 48, height: 11, display: 'block', marginTop: 5 }} />
      </td>
      <td><span className="hb-skel" style={{ width: 68, height: 22, borderRadius: 9999 }} /></td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="hb-skel" style={{ width: 56, height: 28, borderRadius: 7 }} />
          <span className="hb-skel" style={{ width: 52, height: 28, borderRadius: 7 }} />
        </div>
      </td>
    </tr>
  ))
}

/* ── Constants ───────────────────────────────────────────────────────────── */
const FILTERS = ['ALL', 'PENDING', 'ISSUED', 'REJECTED', 'RETURNED', 'CANCELLED']

/* ── Main ────────────────────────────────────────────────────────────────── */
export default function AdminBorrowingsPage() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [borrowings, setBorrowings]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('ALL')
  const [search, setSearch]           = useState('')
  const [busy, setBusy]               = useState(false)
  const [toast, setToast]             = useState(null)

  /* Reject modal */
  const [rejectTarget, setRejectTarget] = useState(null)
  const [reason, setReason]             = useState('')

  const load = () => {
    setLoading(true)
    helmetBorrowingApi.getAll()
      .then(res => setBorrowings(res.data.data || []))
      .catch(() => setBorrowings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const notify = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  /* Stats */
  const counts = useMemo(() => borrowings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {}), [borrowings])

  const displayed = useMemo(() => {
    let list = filter === 'ALL' ? borrowings : borrowings.filter(b => b.status === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(b =>
        b.userName?.toLowerCase().includes(q) ||
        b.userEmail?.toLowerCase().includes(q) ||
        b.slotNumber?.toLowerCase().includes(q) ||
        b.purpose?.toLowerCase().includes(q) ||
        String(b.bookingId ?? '').includes(q)
      )
    }
    return list
  }, [borrowings, filter, search])

  /* Actions */
  const handleIssue = async (id) => {
    setBusy(true)
    try {
      await helmetBorrowingApi.issue(id)
      notify('Helmet issued successfully.')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to issue helmet.', 'error')
    } finally { setBusy(false) }
  }

  const openReject = (b) => { setRejectTarget(b); setReason('') }
  const closeReject = () => { setRejectTarget(null); setReason('') }

  const handleReject = async () => {
    if (!reason.trim()) return
    setBusy(true)
    try {
      await helmetBorrowingApi.reject(rejectTarget.id, reason.trim())
      notify('Request rejected.')
      closeReject()
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to reject.', 'error')
    } finally { setBusy(false) }
  }

  const handleReturn = async (id) => {
    setBusy(true)
    try {
      await helmetBorrowingApi.return(id)
      notify('Helmet marked as returned.')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to mark as returned.', 'error')
    } finally { setBusy(false) }
  }

  return (
    <div className="sd-shell ad-admin">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} logout={logout} />

      <div className="sd-main">

        {/* Topbar */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <button className="sd-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
              <Icon.Menu />
            </button>
            <span className="sd-topbar-title">Helmet Borrowings</span>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formatDate()}</span>
            <NotificationBell />
            <div className="sd-topbar-avatar" title={user?.name} onClick={() => setSidebarOpen(v => !v)}>
              {user?.name?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        {/* Hero */}
        <div className="hb-hero">
          <div className="hb-hero-text">
            <div className="hb-hero-eyebrow">Admin — Helmet Management</div>
            <div className="hb-hero-title">Helmet Borrowings</div>
            <div className="hb-hero-sub">Issue, reject, and track helmet borrowing requests campus-wide</div>
          </div>
          <div className="hb-hero-visual">
            <div className="hb-hero-icon">🪖</div>
            <span className="hb-hero-chip hb-hero-chip--tl">⏳ {counts.PENDING ?? 0} Pending</span>
            <span className="hb-hero-chip hb-hero-chip--tr">🔵 {counts.ISSUED ?? 0} Issued</span>
            <span className="hb-hero-chip hb-hero-chip--br">📋 {borrowings.length} Total</span>
          </div>
        </div>

        {/* Stats */}
        <div className="hb-stats-row">
          {[
            { label: 'Total',    value: borrowings.length,    cls: 'hb-stat--total'    },
            { label: 'Pending',  value: counts.PENDING  ?? 0, cls: 'hb-stat--pending'  },
            { label: 'Issued',   value: counts.ISSUED   ?? 0, cls: 'hb-stat--issued'   },
            { label: 'Returned', value: counts.RETURNED ?? 0, cls: 'hb-stat--returned' },
            { label: 'Rejected', value: counts.REJECTED ?? 0, cls: 'hb-stat--rejected' },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`hb-stat-card ${cls}`}>
              <div className="hb-stat-value">
                {loading ? <span className="hb-skel" style={{ width: 36, height: 26, display: 'inline-block' }} /> : value}
              </div>
              <div className="hb-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="hb-content">

          {/* Toolbar */}
          <div className="hb-toolbar">
            <div className="hb-search-wrap">
              <span className="hb-search-icon"><Icon.Search /></span>
              <input
                className="hb-search"
                placeholder="Search by name, slot, purpose…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="hb-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                  <Icon.Clear />
                </button>
              )}
            </div>
            <div className="hb-filter-tabs">
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`hb-filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'ALL'
                    ? `All (${borrowings.length})`
                    : `${f.charAt(0) + f.slice(1).toLowerCase()} (${counts[f] ?? 0})`}
                </button>
              ))}
            </div>
            <button className="hb-refresh-btn" onClick={load} disabled={loading}>
              <Icon.Refresh /> Refresh
            </button>
          </div>

          {/* Result count */}
          {!loading && (
            <div className="hb-count-bar">
              <span className="hb-count">
                {displayed.length} of {borrowings.length} {borrowings.length === 1 ? 'request' : 'requests'}
                {search && <span className="hb-count-query"> matching &ldquo;{search}&rdquo;</span>}
              </span>
              {search && displayed.length === 0 && (
                <button className="hb-count-clear" onClick={() => setSearch('')}>Clear search</button>
              )}
            </div>
          )}

          {/* Table */}
          <div className="hb-table-wrap">
            <div className="hb-table-card-header">
              <div className="hb-table-card-title">
                <Icon.Helmet />
                Borrowing Records
              </div>
              <span className="hb-table-card-count">
                {loading ? '…' : `${displayed.length} ${displayed.length === 1 ? 'entry' : 'entries'}`}
              </span>
            </div>
            <table className="hb-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Student</th>
                  <th>Booking / Purpose</th>
                  <th>Helmets</th>
                  <th>Requested</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : displayed.length === 0 ? (
                  <tr className="hb-empty-row">
                    <td colSpan={7}>
                      <div className="hb-empty-icon">🪖</div>
                      <div className="hb-empty-title">No borrowing requests</div>
                      <div className="hb-empty-desc">No records match the current filter.</div>
                    </td>
                  </tr>
                ) : (
                  displayed.map((b, idx) => (
                    <tr key={b.id} data-status={b.status}>

                      {/* Row index */}
                      <td className="hb-cell-idx">{idx + 1}</td>

                      {/* Student */}
                      <td>
                        <div className="hb-cell-user-wrap">
                          <div className="hb-cell-avatar">{userInitials(b.userName)}</div>
                          <div>
                            <div className="hb-cell-name">{b.userName}</div>
                            {b.userEmail && <div className="hb-cell-email">{b.userEmail}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Booking / Purpose */}
                      <td>
                        {b.slotNumber ? (
                          <>
                            <div className="hb-cell-slot-wrap">
                              <span className="hb-cell-slot-badge">
                                {b.slotNumber}
                              </span>
                              {b.zone && <span className="hb-cell-zone">Zone {b.zone}</span>}
                            </div>
                            {b.bookingStart && (
                              <div className="hb-cell-slot-time">
                                {fmtDate(b.bookingStart)} · {fmtTime(b.bookingStart)} → {fmtTime(b.bookingEnd)}
                              </div>
                            )}
                            <div className="hb-cell-slot-link">Booking #{b.bookingId}</div>
                          </>
                        ) : (
                          <span className={b.purpose ? 'hb-cell-purpose' : 'hb-cell-empty'}>
                            {b.purpose || '—'}
                          </span>
                        )}
                        {b.rejectionReason && (
                          <div className="hb-rejection-reason">↳ {b.rejectionReason}</div>
                        )}
                      </td>

                      {/* Helmets */}
                      <td>
                        <span className={`hb-cell-helmet-badge ${b.quantity === 2 ? 'hb-cell-helmet-badge--two' : ''}`}>
                          🪖 ×{b.quantity ?? 1}
                        </span>
                      </td>

                      {/* Requested at */}
                      <td>
                        <div className="hb-cell-time">{fmtDate(b.createdAt)}</div>
                        <div className="hb-cell-time-sub">{fmtTime(b.createdAt)}</div>
                        {fmtRelTime(b.createdAt) && (
                          <span className="hb-cell-reltime">{fmtRelTime(b.createdAt)}</span>
                        )}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`hb-status hb-status--${b.status}`}>
                          <span className="hb-status-dot" />
                          {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                        </span>
                        {b.issuedAt   && <div className="hb-status-time">Issued {fmtDate(b.issuedAt)}</div>}
                        {b.returnedAt && <div className="hb-status-time">Returned {fmtDate(b.returnedAt)}</div>}
                      </td>

                      {/* Actions */}
                      <td className="hb-cell-actions">
                        <div className="hb-actions">
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                className="hb-btn hb-btn--issue"
                                onClick={() => handleIssue(b.id)}
                                disabled={busy}
                              >
                                ✓ Issue
                              </button>
                              <button
                                className="hb-btn hb-btn--reject"
                                onClick={() => openReject(b)}
                                disabled={busy}
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}
                          {b.status === 'ISSUED' && (
                            <button
                              className="hb-btn hb-btn--return"
                              onClick={() => handleReturn(b.id)}
                              disabled={busy}
                            >
                              ↩ Returned
                            </button>
                          )}
                          {['REJECTED', 'RETURNED', 'CANCELLED'].includes(b.status) && (
                            <span className="hb-no-action">—</span>
                          )}
                        </div>
                      </td>

                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Reject Modal ────────────────────────────────────────────────────── */}
      {rejectTarget && (
        <div className="hb-modal-overlay" onClick={closeReject}>
          <div className="hb-modal" onClick={e => e.stopPropagation()}>
            <div className="hb-modal-header">
              <span className="hb-modal-title">Reject Request</span>
              <button className="hb-modal-close" onClick={closeReject}>✕</button>
            </div>
            <div className="hb-modal-body">
              <p className="hb-modal-desc">
                Provide a reason that will be sent to the student.
              </p>
              <div className="hb-modal-info">
                <strong>{rejectTarget.userName}</strong>
                {rejectTarget.slotNumber
                  ? ` — Slot ${rejectTarget.slotNumber}${rejectTarget.zone ? ` (Zone ${rejectTarget.zone})` : ''}`
                  : rejectTarget.purpose ? ` — ${rejectTarget.purpose}` : ''}
                <br />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {rejectTarget.quantity === 2 ? '🪖🪖 2 helmets' : '🪖 1 helmet'} · Requested {fmt(rejectTarget.createdAt)}
                </span>
              </div>
              <textarea
                className="hb-modal-textarea"
                placeholder="Enter rejection reason…"
                value={reason}
                onChange={e => setReason(e.target.value)}
                rows={3}
                autoFocus
              />
            </div>
            <div className="hb-modal-footer">
              <button className="hb-modal-cancel" onClick={closeReject}>Cancel</button>
              <button
                className="hb-modal-confirm"
                onClick={handleReject}
                disabled={busy || !reason.trim()}
              >
                {busy ? 'Rejecting…' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ───────────────────────────────────────────────────────────── */}
      {toast && (
        <div className={`hb-toast hb-toast--${toast.type}`}>
          {toast.type === 'success' ? '✓' : '✕'} {toast.msg}
        </div>
      )}
    </div>
  )
}
