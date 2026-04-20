import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import NotificationBell from '../../components/common/NotificationBell'

function StatCard({ title, value, color }) {
  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${color}`}>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
    </div>
  )
}

export default function StudentDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus — Student</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {user?.name || 'Student'}</h2>
        <p className="text-gray-500 mb-6">{user?.email}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatCard title="My Bookings" value="—" color="border-blue-500" />
          <StatCard title="Active Reservation" value="—" color="border-green-500" />
          <StatCard title="Notifications" value="—" color="border-yellow-500" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/parking')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <p className="font-semibold text-gray-800">Book Parking Slot</p>
            <p className="text-sm text-gray-500 mt-1">Reserve a parking spot</p>
          </button>
          <button
            onClick={() => navigate('/notifications')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left"
          >
            <p className="font-semibold text-gray-800">Notifications</p>
            <p className="text-sm text-gray-500 mt-1">View your notifications</p>
          </button>
        </div>
      </div>
    </div>
  )
}
