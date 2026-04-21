import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parkingBookingApi } from '../../api/parkingBookingApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'

const STATUS_STYLES = {
  PENDING: 'bg-yellow-100 text-yellow-700',
  APPROVED: 'bg-green-100 text-green-700',
  REJECTED: 'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

function formatDateTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString()
}

export default function AdminBookingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(null)

  const loadBookings = () => {
    setLoading(true)
    parkingBookingApi.getAll()
      .then((res) => setBookings(res.data.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleApprove = async (id) => {
    setActionLoading(id + '-approve')
    try {
      await parkingBookingApi.approve(id)
      loadBookings()
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:')
    if (reason === null) return
    setActionLoading(id + '-reject')
    try {
      await parkingBookingApi.reject(id, reason || 'No reason provided')
      loadBookings()
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    setActionLoading(id + '-cancel')
    try {
      await parkingBookingApi.cancel(id)
      loadBookings()
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus — Admin</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-500 hover:underline">
            Dashboard
          </button>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">All Parking Bookings</h2>

        {loading ? (
          <p className="text-gray-500">Loading bookings...</p>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Slot</th>
                  <th className="px-4 py-3 text-left">Start</th>
                  <th className="px-4 py-3 text-left">End</th>
                  <th className="px-4 py-3 text-left">Purpose</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      No bookings found.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr key={b.id}>
                      <td className="px-4 py-3 font-medium text-gray-800">{b.userName}</td>
                      <td className="px-4 py-3 text-gray-700">
                        {b.slotNumber}
                        {b.zone && <span className="text-gray-400 text-xs ml-1">({b.zone})</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDateTime(b.startTime)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                        {formatDateTime(b.endTime)}
                      </td>
                      <td className="px-4 py-3 text-gray-600 max-w-[160px] truncate">
                        {b.purpose || '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status] ?? ''}`}>
                          {b.status}
                        </span>
                        {b.rejectionReason && (
                          <p className="text-xs text-red-400 mt-1">{b.rejectionReason}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          {b.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleApprove(b.id)}
                                disabled={actionLoading === b.id + '-approve'}
                                className="text-xs text-green-600 hover:underline disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => handleReject(b.id)}
                                disabled={actionLoading === b.id + '-reject'}
                                className="text-xs text-red-500 hover:underline disabled:opacity-50"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {b.status === 'APPROVED' && (
                            <button
                              onClick={() => handleCancel(b.id)}
                              disabled={actionLoading === b.id + '-cancel'}
                              className="text-xs text-gray-500 hover:underline disabled:opacity-50"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
