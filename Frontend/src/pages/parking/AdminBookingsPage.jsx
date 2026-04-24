import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { parkingBookingApi } from '../../api/parkingBookingApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import '../student/StudentDashboardPage.css'
import '../admin/AdminDashboardPage.css'
import './AdminBookingsPage.css'

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
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function fmtDT(dt) {
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

function fmtDuration(start, end) {
  if (!start || !end) return null
  const ms = new Date(end) - new Date(start)
  if (ms <= 0) return null
  const h = Math.floor(ms / 3600000)
  const m = Math.floor((ms % 3600000) / 60000)
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

function userInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
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
  return Array.from({ length: 6 }).map((_, i) => (
    <tr key={i}>
      <td><span className="ab-skel" style={{ width: 20,   height: 14 }} /></td>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="ab-skel" style={{ width: 32, height: 32, borderRadius: '50%', flexShrink: 0 }} />
          <div>
            <span className="ab-skel" style={{ width: 90, height: 13, display: 'block' }} />
            <span className="ab-skel" style={{ width: 120, height: 11, display: 'block', marginTop: 5 }} />
          </div>
        </div>
      </td>
      <td><span className="ab-skel" style={{ width: 60,   height: 22, borderRadius: 8 }} /></td>
      <td><span className="ab-skel" style={{ width: 72,   height: 20, borderRadius: 6 }} /></td>
      <td>
        <span className="ab-skel" style={{ width: 80, height: 13, display: 'block' }} />
        <span className="ab-skel" style={{ width: 100, height: 11, display: 'block', marginTop: 5 }} />
        <span className="ab-skel" style={{ width: 40, height: 16, borderRadius: 9999, display: 'block', marginTop: 5 }} />
      </td>
      <td><span className="ab-skel" style={{ width: '70%', height: 13 }} /></td>
      <td><span className="ab-skel" style={{ width: 70,   height: 22, borderRadius: 9999 }} /></td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <span className="ab-skel" style={{ width: 68, height: 28, borderRadius: 7 }} />
          <span className="ab-skel" style={{ width: 52, height: 28, borderRadius: 7 }} />
        </div>
      </td>
    </tr>
  ))
}

/* ── Main ────────────────────────────────────────────────────────────────── */
const FILTERS = ['ALL', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED']

export default function AdminBookingsPage() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [bookings, setBookings]       = useState([])
  const [loading, setLoading]         = useState(true)
  const [actionLoading, setActionLoading] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [filter, setFilter]           = useState('ALL')
  const [search, setSearch]           = useState('')

  /* Reject modal */
  const [rejectTarget, setRejectTarget] = useState(null)
  const [rejectReason, setRejectReason] = useState('')
  const [rejectBusy, setRejectBusy]     = useState(false)

  /* Cancel modal */
  const [cancelTarget, setCancelTarget] = useState(null)
  const [cancelBusy, setCancelBusy]     = useState(false)

  const loadBookings = () => {
    setLoading(true)
    parkingBookingApi.getAll()
      .then((res) => setBookings(res.data.data || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadBookings() }, [])

  /* Stats */
  const stats = useMemo(() => ({
    total:     bookings.length,
    pending:   bookings.filter(b => b.status === 'PENDING').length,
    approved:  bookings.filter(b => b.status === 'APPROVED').length,
    rejected:  bookings.filter(b => b.status === 'REJECTED').length,
    cancelled: bookings.filter(b => b.status === 'CANCELLED').length,
  }), [bookings])

  /* Filtered list */
  const displayed = useMemo(() => {
    let list = filter === 'ALL' ? bookings : bookings.filter(b => b.status === filter)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter(b =>
        b.userName?.toLowerCase().includes(q) ||
        b.slotNumber?.toLowerCase().includes(q) ||
        b.zone?.toLowerCase().includes(q) ||
        b.vehicleNumber?.toLowerCase().includes(q) ||
        b.purpose?.toLowerCase().includes(q)
      )
    }
    return list
  }, [bookings, filter, search])

  /* Actions */
  const handleApprove = async (id) => {
    setActionLoading(id + '-approve')
    setActionError(null)
    try {
      await parkingBookingApi.approve(id)
      loadBookings()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to approve booking.')
    } finally {
      setActionLoading(null)
    }
  }

  const openReject = (b) => { setRejectTarget(b); setRejectReason('') }
  const closeReject = () => { setRejectTarget(null); setRejectReason(''); setRejectBusy(false) }
  const confirmReject = async () => {
    if (!rejectTarget) return
    setRejectBusy(true)
    setActionError(null)
    try {
      await parkingBookingApi.reject(rejectTarget.id, rejectReason.trim() || 'No reason provided')
      closeReject()
      loadBookings()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to reject booking.')
      setRejectBusy(false)
    }
  }

  const openCancel = (b) => setCancelTarget(b)
  const closeCancel = () => { setCancelTarget(null); setCancelBusy(false) }
  const confirmCancel = async () => {
    if (!cancelTarget) return
    setCancelBusy(true)
    setActionError(null)
    try {
      await parkingBookingApi.cancel(cancelTarget.id)
      closeCancel()
      loadBookings()
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel booking.')
      setCancelBusy(false)
    }
  }

  return (
    <div className="sd-shell ad-admin">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} logout={logout} />

      <div className="sd-main">
        {/* Topbar */}
        <header className="sd-topbar">
          <button className="sd-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Icon.Menu />
          </button>
          <div className="sd-topbar-title">Parking Requests</div>
          <div className="sd-topbar-right">
            <NotificationBell />
          </div>
        </header>

        {/* Hero */}
        <div className="ab-hero">
          <div className="ab-hero-text">
            <div className="ab-hero-eyebrow">Admin — Booking Management</div>
            <div className="ab-hero-title">Parking Requests</div>
            <div className="ab-hero-sub">Review, approve, and manage all parking bookings across campus</div>
          </div>
          <div className="ab-hero-visual">
            <div className="ab-hero-icon">🅿️</div>
            <span className="ab-hero-chip ab-hero-chip--tl">🟡 {stats.pending} Pending</span>
            <span className="ab-hero-chip ab-hero-chip--tr">✅ {stats.approved} Active</span>
            <span className="ab-hero-chip ab-hero-chip--br">📋 {stats.total} Total</span>
          </div>
        </div>

        {/* Stats */}
        <div className="ab-stats-row">
          {[
            { label: 'Total',     value: stats.total,     cls: 'ab-stat--total'     },
            { label: 'Pending',   value: stats.pending,   cls: 'ab-stat--pending'   },
            { label: 'Approved',  value: stats.approved,  cls: 'ab-stat--approved'  },
            { label: 'Rejected',  value: stats.rejected,  cls: 'ab-stat--rejected'  },
            { label: 'Cancelled', value: stats.cancelled, cls: 'ab-stat--cancelled' },
          ].map(({ label, value, cls }) => (
            <div key={label} className={`ab-stat-card ${cls}`}>
              <div className="ab-stat-value">
                {loading ? <span className="ab-skel" style={{ width: 36, height: 26, display: 'inline-block' }} /> : value}
              </div>
              <div className="ab-stat-label">{label}</div>
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="ab-content">
          {/* Error banner */}
          {actionError && (
            <div className="ab-error">
              <span>⚠ {actionError}</span>
              <button className="ab-error-close" onClick={() => setActionError(null)}>✕</button>
            </div>
          )}

          {/* Toolbar */}
          <div className="ab-toolbar">
            <div className="ab-search-wrap">
              <span className="ab-search-icon"><Icon.Search /></span>
              <input
                className="ab-search"
                placeholder="Search by name, slot, plate…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="ab-filter-tabs">
              {FILTERS.map(f => (
                <button
                  key={f}
                  className={`ab-filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'ALL' ? `All (${stats.total})` : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <button className="ab-refresh-btn" onClick={loadBookings}>
              <Icon.Refresh /> Refresh
            </button>
          </div>

          {/* Result count */}
          {!loading && (
            <span className="ab-count">
              Showing {displayed.length} of {bookings.length} bookings
            </span>
          )}

          {/* Table */}
          <div className="ab-table-wrap">
            <div className="ab-table-card-header">
              <div className="ab-table-card-title">
                <Icon.Bookings />
                Booking Records
              </div>
              <span className="ab-table-card-count">
                {loading ? '…' : `${displayed.length} ${displayed.length === 1 ? 'entry' : 'entries'}`}
              </span>
            </div>
            <table className="ab-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>User</th>
                  <th>Slot / Zone</th>
                  <th>Vehicle</th>
                  <th>Time &amp; Duration</th>
                  <th>Purpose</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <SkeletonRows />
                ) : displayed.length === 0 ? (
                  <tr className="ab-empty-row">
                    <td colSpan={8}>
                      <div className="ab-empty-icon">📭</div>
                      <div className="ab-empty-title">No bookings found</div>
                      <div className="ab-empty-desc">
                        {search ? 'Try a different search term.' : 'No bookings match the current filter.'}
                      </div>
                    </td>
                  </tr>
                ) : (
                  displayed.map((b, idx) => (
                    <tr key={b.id}>
                      {/* Row number */}
                      <td className="ab-cell-idx">{idx + 1}</td>

                      {/* User */}
                      <td>
                        <div className="ab-cell-user-wrap">
                          <div className="ab-cell-avatar">{userInitials(b.userName)}</div>
                          <div>
                            <div className="ab-cell-user-name">{b.userName || '—'}</div>
                            {b.userEmail && <div className="ab-cell-user-email">{b.userEmail}</div>}
                          </div>
                        </div>
                      </td>

                      {/* Slot */}
                      <td>
                        <span className="ab-cell-slot-badge">
                          {b.slotNumber || '—'}
                        </span>
                        {b.zone && <div className="ab-cell-zone">Zone {b.zone}</div>}
                      </td>

                      {/* Vehicle */}
                      <td>
                        {b.vehicleNumber
                          ? <span className="ab-cell-plate">{b.vehicleNumber}</span>
                          : <span className="ab-cell-empty">—</span>}
                      </td>

                      {/* Time */}
                      <td>
                        <div className="ab-cell-time">{fmtDate(b.startTime)}</div>
                        <div className="ab-cell-time-sep">
                          {fmtTime(b.startTime)} → {fmtTime(b.endTime)}
                        </div>
                        {fmtDuration(b.startTime, b.endTime) && (
                          <span className="ab-cell-duration">{fmtDuration(b.startTime, b.endTime)}</span>
                        )}
                      </td>

                      {/* Purpose */}
                      <td>
                        <div className="ab-cell-purpose" title={b.purpose || ''}>
                          {b.purpose || <span className="ab-cell-empty">—</span>}
                        </div>
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`ab-status ab-status--${b.status}`}>
                          <span className="ab-status-dot" />
                          {b.status.charAt(0) + b.status.slice(1).toLowerCase()}
                        </span>
                        {b.rejectionReason && (
                          <div className="ab-rejection-reason" title={b.rejectionReason}>
                            {b.rejectionReason}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="ab-cell-actions">
                        <div className="ab-actions">
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                className="ab-btn ab-btn--approve"
                                onClick={() => handleApprove(b.id)}
                                disabled={actionLoading === b.id + '-approve'}
                              >
                                {actionLoading === b.id + '-approve' ? '…' : '✓ Approve'}
                              </button>
                              <button
                                className="ab-btn ab-btn--reject"
                                onClick={() => openReject(b)}
                              >
                                ✕ Reject
                              </button>
                            </>
                          )}
                          {(b.status === 'APPROVED' || b.status === 'PENDING') && (
                            <button
                              className="ab-btn ab-btn--cancel"
                              onClick={() => openCancel(b)}
                            >
                              Cancel
                            </button>
                          )}
                          {b.status !== 'PENDING' && b.status !== 'APPROVED' && (
                            <span className="ab-cell-empty ab-no-action">—</span>
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
        <div className="ab-modal-overlay" onClick={closeReject}>
          <div className="ab-modal" onClick={e => e.stopPropagation()}>
            <div className="ab-modal-header">
              <span className="ab-modal-title">Reject Booking</span>
              <button className="ab-modal-close" onClick={closeReject}>✕</button>
            </div>
            <div className="ab-modal-body">
              <p className="ab-modal-desc">
                You are about to reject the parking request for:
              </p>
              <div className="ab-modal-info">
                <strong>{rejectTarget.userName}</strong>
                {' — '}Slot {rejectTarget.slotNumber}
                {rejectTarget.zone ? ` (Zone ${rejectTarget.zone})` : ''}
                <br />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {fmtDT(rejectTarget.startTime)} → {fmtTime(rejectTarget.endTime)}
                </span>
              </div>
              <textarea
                className="ab-modal-textarea"
                placeholder="Enter rejection reason (optional)…"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="ab-modal-footer">
              <button className="ab-modal-cancel" onClick={closeReject}>Cancel</button>
              <button
                className="ab-modal-confirm--reject"
                onClick={confirmReject}
                disabled={rejectBusy}
              >
                {rejectBusy ? 'Rejecting…' : 'Reject Booking'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cancel Confirm Modal ─────────────────────────────────────────────── */}
      {cancelTarget && (
        <div className="ab-modal-overlay" onClick={closeCancel}>
          <div className="ab-modal" onClick={e => e.stopPropagation()}>
            <div className="ab-modal-header">
              <span className="ab-modal-title">Cancel Booking</span>
              <button className="ab-modal-close" onClick={closeCancel}>✕</button>
            </div>
            <div className="ab-modal-body">
              <p className="ab-modal-desc">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              <div className="ab-modal-info">
                <strong>{cancelTarget.userName}</strong>
                {' — '}Slot {cancelTarget.slotNumber}
                {cancelTarget.zone ? ` (Zone ${cancelTarget.zone})` : ''}
                <br />
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  {fmtDT(cancelTarget.startTime)} → {fmtTime(cancelTarget.endTime)}
                </span>
              </div>
            </div>
            <div className="ab-modal-footer">
              <button className="ab-modal-cancel" onClick={closeCancel}>Keep Booking</button>
              <button
                className="ab-modal-confirm--cancel"
                onClick={confirmCancel}
                disabled={cancelBusy}
              >
                {cancelBusy ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
