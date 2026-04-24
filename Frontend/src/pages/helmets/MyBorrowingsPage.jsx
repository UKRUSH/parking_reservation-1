import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { helmetBorrowingApi } from '../../api/helmetBorrowingApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'

const STATUS_STYLE = {
  PENDING:   { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  ISSUED:    { bg: 'bg-blue-100',   text: 'text-blue-700'   },
  REJECTED:  { bg: 'bg-red-100',    text: 'text-red-700'    },
  RETURNED:  { bg: 'bg-gray-100',   text: 'text-gray-600'   },
  CANCELLED: { bg: 'bg-gray-100',   text: 'text-gray-500'   },
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
  const [cancelling, setCancelling] = useState(null)

  const load = () => {
    setLoading(true)
    helmetBorrowingApi.getAll()
      .then(res => setBorrowings(res.data.data || []))
      .catch(() => setBorrowings([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this helmet request?')) return
    setCancelling(id)
    try {
      await helmetBorrowingApi.cancel(id)
      load()
    } catch {
      alert('Could not cancel request. Please try again.')
    } finally {
      setCancelling(null)
    }
  }

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
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Helmet Borrowings</h2>
          <p className="text-sm text-gray-500 mt-0.5">Track your campus helmet loans</p>
        </div>

        {/* Info banner */}
        <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-orange-50 border border-orange-200 rounded-xl">
          <span className="text-xl mt-0.5">🪖</span>
          <div className="text-sm text-orange-800">
            <p className="font-semibold">Helmet requests are made through Motorcycle bookings</p>
            <p className="mt-0.5 text-orange-600">
              When reserving a Motorcycle parking slot, you can optionally request a campus helmet at the same time.{' '}
              <button
                onClick={() => navigate('/my-bookings')}
                className="underline font-medium hover:text-orange-800"
              >
                Go to My Bookings →
              </button>
            </p>
          </div>
        </div>

        {/* Borrowings list */}
        {loading ? (
          <p className="text-gray-500 text-sm">Loading…</p>
        ) : borrowings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500 text-sm">
            No helmet borrowings yet.{' '}
            <button
              onClick={() => navigate('/my-bookings')}
              className="text-blue-500 hover:underline"
            >
              Book a motorcycle slot to request one.
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {borrowings.map(b => {
              const s = STATUS_STYLE[b.status] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
              return (
                <div key={b.id} className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1 flex-1 min-w-0">
                      <p className="font-semibold text-gray-800">Helmet Request #{b.id}</p>
                      <p className="text-sm text-gray-600">
                        {b.quantity === 2 ? '2 helmets' : '1 helmet'}
                      </p>
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
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.text}`}>
                        {b.status}
                      </span>
                      {b.status === 'PENDING' && (
                        <button
                          onClick={() => handleCancel(b.id)}
                          disabled={cancelling === b.id}
                          className="text-xs font-semibold text-red-500 border border-red-200 rounded-lg px-3 py-1 hover:bg-red-50 disabled:opacity-50 transition-colors"
                        >
                          {cancelling === b.id ? 'Cancelling…' : 'Cancel'}
                        </button>
                      )}
                    </div>
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
