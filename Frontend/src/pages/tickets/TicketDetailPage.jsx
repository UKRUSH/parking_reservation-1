import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ticketApi } from '../../api/ticketApi'
import { userApi } from '../../api/userApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import AttachmentImage from '../../components/tickets/AttachmentImage'
import TicketSidebar from '../../components/tickets/TicketSidebar'
import '../student/StudentDashboardPage.css'
import '../admin/AdminDashboardPage.css'
import '../technician/TechnicianDashboardPage.css'
import './TicketDetailPage.css'

/* ── Icons ───────────────────────────────────────────────────────────────── */
const Icon = {
  Menu: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Back: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
  Check: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  Play: () => (
    <svg fill="currentColor" viewBox="0 0 24 24" width="15" height="15">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  X: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const HERO_CLASS = {
  OPEN: 'open', IN_PROGRESS: 'progress', RESOLVED: 'resolved',
  CLOSED: 'closed', REJECTED: 'rejected',
}

/* ── Stepper ─────────────────────────────────────────────────────────────── */
const STEPS = [
  { key: 'OPEN',        label: 'Open' },
  { key: 'IN_PROGRESS', label: 'In Progress' },
  { key: 'RESOLVED',    label: 'Resolved' },
  { key: 'CLOSED',      label: 'Closed' },
]

function StatusStepper({ status }) {
  if (status === 'REJECTED') {
    return (
      <div className="td-stepper-rejected">
        <Icon.X /> Ticket Rejected
      </div>
    )
  }
  const currentIdx = STEPS.findIndex(s => s.key === status)
  return (
    <div className="td-stepper">
      {STEPS.map((step, idx) => {
        const done   = idx < currentIdx
        const active = idx === currentIdx
        const state  = done ? 'done' : active ? 'active' : 'pending'
        return (
          <div key={step.key} className="td-step-group">
            <div className="td-step-item">
              <div className={`td-step-circle td-step-circle--${state}`}>
                {done ? '✓' : idx + 1}
              </div>
              <span className={`td-step-label td-step-label--${state}`}>{step.label}</span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`td-step-connector td-step-connector--${done ? 'done' : 'pending'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

/* ── Inline comment thread ───────────────────────────────────────────────── */
function CommentThread({ ticketId, comments, currentUserId, isAdmin, onRefresh }) {
  const [text, setText]       = useState('')
  const [editId, setEditId]   = useState(null)
  const [editText, setEditText] = useState('')
  const [busy, setBusy]       = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    try {
      await ticketApi.addComment(ticketId, text.trim())
      setText('')
      onRefresh()
    } finally { setBusy(false) }
  }

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return
    setBusy(true)
    try {
      await ticketApi.editComment(ticketId, commentId, editText.trim())
      setEditId(null); setEditText('')
      onRefresh()
    } finally { setBusy(false) }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    setBusy(true)
    try {
      await ticketApi.deleteComment(ticketId, commentId)
      onRefresh()
    } finally { setBusy(false) }
  }

  return (
    <div className="td-comments-wrap">
      {comments.length === 0 ? (
        <div className="td-comment-empty">No comments yet — be the first to comment.</div>
      ) : (
        <div className="td-comment-list">
          {comments.map(c => {
            const isOwn     = c.authorId === currentUserId
            const canEdit   = isOwn
            const canDelete = isOwn || isAdmin
            return (
              <div key={c.id} className="td-comment">
                <div className="td-comment-avatar">{initials(c.authorName)}</div>
                <div className="td-comment-body">
                  <div className="td-comment-head">
                    <span className="td-comment-author">{c.authorName}</span>
                    <span className="td-comment-time">{fmt(c.createdAt)}</span>
                    {c.updatedAt !== c.createdAt && (
                      <span className="td-comment-edited">(edited)</span>
                    )}
                  </div>
                  {editId === c.id ? (
                    <>
                      <textarea
                        rows={2}
                        className="td-comment-edit-area"
                        value={editText}
                        onChange={e => setEditText(e.target.value)}
                      />
                      <div className="td-comment-edit-actions">
                        <button
                          className="td-mini-btn td-mini-btn--primary"
                          disabled={busy}
                          onClick={() => handleEdit(c.id)}
                        >Save</button>
                        <button
                          className="td-mini-btn td-mini-btn--secondary"
                          onClick={() => { setEditId(null); setEditText('') }}
                        >Cancel</button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="td-comment-text">{c.content}</p>
                      {(canEdit || canDelete) && (
                        <div className="td-comment-actions">
                          {canEdit && (
                            <button
                              className="td-comment-act-btn td-comment-act-btn--edit"
                              onClick={() => { setEditId(c.id); setEditText(c.content) }}
                            >Edit</button>
                          )}
                          {canDelete && (
                            <button
                              className="td-comment-act-btn td-comment-act-btn--delete"
                              disabled={busy}
                              onClick={() => handleDelete(c.id)}
                            >Delete</button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <form className="td-comment-form" onSubmit={handleAdd}>
        <textarea
          rows={2}
          className="td-comment-input"
          placeholder="Write a comment…"
          value={text}
          onChange={e => setText(e.target.value)}
        />
        <button
          type="submit"
          className="td-comment-submit"
          disabled={busy || !text.trim()}
        >Post</button>
      </form>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════════
   Main page
   ══════════════════════════════════════════════════════════════════════════ */
export default function TicketDetailPage() {
  const { id } = useParams()
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()

  const isAdmin = hasRole('ADMIN')
  const isTech  = hasRole('TECHNICIAN')

  const [sidebarOpen, setSidebarOpen]     = useState(false)
  const [ticket, setTicket]               = useState(null)
  const [comments, setComments]           = useState([])
  const [attachments, setAttachments]     = useState([])
  const [technicians, setTechnicians]     = useState([])
  const [loading, setLoading]             = useState(true)

  const [assignId, setAssignId]           = useState('')
  const [techNotes, setTechNotes]         = useState('')
  const [rejectReason, setRejectReason]   = useState('')
  const [showReject, setShowReject]       = useState(false)
  const [busy, setBusy]                   = useState(false)
  const [toast, setToast]                 = useState(null)

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const loadAll = () => {
    Promise.all([
      ticketApi.getById(id),
      ticketApi.getComments(id),
      ticketApi.listAttachments(id),
    ]).then(([tRes, cRes, aRes]) => {
      setTicket(tRes.data.data)
      setComments(cRes.data.data || [])
      setAttachments(aRes.data.data || [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  const handleDeleteAttachment = async (fileId) => {
    if (!confirm('Delete this attachment?')) return
    try {
      await ticketApi.deleteAttachment(id, fileId)
      setAttachments(prev => prev.filter(a => a.id !== fileId))
      notify('Attachment deleted.')
    } catch {
      notify('Failed to delete attachment.')
    }
  }

  useEffect(() => {
    loadAll()
    if (isAdmin) {
      userApi.getAll()
        .then(res => {
          const all = res.data.data || []
          setTechnicians(all.filter(u => [...(u.roles ?? [])].includes('TECHNICIAN')))
        })
        .catch(() => {})
    }
  }, [id])

  // ── Workflow actions ──────────────────────────────────────────────────────
  const handleMoveToInProgress = async () => {
    setBusy(true)
    try {
      if (assignId) {
        await ticketApi.assign(id, Number(assignId))
      } else {
        await ticketApi.updateStatus(id, 'IN_PROGRESS', techNotes || undefined)
      }
      notify('Ticket moved to In Progress.')
      setTechNotes(''); setAssignId('')
      loadAll()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to update.')
    } finally { setBusy(false) }
  }

  const handleResolve = async () => {
    setBusy(true)
    try {
      await ticketApi.updateStatus(id, 'RESOLVED', techNotes || undefined)
      notify('Ticket marked as Resolved.')
      setTechNotes('')
      loadAll()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to resolve.')
    } finally { setBusy(false) }
  }

  const handleClose = async () => {
    setBusy(true)
    try {
      await ticketApi.updateStatus(id, 'CLOSED')
      notify('Ticket closed.')
      loadAll()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to close.')
    } finally { setBusy(false) }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!rejectReason.trim()) return
    setBusy(true)
    try {
      await ticketApi.reject(id, rejectReason.trim())
      notify('Ticket rejected.')
      setShowReject(false); setRejectReason('')
      loadAll()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to reject.')
    } finally { setBusy(false) }
  }

  const handleDelete = async () => {
    if (!confirm('Permanently delete this ticket?')) return
    setBusy(true)
    try {
      await ticketApi.delete(id)
      navigate('/tickets')
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to delete.')
      setBusy(false)
    }
  }

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="td-loading">
        <div className="td-loading-inner">
          <div className="td-loading-spinner" />
          <p>Loading ticket…</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="td-loading">
        <div className="td-loading-inner">
          <p style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem' }}>Ticket not found.</p>
          <button
            onClick={() => navigate('/tickets')}
            style={{ color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem' }}
          >← Back to tickets</button>
        </div>
      </div>
    )
  }

  const canActOn  = ticket.status !== 'CLOSED' && ticket.status !== 'REJECTED'
  const hasPanel  = (isAdmin || isTech) && canActOn
  const heroClass = HERO_CLASS[ticket.status] ?? 'open'

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
            <button className="sd-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="Toggle sidebar">
              <Icon.Menu />
            </button>
            <button
              onClick={() => navigate('/tickets')}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.25rem',
                fontSize: '0.8125rem', color: '#64748b', background: 'none',
                border: 'none', cursor: 'pointer', fontWeight: 500,
              }}
            >
              <Icon.Back /> All Tickets
            </button>
            <span style={{ color: '#cbd5e1', fontSize: '0.875rem' }}>/</span>
            <span className="sd-topbar-title">Ticket #{ticket.id}</span>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formatDate()}</span>
            <NotificationBell />
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
          <div className={`td-hero td-hero--${heroClass}`}>
            <div className="td-hero-inner">
              <button className="td-back" onClick={() => navigate('/tickets')}>
                <Icon.Back /> All Tickets
              </button>
              <div className="td-hero-row">
                <div className="td-hero-text">
                  <div className="td-hero-eyebrow">Ticket #{ticket.id} · Incident Report</div>
                  <h1 className="td-hero-title">{ticket.title}</h1>
                  <div className="td-hero-badges">
                    <span className="td-hero-status">{ticket.status.replace('_', ' ')}</span>
                    <span className="td-hero-priority">{ticket.priority}</span>
                    {ticket.location && (
                      <span className="td-hero-location">📍 {ticket.location}</span>
                    )}
                  </div>
                  <div className="td-hero-reporter">
                    <div className="td-hero-reporter-avatar">{initials(ticket.userName)}</div>
                    {ticket.userName} · {fmt(ticket.createdAt)}
                  </div>
                </div>
              </div>
              <StatusStepper status={ticket.status} />
            </div>
          </div>

          {/* Two-column layout */}
          <div className={`td-layout ${hasPanel ? '' : 'td-layout--single'}`}>

            {/* ── Main column ── */}
            <div className="td-main-col">

              {/* Description */}
              <div className="td-card">
                <div className="td-card-header">
                  <h3 className="td-card-title">Description</h3>
                </div>
                <p className="td-desc">{ticket.description}</p>
              </div>

              {/* Attachments */}
              {attachments.length > 0 && (
                <div className="td-card">
                  <div className="td-card-header">
                    <h3 className="td-card-title">Attachments</h3>
                    <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{attachments.length} image{attachments.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="td-attachments">
                    {attachments.map(a => (
                      <AttachmentImage
                        key={a.id}
                        ticketId={id}
                        fileId={a.id}
                        originalName={a.originalName}
                        canDelete={isAdmin}
                        onDelete={handleDeleteAttachment}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Meta */}
              <div className="td-card">
                <div className="td-card-header">
                  <h3 className="td-card-title">Details</h3>
                </div>
                <div className="td-meta-grid">
                  <div className="td-meta-item">
                    <div className="td-meta-label">Reported by</div>
                    <div className="td-meta-value">{ticket.userName}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '0.1rem' }}>{ticket.userEmail}</div>
                  </div>
                  <div className="td-meta-item">
                    <div className="td-meta-label">Created</div>
                    <div className="td-meta-value" style={{ fontSize: '0.8125rem' }}>{fmt(ticket.createdAt)}</div>
                  </div>
                  <div className="td-meta-item">
                    <div className="td-meta-label">Last updated</div>
                    <div className="td-meta-value" style={{ fontSize: '0.8125rem' }}>{fmt(ticket.updatedAt)}</div>
                  </div>
                  {ticket.technicianName && (
                    <div className="td-meta-item">
                      <div className="td-meta-label">Assigned to</div>
                      <div className="td-meta-value">🔧 {ticket.technicianName}</div>
                    </div>
                  )}
                </div>

                {ticket.technicianNotes && (
                  <div className="td-notes-box td-notes-box--tech">
                    <div className="td-notes-label">Technician Notes</div>
                    <p className="td-notes-text">{ticket.technicianNotes}</p>
                  </div>
                )}

                {ticket.rejectionReason && (
                  <div className="td-notes-box td-notes-box--reject">
                    <div className="td-notes-label">Rejection Reason</div>
                    <p className="td-notes-text">{ticket.rejectionReason}</p>
                  </div>
                )}
              </div>

              {/* Comments */}
              <div className="td-card">
                <div className="td-card-header">
                  <h3 className="td-card-title">Discussion</h3>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{comments.length} comment{comments.length !== 1 ? 's' : ''}</span>
                </div>
                <CommentThread
                  ticketId={id}
                  comments={comments}
                  currentUserId={user?.id}
                  isAdmin={isAdmin}
                  onRefresh={() => {
                    ticketApi.getComments(id)
                      .then(res => setComments(res.data.data || []))
                      .catch(() => {})
                  }}
                />
              </div>
            </div>

            {/* ── Workflow column (admin/tech only, only when canActOn) ── */}
            {hasPanel && (
              <div className="td-workflow-col">
                <div className="td-card td-workflow-card">
                  <div className="td-card-header">
                    <h3 className="td-card-title">Ticket Workflow</h3>
                  </div>

                  {/* Step 2: Move to In Progress */}
                  {ticket.status === 'OPEN' && isAdmin && (
                    <div className="td-step-box td-step-box--yellow">
                      <div className="td-step-box-header">
                        <span className="td-step-num td-step-num--yellow">2</span>
                        <span className="td-step-box-title">Move to In Progress</span>
                      </div>
                      <p className="td-step-box-desc">Assign a technician (optional) and start working on this ticket.</p>

                      {technicians.length > 0 && (
                        <select
                          className="td-select td-select--yellow"
                          value={assignId}
                          onChange={e => setAssignId(e.target.value)}
                        >
                          <option value="">— Assign technician (optional) —</option>
                          {technicians.map(t => (
                            <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                          ))}
                        </select>
                      )}

                      <textarea
                        rows={2}
                        className="td-textarea td-textarea--yellow"
                        placeholder="Notes (optional)…"
                        value={techNotes}
                        onChange={e => setTechNotes(e.target.value)}
                      />
                      <button
                        className="td-action-btn td-action-btn--yellow"
                        disabled={busy}
                        onClick={handleMoveToInProgress}
                      >
                        <Icon.Play /> {busy ? 'Updating…' : 'Start — Move to In Progress'}
                      </button>
                    </div>
                  )}

                  {/* Step 3: Resolve */}
                  {ticket.status === 'IN_PROGRESS' && (isAdmin || isTech) && (
                    <div className="td-step-box td-step-box--green">
                      <div className="td-step-box-header">
                        <span className="td-step-num td-step-num--green">3</span>
                        <span className="td-step-box-title">Mark as Resolved</span>
                      </div>
                      <p className="td-step-box-desc">Describe what was done to fix the issue before marking resolved.</p>
                      <textarea
                        rows={3}
                        className="td-textarea td-textarea--green"
                        placeholder="Resolution notes (recommended)…"
                        value={techNotes}
                        onChange={e => setTechNotes(e.target.value)}
                      />
                      <button
                        className="td-action-btn td-action-btn--green"
                        disabled={busy}
                        onClick={handleResolve}
                      >
                        <Icon.Check /> {busy ? 'Updating…' : 'Mark as Resolved'}
                      </button>
                    </div>
                  )}

                  {/* Step 4: Close */}
                  {ticket.status === 'RESOLVED' && isAdmin && (
                    <div className="td-step-box td-step-box--gray">
                      <div className="td-step-box-header">
                        <span className="td-step-num td-step-num--gray">4</span>
                        <span className="td-step-box-title">Close the Ticket</span>
                      </div>
                      <p className="td-step-box-desc">Close once you've confirmed the issue is fully resolved.</p>
                      <button
                        className="td-action-btn td-action-btn--gray"
                        disabled={busy}
                        onClick={handleClose}
                      >
                        <Icon.X /> {busy ? 'Closing…' : 'Close Ticket'}
                      </button>
                    </div>
                  )}

                  {/* Danger zone — admin only */}
                  {isAdmin && (
                    <div className="td-danger-zone">
                      <div className="td-danger-label">Danger Zone</div>
                      <div className="td-danger-row">
                        {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                          <button
                            className="td-danger-btn td-danger-btn--reject"
                            disabled={busy}
                            onClick={() => setShowReject(true)}
                          >
                            Reject
                          </button>
                        )}
                        <button
                          className="td-danger-btn td-danger-btn--delete"
                          disabled={busy}
                          onClick={handleDelete}
                        >
                          <Icon.Trash /> Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Toast ── */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 100,
          background: '#1e293b', color: '#fff', fontSize: '0.875rem',
          padding: '0.625rem 1.125rem', borderRadius: '10px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
        }}>
          {toast}
        </div>
      )}

      {/* ── Reject modal ── */}
      {showReject && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 60, padding: '1rem', backdropFilter: 'blur(3px)',
        }}>
          <div style={{
            background: '#fff', borderRadius: '20px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
            width: '100%', maxWidth: '380px', padding: '1.75rem',
          }}>
            <h3 style={{ fontWeight: 800, color: '#1e293b', marginBottom: '0.25rem', fontSize: '1rem' }}>
              Reject Ticket #{ticket.id}
            </h3>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              This will notify the reporter with your reason.
            </p>
            <form onSubmit={handleReject}>
              <textarea
                rows={3}
                style={{
                  width: '100%', border: '1.5px solid #e2e8f0', borderRadius: '10px',
                  padding: '0.625rem 0.875rem', fontSize: '0.875rem', color: '#1e293b',
                  resize: 'none', outline: 'none', marginBottom: '1rem', fontFamily: 'inherit',
                }}
                placeholder="Reason for rejection…"
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                required
              />
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => { setShowReject(false); setRejectReason('') }}
                  style={{
                    flex: 1, border: '1.5px solid #e2e8f0', background: '#fff',
                    color: '#64748b', padding: '0.625rem', borderRadius: '10px',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                  }}
                >Cancel</button>
                <button
                  type="submit"
                  disabled={busy || !rejectReason.trim()}
                  style={{
                    flex: 1, background: '#ef4444', border: 'none', color: '#fff',
                    padding: '0.625rem', borderRadius: '10px',
                    fontSize: '0.875rem', fontWeight: 600, cursor: 'pointer',
                    opacity: (busy || !rejectReason.trim()) ? 0.5 : 1,
                  }}
                >{busy ? 'Rejecting…' : 'Confirm Reject'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
