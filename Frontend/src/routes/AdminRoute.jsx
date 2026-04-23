import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AdminRoute({ children }) {
  const { user, loading, hasRole } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  if (!user) return <Navigate to="/login" replace />
  if (!hasRole('ADMIN')) return <Navigate to="/student/dashboard" replace />

  return children
}
