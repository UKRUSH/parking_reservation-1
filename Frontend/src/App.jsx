import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminRoute from './routes/AdminRoute'

import LoginPage from './pages/LoginPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import StudentDashboardPage from './pages/student/StudentDashboardPage'
import UserManagementPage from './pages/admin/UserManagementPage'
import NotificationsPage from './pages/notifications/NotificationsPage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />

            {/* Protected — any authenticated user */}
            <Route path="/dashboard" element={
              <ProtectedRoute><AdminDashboardPage /></ProtectedRoute>
            } />
            <Route path="/student/dashboard" element={
              <ProtectedRoute><StudentDashboardPage /></ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute><NotificationsPage /></ProtectedRoute>
            } />

            {/* Admin only */}
            <Route path="/admin/users" element={
              <AdminRoute><UserManagementPage /></AdminRoute>
            } />

            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
