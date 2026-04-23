import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { notificationApi } from '../api/notificationApi'
import { useAuth } from './AuthContext'

const NotificationContext = createContext(null)

export function NotificationProvider({ children }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount]     = useState(0)

  const hasToken = () => !!localStorage.getItem('token')

  const fetchNotifications = useCallback(() => {
    if (!user || !hasToken()) return
    notificationApi.getAll()
      .then(res => {
        const list = res.data.data || []
        setNotifications(list)
        setUnreadCount(list.filter(n => !n.read).length)
      })
      .catch(() => {})
  }, [user])

  // Poll every 30 s while logged in
  useEffect(() => {
    if (!user || !hasToken()) return
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [user, fetchNotifications])

  const markAsRead = async (id) => {
    await notificationApi.markAsRead(id)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    setUnreadCount(prev => Math.max(0, prev - 1))
  }

  const markAllAsRead = async () => {
    await notificationApi.markAllAsRead()
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)
  }

  const deleteNotification = async (id) => {
    await notificationApi.delete(id)
    const wasUnread = notifications.find(n => n.id === id && !n.read)
    setNotifications(prev => prev.filter(n => n.id !== id))
    if (wasUnread) setUnreadCount(prev => Math.max(0, prev - 1))
  }

  return (
    <NotificationContext.Provider value={{
      notifications, unreadCount,
      fetchNotifications, markAsRead, markAllAsRead, deleteNotification,
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotifications = () => useContext(NotificationContext)
