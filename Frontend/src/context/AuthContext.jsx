import { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api/authApi'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
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

  const logout = () => {
    authApi.logout().finally(() => {
      localStorage.removeItem('token')
      setUser(null)
      window.location.href = '/login'
    })
  }

  const hasRole = (role) => user?.roles?.includes(role)

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithToken, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

