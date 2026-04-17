import { useEffect, useState } from 'react'
import { notificationApi } from '../../api/notificationApi'
import { useNotifications } from '../../context/NotificationContext'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { fetchUnreadCount } = useNotifications()

  const load = () => {
    notificationApi.getAll()
      .then((res) => setNotifications(res.data.data || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const markRead = async (id) => {
    await notificationApi.markAsRead(id)
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n))
    fetchUnreadCount()
  }

  const markAll = async () => {
    await notificationApi.markAllAsRead()
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
    fetchUnreadCount()
  }

  const remove = async (id) => {
    await notificationApi.delete(id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
    fetchUnreadCount()
  }

  if (loading) return <div className="p-6 text-gray-500">Loading...</div>

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Notifications</h1>
        {notifications.some((n) => !n.read) && (
          <button onClick={markAll} className="text-sm text-blue-600 hover:underline">
            Mark all as read
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <p className="text-gray-400 text-center py-12">No notifications</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((n) => (
            <li key={n.id}
              className={`p-4 rounded-xl border ${n.read ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-200'}`}>
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{n.title}</p>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  {!n.read && (
                    <button onClick={() => markRead(n.id)}
                      className="text-xs text-blue-600 hover:underline">
                      Mark read
                    </button>
                  )}
                  <button onClick={() => remove(n.id)}
                    className="text-xs text-red-500 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
