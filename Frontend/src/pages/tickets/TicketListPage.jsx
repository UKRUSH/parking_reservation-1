import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketApi } from '../../api/ticketApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import TicketCard from '../../components/tickets/TicketCard'

const STATUS_FILTERS = ['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED', 'REJECTED']

const STATUS_STYLE = {
  OPEN:        'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED:    'bg-green-100 text-green-700',
  CLOSED:      'bg-gray-100 text-gray-600',
  REJECTED:    'bg-red-100 text-red-700',
}

const PRIORITY_STYLE = {
  LOW:      'bg-gray-100 text-gray-500',
  MEDIUM:   'bg-blue-50 text-blue-600',
  HIGH:     'bg-orange-100 text-orange-600',
  CRITICAL: 'bg-red-100 text-red-600',
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function TicketListPage() {
  const { user, logout, hasRole } = useAuth()
  const navigate = useNavigate()
  const isAdmin = hasRole('ADMIN')
  const isTech  = hasRole('TECHNICIAN')

  const [tickets, setTickets]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState('ALL')
  const [search, setSearch]     = useState('')
  const [busy, setBusy]         = useState(false)
  const [toast, setToast]       = useState(null)
  const [rejectId, setRejectId] = useState(null)
  const [reason, setReason]     = useState('')

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 3000) }

  const load = () => {
    setLoading(true)
    ticketApi.getAll(filter === 'ALL' ? null : filter)
      .then(res => setTickets(res.data.data || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [filter])

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

  const dashboardPath = isAdmin ? '/admin/dashboard' : '/student/dashboard'

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus{isAdmin ? ' — Admin' : ''}</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={() => navigate(dashboardPath)} className="text-sm text-blue-500 hover:underline">
            Dashboard
          </button>
          {!isTech && (
            <button
              onClick={() => navigate('/tickets/new')}
              className="text-sm bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700"
            >
              + Report Incident
            </button>
          )}
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-gray-900 text-white text-sm px-4 py-2.5 rounded-lg shadow-lg">
          {toast}
        </div>
      )}

      {/* Reject modal */}
      {rejectId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-800 mb-1">Reject Ticket #{rejectId}</h3>
            <p className="text-sm text-gray-500 mb-4">Provide a reason to send to the reporter.</p>
            <form onSubmit={handleReject} className="space-y-3">
              <textarea
                rows={3}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-red-400"
                placeholder="Rejection reason…"
                value={reason}
                onChange={e => setReason(e.target.value)}
                required
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setRejectId(null); setReason('') }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy || !reason.trim()}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                >
                  {busy ? 'Rejecting…' : 'Confirm Reject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Incident Tickets</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            {isAdmin ? 'Manage all reported incidents — assign, update, reject, or delete'
              : isTech ? 'Tickets assigned to you'
              : 'Your reported incidents'}
          </p>
        </div>

        {/* Summary cards — admin only */}
        {isAdmin && (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-6">
            {[
              { label: 'Open',        key: 'OPEN',        color: 'border-blue-400 text-blue-700'     },
              { label: 'In Progress', key: 'IN_PROGRESS', color: 'border-yellow-400 text-yellow-700' },
              { label: 'Resolved',    key: 'RESOLVED',    color: 'border-green-400 text-green-700'   },
              { label: 'Closed',      key: 'CLOSED',      color: 'border-gray-400 text-gray-600'     },
              { label: 'Rejected',    key: 'REJECTED',    color: 'border-red-400 text-red-700'       },
            ].map(({ label, key, color }) => (
              <div key={key} className={`bg-white rounded-xl p-3 shadow-sm border-l-4 ${color.split(' ')[0]}`}>
                <p className="text-xs text-gray-500">{label}</p>
                <p className={`text-xl font-bold mt-0.5 ${color.split(' ')[1]}`}>{counts[key] ?? 0}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search + filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <input
            type="text"
            placeholder="Search by title, location, or reporter…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <div className="flex flex-wrap gap-2">
            {STATUS_FILTERS.map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                }`}
              >
                {f === 'ALL' ? `All (${tickets.length})` : f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-10 text-center text-gray-400 text-sm">
            {tickets.length === 0 ? 'No tickets yet.' : 'No tickets match your search.'}
          </div>
        ) : isAdmin ? (
          /* ── Admin table view ── */
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">#</th>
                  <th className="text-left px-5 py-3">Title</th>
                  <th className="text-left px-5 py-3">Reporter</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Priority</th>
                  <th className="text-left px-5 py-3">Technician</th>
                  <th className="text-left px-5 py-3">Created</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((t, idx) => (
                  <tr key={t.id} className={`border-b border-gray-50 ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-5 py-3 text-gray-400 font-mono">{t.id}</td>
                    <td className="px-5 py-3 max-w-[200px]">
                      <p className="font-medium text-gray-800 truncate">{t.title}</p>
                      {t.location && <p className="text-xs text-gray-400 mt-0.5">📍 {t.location}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{t.userName}</p>
                      <p className="text-xs text-gray-400">{t.userEmail}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[t.status] ?? ''}`}>
                        {t.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLE[t.priority] ?? ''}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-gray-500 text-xs">
                      {t.technicianName
                        ? <span className="text-gray-700">🔧 {t.technicianName}</span>
                        : <span className="text-gray-300 italic">Unassigned</span>}
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap text-xs">{fmt(t.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {/* Manage — always available */}
                        <button
                          onClick={() => navigate(`/tickets/${t.id}`)}
                          className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700"
                        >
                          Manage
                        </button>

                        {/* Reject — OPEN or IN_PROGRESS */}
                        {(t.status === 'OPEN' || t.status === 'IN_PROGRESS') && (
                          <button
                            onClick={() => { setRejectId(t.id); setReason('') }}
                            disabled={busy}
                            className="px-2.5 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        )}

                        {/* Delete — always available for admin */}
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={busy}
                          className="px-2.5 py-1 border border-red-300 text-red-500 rounded text-xs font-medium hover:bg-red-50 disabled:opacity-50"
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
          /* ── Student / Tech card view ── */
          <div className="grid sm:grid-cols-2 gap-4">
            {displayed.map(t => <TicketCard key={t.id} ticket={t} />)}
          </div>
        )}
      </div>
    </div>
  )
}
