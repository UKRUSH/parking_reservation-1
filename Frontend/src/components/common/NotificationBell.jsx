import { useState, useRef, useEffect } from 'react'
import { useNotifications } from '../../context/NotificationContext'

const TYPE_ICON = {
  BOOKING_APPROVED:    { emoji: '✅', color: 'text-green-600'  },
  BOOKING_REJECTED:    { emoji: '❌', color: 'text-red-500'    },
  BOOKING_CANCELLED:   { emoji: '🚫', color: 'text-gray-500'   },
  BOOKING_ENDING_SOON: { emoji: '⏰', color: 'text-orange-500' },
  BOOKING_ENDED:       { emoji: '🏁', color: 'text-blue-500'   },
  BOOKING_REMINDER:    { emoji: '🔔', color: 'text-yellow-500' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications()
  const [open, setOpen]   = useState(false)
  const [tab, setTab]     = useState('all')
  const ref               = useRef(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const displayed = tab === 'unread'
    ? notifications.filter(n => !n.read)
    : notifications

  const handleOpen = () => setOpen(o => !o)

  const handleClick = (n) => {
    if (!n.read) markAsRead(n.id)
  }

  return (
    <div className="relative" ref={ref}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-full hover:bg-gray-100 transition"
        aria-label="Notifications"
      >
        <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold leading-none">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden">

          {/* Header */}
          <div className="flex items-center justify-between px-4 pt-4 pb-2">
            <span className="font-bold text-gray-800 text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-blue-500 hover:underline"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Tabs */}
          <div className="flex gap-2 px-4 pb-2">
            <button
              onClick={() => setTab('all')}
              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                tab === 'all'
                  ? 'bg-gray-100 text-gray-800'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setTab('unread')}
              className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${
                tab === 'unread'
                  ? 'bg-gray-100 text-gray-800'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              Unread ({unreadCount})
            </button>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {displayed.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                <span className="text-4xl mb-2">🔔</span>
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : (
              displayed.map(n => {
                const icon = TYPE_ICON[n.type] ?? { emoji: '🔔', color: 'text-gray-500' }
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${
                      !n.read ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <span className="text-xl mt-0.5 shrink-0">{icon.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold ${!n.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.message}</p>
                      <p className="text-[10px] text-gray-400 mt-1">{timeAgo(n.createdAt)}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      {!n.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full mt-1" />
                      )}
                      <button
                        onClick={e => { e.stopPropagation(); deleteNotification(n.id) }}
                        className="text-gray-300 hover:text-red-400 text-xs transition-colors"
                        title="Delete"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {displayed.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 text-center">
              <span className="text-[10px] text-gray-400">Click a notification to mark it as read</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
