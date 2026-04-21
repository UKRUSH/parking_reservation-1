import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'

function QuickCard({ title, description, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left border-l-4 ${color}`}
    >
      <p className="font-semibold text-gray-800">{title}</p>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </button>
  )
}

export default function StudentDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            Welcome, {user?.name?.split(' ')[0]}
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage your parking bookings and notifications</p>
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <QuickCard
            title="My Parking Bookings"
            description="View history, request new booking, cancel"
            onClick={() => navigate('/my-bookings')}
            color="border-blue-500"
          />
          <QuickCard
            title="Notifications"
            description="Booking approvals, rejections, system alerts"
            onClick={() => navigate('/notifications')}
            color="border-yellow-500"
          />
        </div>
      </div>
    </div>
  )
}
