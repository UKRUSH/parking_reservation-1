import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { helmetBorrowingApi } from '../../api/helmetBorrowingApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'

const STATUS_STYLE = {
  PENDING:  'bg-yellow-100 text-yellow-700',
  ISSUED:   'bg-blue-100 text-blue-700',
  REJECTED: 'bg-red-100 text-red-700',
  RETURNED: 'bg-gray-100 text-gray-600',
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function AdminBorrowingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [borrowings, setBorrowings] = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('ALL')
  const [rejectId, setRejectId]     = useState(null)
  const [reason, setReason]         = useState('')
  const [busy, setBusy]             = useState(false)
  const [toast, setToast]           = useState(null)

  const load = () => {
    setLoading(true)
    helmetBorrowingApi.getAll()
      .then(res => setBorrowings(res.data.data || []))
      .catch(() => setBorrowings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const notify = (msg) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const handleIssue = async (id) => {
    setBusy(true)
    try {
      await helmetBorrowingApi.issue(id)
      notify('Helmet issued successfully.')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to issue helmet.')
    } finally { setBusy(false) }
  }

  const handleReject = async (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    setBusy(true)
    try {
      await helmetBorrowingApi.reject(rejectId, reason.trim())
      notify('Request rejected.')
      setRejectId(null)
      setReason('')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to reject.')
    } finally { setBusy(false) }
  }

  const handleReturn = async (id) => {
    setBusy(true)
    try {
      await helmetBorrowingApi.return(id)
      notify('Helmet marked as returned.')
      load()
    } catch (err) {
      notify(err.response?.data?.message || 'Failed to mark as returned.')
    } finally { setBusy(false) }
  }

  const FILTERS = ['ALL', 'PENDING', 'ISSUED', 'REJECTED', 'RETURNED']
  const displayed = filter === 'ALL' ? borrowings : borrowings.filter(b => b.status === filter)

  const counts = borrowings.reduce((acc, b) => {
    acc[b.status] = (acc[b.status] || 0) + 1
    return acc
  }, {})

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus — Admin</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={() => navigate('/admin/dashboard')} className="text-sm text-blue-500 hover:underline">
            Dashboard
          </button>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 py-8">

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
              <h3 className="font-bold text-gray-800 mb-1">Reject Request #{rejectId}</h3>
              <p className="text-sm text-gray-500 mb-4">Provide a reason that will be sent to the student.</p>
              <form onSubmit={handleReject} className="space-y-3">
                <textarea
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
                  placeholder="Enter rejection reason…"
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
                    {busy ? 'Rejecting…' : 'Reject'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Helmet Borrowings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Issue, reject, and mark helmets as returned</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Pending',  key: 'PENDING',  color: 'border-yellow-400 text-yellow-700' },
            { label: 'Issued',   key: 'ISSUED',   color: 'border-blue-400   text-blue-700'   },
            { label: 'Rejected', key: 'REJECTED', color: 'border-red-400    text-red-700'    },
            { label: 'Returned', key: 'RETURNED', color: 'border-gray-400   text-gray-600'   },
          ].map(({ label, key, color }) => (
            <div key={key} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${color.split(' ')[0]}`}>
              <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
              <p className={`text-2xl font-bold mt-1 ${color.split(' ')[1]}`}>{counts[key] ?? 0}</p>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {FILTERS.map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f === 'ALL' ? `All (${borrowings.length})` : `${f} (${counts[f] ?? 0})`}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : displayed.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 text-sm">
            No records found for this filter.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                  <th className="text-left px-5 py-3">#</th>
                  <th className="text-left px-5 py-3">Student</th>
                  <th className="text-left px-5 py-3">Purpose</th>
                  <th className="text-left px-5 py-3">Requested</th>
                  <th className="text-left px-5 py-3">Status</th>
                  <th className="text-left px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((b, idx) => (
                  <tr key={b.id} className={`border-b border-gray-50 ${idx % 2 === 0 ? '' : 'bg-gray-50/40'}`}>
                    <td className="px-5 py-3 text-gray-400 font-mono">{b.id}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-gray-800">{b.userName}</p>
                      <p className="text-xs text-gray-400">{b.userEmail}</p>
                    </td>
                    <td className="px-5 py-3 text-gray-500 max-w-[160px]">
                      <p className="text-xs font-semibold text-gray-700 mb-0.5">
                        {b.quantity === 2 ? '🪖🪖 2 helmets' : '🪖 1 helmet'}
                      </p>
                      <span className="truncate block">{b.purpose || <span className="text-gray-300 italic">—</span>}</span>
                      {b.rejectionReason && (
                        <p className="text-xs text-red-400 mt-0.5">↳ {b.rejectionReason}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">{fmt(b.createdAt)}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLE[b.status] ?? ''}`}>
                        {b.status}
                      </span>
                      {b.issuedAt   && <p className="text-xs text-gray-400 mt-0.5">Issued {fmt(b.issuedAt)}</p>}
                      {b.returnedAt && <p className="text-xs text-gray-400 mt-0.5">Returned {fmt(b.returnedAt)}</p>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {b.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleIssue(b.id)}
                              disabled={busy}
                              className="px-2.5 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                            >
                              Issue
                            </button>
                            <button
                              onClick={() => { setRejectId(b.id); setReason('') }}
                              disabled={busy}
                              className="px-2.5 py-1 bg-red-500 text-white rounded text-xs font-medium hover:bg-red-600 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        {b.status === 'ISSUED' && (
                          <button
                            onClick={() => handleReturn(b.id)}
                            disabled={busy}
                            className="px-2.5 py-1 bg-green-600 text-white rounded text-xs font-medium hover:bg-green-700 disabled:opacity-50"
                          >
                            Mark Returned
                          </button>
                        )}
                        {(b.status === 'REJECTED' || b.status === 'RETURNED') && (
                          <span className="text-xs text-gray-400 italic">No actions</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
