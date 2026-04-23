import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'
import StudentRoute from './routes/StudentRoute'

import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import AdminBookingsPage from './pages/parking/AdminBookingsPage'
import StudentDashboardPage from './pages/student/StudentDashboardPage'
import MyBookingsPage from './pages/parking/MyBookingsPage'
import ParkingSlotsPage from './pages/parking/ParkingSlotsPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import MyBorrowingsPage from './pages/helmets/MyBorrowingsPage'
import AdminBorrowingsPage from './pages/helmets/AdminBorrowingsPage'
import TicketListPage from './pages/tickets/TicketListPage'
import CreateTicketPage from './pages/tickets/CreateTicketPage'
import TicketDetailPage from './pages/tickets/TicketDetailPage'
import ParkingCataloguePage from './pages/parking/ParkingCataloguePage'
import HelmetCataloguePage from './pages/helmets/HelmetCataloguePage'
import ResourceManagementPage from './pages/admin/ResourceManagementPage'
import AdminParkingSlotsPage from './pages/parking/AdminParkingSlotsPage'

// Redirects to the right dashboard based on role
function RoleRedirect() {
  const { user, loading, hasRole } = useAuth()
  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  return hasRole('ADMIN')
    ? <Navigate to="/admin/dashboard" replace />
    : <Navigate to="/student/dashboard" replace />
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

            {/* Role-based root redirect */}
            <Route path="/" element={<RoleRedirect />} />
            <Route path="/dashboard" element={<RoleRedirect />} />

            {/* Student routes */}
            <Route path="/student/dashboard" element={
              <StudentRoute><StudentDashboardPage /></StudentRoute>
            } />
            <Route path="/my-bookings" element={
              <StudentRoute><MyBookingsPage /></StudentRoute>
            } />
            <Route path="/parking" element={
              <ProtectedRoute><ParkingSlotsPage /></ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute><NotificationsPage /></ProtectedRoute>
            } />
            <Route path="/my-borrowings" element={
              <StudentRoute><MyBorrowingsPage /></StudentRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin/dashboard" element={
              <AdminRoute><AdminDashboardPage /></AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute><UserManagementPage /></AdminRoute>
            } />
            <Route path="/admin/bookings" element={
              <AdminRoute><AdminBookingsPage /></AdminRoute>
            } />
            <Route path="/admin/helmet-borrowings" element={
              <AdminRoute><AdminBorrowingsPage /></AdminRoute>
            } />
            <Route path="/admin/resources" element={
              <AdminRoute><ResourceManagementPage /></AdminRoute>
            } />
            <Route path="/admin/parking-slots" element={
              <AdminRoute><ParkingCataloguePage /></AdminRoute>
            } />
            <Route path="/admin/parking-management" element={
              <AdminRoute><AdminParkingSlotsPage /></AdminRoute>
            } />
            <Route path="/admin/helmets" element={
              <AdminRoute><HelmetCataloguePage /></AdminRoute>
            } />

            {/* Ticket routes — all authenticated users */}
            <Route path="/tickets" element={
              <ProtectedRoute><TicketListPage /></ProtectedRoute>
            } />
            <Route path="/tickets/new" element={
              <ProtectedRoute><CreateTicketPage /></ProtectedRoute>
            } />
            <Route path="/tickets/:id" element={
              <ProtectedRoute><TicketDetailPage /></ProtectedRoute>
            } />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
