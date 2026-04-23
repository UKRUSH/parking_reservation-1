import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../api/authApi'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      navigate('/login', { replace: true })
      return
    }
    localStorage.setItem('token', token)
    authApi.getMe()
      .then((res) => {
        const userData = res.data.data
        login({ token, user: userData })
        const isAdmin = userData?.roles?.includes('ADMIN')
        navigate(isAdmin ? '/admin/dashboard' : '/student/dashboard', { replace: true })
      })
      .catch(() => {
        localStorage.removeItem('token')
        navigate('/login', { replace: true })
      })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  )
}
