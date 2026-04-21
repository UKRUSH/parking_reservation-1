import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import MyBookingsPage from './pages/parking/MyBookingsPage'
import AdminBookingsPage from './pages/parking/AdminBookingsPage'
import StudentDashboardPage from './pages/student/StudentDashboardPage'

function HomeRedirect() {
  const { user, loading } = useAuth()
  if (loading) return null
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.roles?.includes('ADMIN') ? '/dashboard' : '/student-dashboard'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Admin dashboard */}
            <Route path="/dashboard" element={
              <AdminRoute><AdminDashboardPage /></AdminRoute>
            } />

            {/* Student dashboard */}
            <Route path="/student-dashboard" element={
              <ProtectedRoute><StudentDashboardPage /></ProtectedRoute>
            } />

            <Route path="/notifications" element={
              <ProtectedRoute><NotificationsPage /></ProtectedRoute>
            } />

            {/* Parking bookings — any authenticated user */}
            <Route path="/my-bookings" element={
              <ProtectedRoute><MyBookingsPage /></ProtectedRoute>
            } />

            {/* Admin only */}
            <Route path="/admin/users" element={
              <AdminRoute><UserManagementPage /></AdminRoute>
            } />
            <Route path="/admin/bookings" element={
              <AdminRoute><AdminBookingsPage /></AdminRoute>
            } />

            {/* Default redirect — role-aware */}
            <Route path="/" element={<HomeRedirect />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
