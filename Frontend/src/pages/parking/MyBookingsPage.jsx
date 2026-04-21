import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parkingBookingApi } from '../../api/parkingBookingApi'
import BookingForm from '../../components/parking/BookingForm'
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

export default function MyBookingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  const loadBookings = () => {
    setLoading(true)
    parkingBookingApi.getAll()
      .then((res) => setBookings(res.data.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadBookings()
  }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    await parkingBookingApi.cancel(id)
    loadBookings()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={() => navigate('/dashboard')} className="text-sm text-blue-500 hover:underline">
            Dashboard
          </button>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">My Parking Bookings</h2>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            {showForm ? 'Close' : '+ New Booking'}
          </button>
        </div>

        {showForm && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">New Booking Request</h3>
            <BookingForm
              onSuccess={() => { setShowForm(false); loadBookings() }}
              onCancel={() => setShowForm(false)}
            />
          </div>
        )}

        {loading ? (
          <p className="text-gray-500">Loading bookings...</p>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
            No bookings found. Create your first booking above.
          </div>
        ) : (
          <div className="space-y-3">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-xl shadow-sm p-5">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-800">
                      Slot {b.slotNumber}
                      {b.zone && <span className="text-gray-500 font-normal"> — Zone {b.zone}</span>}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatDateTime(b.startTime)} → {formatDateTime(b.endTime)}
                    </p>
                    {b.purpose && (
                      <p className="text-sm text-gray-600 mt-1">Purpose: {b.purpose}</p>
                    )}
                    {b.rejectionReason && (
                      <p className="text-sm text-red-500 mt-1">Reason: {b.rejectionReason}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status] ?? ''}`}>
                      {b.status}
                    </span>
                    {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                      <button
                        onClick={() => handleCancel(b.id)}
                        className="text-xs text-red-500 hover:underline"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
