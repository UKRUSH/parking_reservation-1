import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

const LOCAL_ADMIN_USER = { id: 0, name: 'Admin', email: 'admin@local', roles: ['ADMIN'] }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (localStorage.getItem('localAdmin') === 'true') {
      setUser(LOCAL_ADMIN_USER)
      setLoading(false)
      return
    }
    const token = localStorage.getItem('token')
    if (token) {
      authApi.getMe()
        .then((res) => setUser(res.data.data))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  // Called after Google OAuth callback (receives raw JWT string)
  const loginWithToken = (token) => {
    localStorage.setItem('token', token)
    authApi.getMe().then((res) => setUser(res.data.data))
  }

  // Called after email/password login (receives { token, user })
  const login = ({ token, user }) => {
    localStorage.setItem('token', token)
    setUser(user)
  }

  const loginAsLocalAdmin = () => {
    localStorage.setItem('localAdmin', 'true')
    setUser(LOCAL_ADMIN_USER)
  }

  const logout = () => {
    if (localStorage.getItem('localAdmin') === 'true') {
      localStorage.removeItem('localAdmin')
      setUser(null)
      window.location.href = '/login'
      return
    }
    authApi.logout().finally(() => {
      localStorage.removeItem('token')
      setUser(null)
      window.location.href = '/login'
    })
  }

  const hasRole = (role) => user?.roles?.includes(role)

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, loginAsLocalAdmin, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

