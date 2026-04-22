import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { helmetBorrowingApi } from '../../api/helmetBorrowingApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'

const STATUS_STYLE = {
  PENDING:  { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  ISSUED:   { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  REJECTED: { bg: 'bg-red-100',    text: 'text-red-700'    },
  RETURNED: { bg: 'bg-gray-100',   text: 'text-gray-600'   },
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function MyBorrowingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [borrowings, setBorrowings] = useState([])
  const [loading, setLoading]       = useState(true)
  const [showForm, setShowForm]      = useState(false)
  const [purpose, setPurpose]        = useState('')
  const [submitting, setSubmitting]  = useState(false)
  const [error, setError]            = useState(null)
  const [success, setSuccess]        = useState(null)

  const load = () => {
    setLoading(true)
    helmetBorrowingApi.getAll()
      .then(res => setBorrowings(res.data.data || []))
      .catch(() => setBorrowings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleRequest = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    setSuccess(null)
    try {
      await helmetBorrowingApi.create({ purpose: purpose.trim() || undefined })
      setSuccess('Helmet borrowing request submitted! Awaiting admin approval.')
      setPurpose('')
      setShowForm(false)
      load()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const hasActive = borrowings.some(b => b.status === 'PENDING' || b.status === 'ISSUED')

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={() => navigate('/student/dashboard')} className="text-sm text-blue-500 hover:underline">
            Dashboard
          </button>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Helmet Borrowings</h2>
            <p className="text-sm text-gray-500 mt-0.5">Request and track your campus helmet loans</p>
          </div>
          {!hasActive && (
            <button
              onClick={() => { setShowForm(s => !s); setError(null) }}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : '+ Request Helmet'}
            </button>
          )}
        </div>

        {/* Active-request banner */}
        {hasActive && (
          <div className="mb-5 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
            You have an active helmet request. You can submit a new one once it is resolved.
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="mb-5 px-4 py-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Request form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4">New Helmet Borrow Request</h3>
            <form onSubmit={handleRequest} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Purpose <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Motorcycle ride to lecture block"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setError(null) }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting…' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Borrowings list */}
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : borrowings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 text-sm">
            No helmet borrowings yet.{' '}
            <button
              onClick={() => setShowForm(true)}
              className="text-blue-500 hover:underline"
            >
              Request one now.
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {borrowings.map(b => {
              const s = STATUS_STYLE[b.status] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
              return (
                <div key={b.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <p className="font-semibold text-gray-800">Helmet Request #{b.id}</p>
                      {b.purpose && (
                        <p className="text-sm text-gray-500">Purpose: {b.purpose}</p>
                      )}
                      <p className="text-xs text-gray-400">Requested: {fmt(b.createdAt)}</p>
                      {b.issuedAt   && <p className="text-xs text-blue-500">Issued: {fmt(b.issuedAt)}</p>}
                      {b.returnedAt && <p className="text-xs text-gray-500">Returned: {fmt(b.returnedAt)}</p>}
                      {b.rejectionReason && (
                        <p className="text-xs text-red-500 mt-1">Reason: {b.rejectionReason}</p>
                      )}
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                      {b.status}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
