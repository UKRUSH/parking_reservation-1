import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketApi } from '../../api/ticketApi'
import { userApi } from '../../api/userApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import TicketCard from '../../components/tickets/TicketCard'
import TicketSidebar from '../../components/tickets/TicketSidebar'
import '../student/StudentDashboardPage.css'
import '../admin/AdminDashboardPage.css'
import '../technician/TechnicianDashboardPage.css'
import './TicketListPage.css'

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
  Ticket: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  Shield: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

const STATUS_BADGE = {
  OPEN:        'tl-badge tl-badge--open',
  IN_PROGRESS: 'tl-badge tl-badge--progress',
  RESOLVED:    'tl-badge tl-badge--resolved',
  CLOSED:      'tl-badge tl-badge--closed',
  REJECTED:    'tl-badge tl-badge--rejected',
}

const PRIORITY_BADGE = {
  LOW:      'tl-pri tl-pri--low',
  MEDIUM:   'tl-pri tl-pri--medium',
  HIGH:     'tl-pri tl-pri--high',
  CRITICAL: 'tl-pri tl-pri--critical',
}

/* ── Main page ───────────────────────────────────────────────────────────── */
export default function TicketListPage() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const isAdmin = hasRole('ADMIN')
  const isTech  = hasRole('TECHNICIAN')

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [tickets, setTickets]         = useState([])
  const [loading, setLoading]         = useState(true)
  const [filter, setFilter]           = useState('ALL')
  const [search, setSearch]           = useState('')
  const [busy, setBusy]               = useState(false)
  const [toast, setToast]             = useState(null)
  const [rejectId, setRejectId]       = useState(null)
  const [reason, setReason]           = useState('')

  // assign modal
  const [technicians, setTechnicians]   = useState([])
  const [assignTicket, setAssignTicket] = useState(null)
  const [assignId, setAssignId]         = useState('')
  const [assignBusy, setAssignBusy]     = useState(false)

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const load = () => {
    setLoading(true)
    ticketApi.getAll(filter === 'ALL' ? null : filter)
      .then(res => setTickets(res.data.data || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

  useEffect(() => {
    if (!isAdmin) return
    userApi.getAll()
      .then(res => {
        const all = res.data.data || []
        setTechnicians(all.filter(u => [...(u.roles ?? [])].includes('TECHNICIAN')))
      })
      .catch(() => {})
  }, [])

  const handleAssign = async (e) => {
    e.preventDefault()
    if (!assignId) return
    setAssignBusy(true)
    try {
      await ticketApi.assign(assignTicket.id, Number(assignId))
      notify(`Technician assigned to ticket #${assignTicket.id}.`)
      setAssignTicket(null)
      setAssignId('')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to assign technician.')
    } finally { setAssignBusy(false) }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    setBusy(true)
    try {
      await ticketApi.reject(rejectId, reason.trim())
      notify('Ticket rejected.')
      setRejectId(null)
      setReason('')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to reject.')
    } finally { setBusy(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this ticket? This cannot be undone.')) return
    setBusy(true)
    try {
      await ticketApi.delete(id)
      notify('Ticket deleted.')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete.')
    } finally { setBusy(false) }
  }

  const displayed = tickets.filter(t =>
    !search.trim() ||
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.location?.toLowerCase().includes(search.toLowerCase()) ||
    t.userName?.toLowerCase().includes(search.toLowerCase())
  )

  const counts = tickets.reduce((acc, t) => {
    acc[t.status] = (acc[t.status] || 0) + 1
    return acc
  }, {})

  const heroSub = isAdmin
    ? 'Manage all campus incidents — assign, progress, reject or close tickets'
    : isTech
    ? 'View and update tickets assigned to you'
    : 'Report campus issues and track their resolution status'

  const heroEyebrow = isAdmin ? 'Admin — Incident Management' : 'Module C — Incident Reporting'

  const statCards = [
    { label: 'Open',        key: 'OPEN',        icon: '🔵', iconCls: 'sd-stat-icon--blue'  },
    { label: 'In Progress', key: 'IN_PROGRESS',  icon: '🟡', iconCls: 'sd-stat-icon--amber' },
    { label: 'Resolved',    key: 'RESOLVED',     icon: '🟢', iconCls: 'sd-stat-icon--green' },
    { label: 'Closed',      key: 'CLOSED',       icon: '⚪', iconCls: 'sd-stat-icon--blue'  },
    { label: 'Rejected',    key: 'REJECTED',     icon: '🔴', iconCls: 'sd-stat-icon--amber' },
  ]

  return (
    <div className={`sd-shell${isAdmin ? ' ad-admin' : isTech ? ' td-tech' : ''}`}>
      <TicketSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        logout={logout}
        isAdmin={isAdmin}
        isTech={isTech}
      />

      <div className="sd-main">
        {/* ── Topbar ── */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <button
              className="sd-hamburger"
              onClick={() => setSidebarOpen(v => !v)}
              aria-label="Toggle sidebar"
            >
              <Icon.Menu />
            </button>
            <span className="sd-topbar-title">
              Incident Tickets{isAdmin ? ' — Admin' : ''}
            </span>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formatDate()}</span>
            <NotificationBell />
            {!isTech && (
              <button
                onClick={() => navigate('/tickets/new')}
                className="tl-btn tl-btn--manage"
                style={{ borderRadius: '9999px', padding: '0.4rem 1rem' }}
              >
                <Icon.Plus /> Report
              </button>
            )}
            <div
              className="sd-topbar-avatar"
              title={user?.name}
              onClick={() => setSidebarOpen(v => !v)}
            >
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
        </header>

        {/* ── Body ── */}
        <div className="sd-body">

          {/* Hero */}
          <div className="tl-hero">
            <div className="tl-hero-text">
              <div className="tl-hero-eyebrow">{heroEyebrow}</div>
              <h1 className="tl-hero-title">Incident Tickets</h1>
              <p className="tl-hero-sub">{heroSub}</p>
              {!isTech && (
                <div className="tl-hero-actions">
                  <button className="tl-hero-btn" onClick={() => navigate('/tickets/new')}>
                    <Icon.Plus /> Report New Incident
                  </button>
                </div>
              )}
            </div>
            <div className="tl-hero-visual">
              <div className="tl-hero-ring" />
              <div className="tl-hero-ring" />
              <div className="tl-hero-ring" />
              <svg className="tl-hero-shield" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
              </svg>
            </div>
          </div>

          {/* Stats strip — admin shows all 5, others show 3 */}
          {isAdmin ? (
            <div className="tl-stats-row">
              {statCards.map(({ label, key, iconCls }) => (
                <div key={key} className="sd-stat-card" style={{ cursor: 'pointer' }}
                  onClick={() => setFilter(key)}>
                  <div className={`sd-stat-icon ${iconCls}`}>
                    <Icon.Ticket />
                  </div>
                  <div>
                    <div className="sd-stat-label">{label}</div>
                    <div className="sd-stat-value">{counts[key] ?? 0}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="tl-stats-row" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {statCards.slice(0, 3).map(({ label, key, iconCls }) => (
                <div key={key} className="sd-stat-card">
                  <div className={`sd-stat-icon ${iconCls}`}>
                    <Icon.Ticket />
                  </div>
                  <div>
                    <div className="sd-stat-label">{label}</div>
                    <div className="sd-stat-value">{counts[key] ?? 0}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Filters */}
          <div className="tl-filters">
            <div className="tl-search-wrap">
              <svg className="tl-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                className="tl-search"
                placeholder={isAdmin ? 'Search by title, location, or reporter…' : 'Search tickets…'}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="tl-filter-tabs">
              {STATUS_FILTERS.map(f => (
                <button
                  key={f}
                  className={`tl-filter-tab ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f === 'ALL' ? `All (${tickets.length})` : f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="tl-content">
            {loading ? (
              <div className="tl-empty">
                <div className="tl-empty-icon">
                  <Icon.Ticket />
                </div>
                <div className="tl-empty-title">Loading tickets…</div>
              </div>
            ) : displayed.length === 0 ? (
              <div className="tl-empty">
                <div className="tl-empty-icon"><Icon.Shield /></div>
                <div className="tl-empty-title">
                  {tickets.length === 0 ? 'No tickets yet' : 'No tickets match your search'}
                </div>
                <div className="tl-empty-desc">
                  {tickets.length === 0 && !isTech
                    ? 'Report an incident and it will appear here.'
                    : 'Try a different search term or filter.'}
                </div>
              </div>
            ) : isAdmin ? (
              /* ── Admin table ── */
              <div className="tl-table-wrap">
                <table className="tl-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Title</th>
                      <th>Reporter</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Technician</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayed.map(t => (
                      <tr key={t.id}>
                        <td><span className="tl-td-id">#{t.id}</span></td>
                        <td>
                          <div className="tl-td-title-main">{t.title}</div>
                          {t.location && (
                            <div className="tl-td-location">
                              📍 {t.location}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="tl-td-user-name">{t.userName}</div>
                          <div className="tl-td-user-email">{t.userEmail}</div>
                        </td>
                        <td>
                          <span className={STATUS_BADGE[t.status] ?? 'tl-badge'}>
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td>
                          <span className={PRIORITY_BADGE[t.priority] ?? 'tl-pri'}>
                            {t.priority}
                          </span>
                        </td>
                        <td>
                          {t.technicianName ? (
                            <div className="tl-td-tech-row">
                              <span className="tl-td-tech">🔧 {t.technicianName}</span>
                              {(t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (
                                <button
                                  className="tl-btn-change"
                                  onClick={() => { setAssignTicket(t); setAssignId('') }}
                                >
                                  Change
                                </button>
                              )}
                            </div>
                          ) : (t.status === 'OPEN' || t.status === 'IN_PROGRESS') ? (
                            <button
                              className="tl-btn-assign"
                              onClick={() => { setAssignTicket(t); setAssignId('') }}
                            >
                              + Assign
                            </button>
                          ) : (
                            <span className="tl-td-tech-none">— Unassigned</span>
                          )}
                        </td>
                        <td><span className="tl-td-date">{fmt(t.createdAt)}</span></td>
                        <td>
                          <div className="tl-action-row">
                            <button
                              className="tl-btn tl-btn--manage"
                              onClick={() => navigate(`/tickets/${t.id}`)}
                            >
                              Manage
                            </button>
                            {(t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (
                              <button
                                className="tl-btn tl-btn--reject"
                                disabled={busy}
                                onClick={() => { setRejectId(t.id); setReason('') }}
                              >
                                Reject
                              </button>
                            )}
                            <button
                              className="tl-btn tl-btn--delete"
                              disabled={busy}
                              onClick={() => handleDelete(t.id)}
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              /* ── Student / Tech card grid ── */
              <div className="tl-card-grid">
                {displayed.map(t => <TicketCard key={t.id} ticket={t} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div
          style={{
            position: 'fixed', top: '1rem', right: '1rem', zIndex: 100,
            background: '#1e293b', color: '#fff', fontSize: '0.875rem',
            padding: '0.625rem 1.125rem', borderRadius: '10px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
          }}
        >
          {toast}
        </div>
      )}

      {/* ── Reject modal ── */}
      {rejectId && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 60, padding: '1rem',
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            style={{
              background: '#fff', borderRadius: '20px',
              boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
              width: '100%', maxWidth: '380px', padding: '1.75rem',
            }}
          >
            <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem', fontSize: '1rem' }}>
              Reject Ticket #{rejectId}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              Provide a reason to send to the reporter.
            </p>
            <form onSubmit={handleReject}>
              <textarea
                rows={3}
                style={{
                  width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px',
                  padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: '#1e293b',
                  resize: 'none', outline: 'none', marginBottom: '1rem',
                  fontFamily: 'inherit',
                }}
                placeholder="Rejection reason…"
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
              />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => { setRejectId(null); setReason('') }}
                  style={{
                    flex: 1, border: '1.5px solid #e2e8f0', background: '#fff',
                    color: '#64748b', padding: '0.625rem', borderRadius: '10px',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !reason.trim()}
                  style={{
                    flex: 1, background: '#ef4444', border: 'none', color: '#fff',
                    padding: '0.625rem', borderRadius: '10px',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    opacity: (busy || !reason.trim()) ? 0.5 : 1,
                  }}
                >
                  {busy ? 'Rejecting…' : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Assign Technician modal ── */}
      {assignTicket && (
        <div className="tl-modal-overlay">
          <div className="tl-modal">
            <div className="tl-modal-header">
              <div>
                <div className="tl-modal-title">
                  {assignTicket.technicianName ? 'Change Technician' : 'Assign Technician'}
                </div>
                <div className="tl-modal-sub">Ticket #{assignTicket.id} — {assignTicket.title}</div>
              </div>
              <button className="tl-modal-close" onClick={() => { setAssignTicket(null); setAssignId('') }}>✕</button>
            </div>
            <form onSubmit={handleAssign}>
              <div className="tl-modal-body">
                {technicians.length === 0 ? (
                  <div className="tl-modal-empty">
                    <div className="tl-modal-empty-icon">🔧</div>
                    <div className="tl-modal-empty-text">No technicians found.</div>
                    <div className="tl-modal-empty-sub">Assign the TECHNICIAN role to a user first from User Management.</div>
                  </div>
                ) : (
                  <>
                    {assignTicket.technicianName && (
                      <div className="tl-modal-current">
                        <span className="tl-modal-current-label">Currently assigned</span>
                        <span className="tl-modal-current-name">🔧 {assignTicket.technicianName}</span>
                      </div>
                    )}
                    <label className="tl-modal-label">
                      {assignTicket.technicianName ? 'Select new technician' : 'Select a technician'}
                    </label>
                    <select
                      className="tl-modal-select"
                      value={assignId}
                      onChange={e => setAssignId(e.target.value)}
                      required
                    >
                      <option value="">— Choose technician —</option>
                      {technicians.map(t => (
                        <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                      ))}
                    </select>
                  </>
                )}
              </div>
              <div className="tl-modal-footer">
                <button
                  type="button"
                  className="tl-modal-btn tl-modal-btn--cancel"
                  onClick={() => { setAssignTicket(null); setAssignId('') }}
                >
                  Cancel
                </button>
                {technicians.length > 0 && (
                  <button
                    type="submit"
                    className="tl-modal-btn tl-modal-btn--confirm"
                    disabled={assignBusy || !assignId}
                  >
                    {assignBusy ? 'Saving…' : assignTicket.technicianName ? 'Change' : 'Assign'}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
