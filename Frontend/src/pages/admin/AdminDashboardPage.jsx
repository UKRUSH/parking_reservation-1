import { useAuth } from '../../context/AuthContext'
import { useNotifications } from '../../context/NotificationContext'
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

export default function AdminDashboardPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus — Admin</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value="—" color="border-blue-500" />
          <StatCard title="Active Bookings" value="—" color="border-green-500" />
          <StatCard title="Open Tickets" value="—" color="border-yellow-500" />
          <StatCard title="Helmets Available" value="—" color="border-purple-500" />
        </div>

        {/* Quick links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button onClick={() => navigate('/admin/bookings')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left border-l-4 border-green-500">
            <p className="font-semibold text-gray-800">Parking Requests</p>
            <p className="text-sm text-gray-500 mt-1">Approve or reject student booking requests</p>
          </button>
          <button onClick={() => navigate('/admin/parking-management')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left border-l-4 border-blue-500">
            <p className="font-semibold text-gray-800">Parking Slot Management</p>
            <p className="text-sm text-gray-500 mt-1">Add, edit, update status and remove parking slots</p>
          </button>
          <button onClick={() => navigate('/parking')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left border-l-4 border-sky-400">
            <p className="font-semibold text-gray-800">Parking Map View</p>
            <p className="text-sm text-gray-500 mt-1">View live slot availability across all zones</p>
          </button>
          <button onClick={() => navigate('/admin/users')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left border-l-4 border-purple-500">
            <p className="font-semibold text-gray-800">User Management</p>
            <p className="text-sm text-gray-500 mt-1">View and manage user roles</p>
          </button>
          <button onClick={() => navigate('/notifications')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left border-l-4 border-yellow-500">
            <p className="font-semibold text-gray-800">Notifications</p>
            <p className="text-sm text-gray-500 mt-1">View system notifications</p>
          </button>
          <button onClick={() => navigate('/admin/helmet-borrowings')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left border-l-4 border-orange-500">
            <p className="font-semibold text-gray-800">Helmet Borrowings</p>
            <p className="text-sm text-gray-500 mt-1">Issue, reject and track helmet loans</p>
          </button>
          <button onClick={() => navigate('/tickets')}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition text-left border-l-4 border-red-500">
            <p className="font-semibold text-gray-800">Incident Tickets</p>
            <p className="text-sm text-gray-500 mt-1">Assign technicians and manage incident reports</p>
          </button>
        </div>
      </div>
    </div>
  )
}
