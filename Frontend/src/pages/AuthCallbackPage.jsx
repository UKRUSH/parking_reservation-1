import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const { loginWithToken } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      loginWithToken(token)
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
        const roles = payload.roles ? payload.roles.split(',') : []
        navigate(roles.includes('ADMIN') ? '/dashboard' : '/student/dashboard', { replace: true })
      } catch {
        navigate('/student/dashboard', { replace: true })
      }
    } else {
      navigate('/login', { replace: true })
    }
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Signing you in...</p>
    </div>
  )
}
