import { useNavigate, useLocation } from 'react-router-dom'

/* ── Nav icons ───────────────────────────────────────────────────────────── */
const Icon = {
  Dashboard: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Wrench: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Bookings: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  Parking: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v-4m0 0V6h5a3 3 0 010 6H8z" />
      <rect x="3" y="3" width="18" height="18" rx="3" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
    </svg>
  ),
  Map: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Helmet: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Users: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Shield: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Bell: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  Logout: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Info: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
}

export default function TicketSidebar({ open, onClose, user, logout, isAdmin, isTech }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = isAdmin
    ? [
        { path: '/admin/dashboard',          label: 'Dashboard',          Ico: Icon.Dashboard },
        { path: '/admin/bookings',           label: 'Parking Requests',   Ico: Icon.Bookings  },
        { path: '/admin/parking-management', label: 'Slot Management',    Ico: Icon.Parking   },
        { path: '/parking',                  label: 'Parking Map',        Ico: Icon.Map       },
        { path: '/admin/helmet-borrowings',  label: 'Helmet Borrowings',  Ico: Icon.Helmet    },
        { path: '/admin/users',              label: 'User Management',    Ico: Icon.Users     },
        { path: '/tickets',                  label: 'Incident Tickets',   Ico: Icon.Shield    },
        { path: '/notifications',            label: 'Notifications',      Ico: Icon.Bell      },
      ]
    : isTech
    ? [
        { path: '/technician/dashboard', label: 'Dashboard',        Ico: Icon.Wrench },
        { path: '/tickets',              label: 'Assigned Tickets', Ico: Icon.Shield },
        { path: '/notifications',        label: 'Notifications',    Ico: Icon.Bell   },
      ]
    : [
        { path: '/student/dashboard', label: 'Dashboard',          Ico: Icon.Dashboard },
        { path: '/my-bookings',       label: 'My Bookings',        Ico: Icon.Bookings },
        { path: '/parking',           label: 'Find Parking',       Ico: Icon.Parking },
        { path: '/my-borrowings',     label: 'Helmet Borrowings',  Ico: Icon.Helmet },
        { path: '/tickets',           label: 'Incident Tickets',   Ico: Icon.Shield },
        { path: '/notifications',     label: 'Notifications',      Ico: Icon.Bell },
      ]

  const go = (path) => { navigate(path); onClose() }
  const roleLabel = isAdmin ? 'Administrator' : isTech ? 'Technician' : 'Student'
  const isTicketsActive = location.pathname.startsWith('/tickets')

  const isActive = (path) => {
    if (path === '/tickets') return isTicketsActive
    return location.pathname === path
  }

  return (
    <>
      <div className={`sd-overlay ${open ? '' : 'hidden'}`} onClick={onClose} />
      <aside className={`sd-sidebar ${open ? 'open' : ''}`}>

        <div className="sd-sidebar-header">
          <div className="sd-sidebar-logo">SC</div>
          <div>
            <div className="sd-sidebar-brand">Smart Campus</div>
            <div className="sd-sidebar-brand-sub">
              {isAdmin ? 'Admin Portal' : isTech ? 'Technician Portal' : 'Parking Portal'}
            </div>
          </div>
        </div>

        <div className="sd-sidebar-user">
          <div className="sd-sidebar-avatar">{user?.name?.[0]?.toUpperCase() ?? '?'}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sd-sidebar-user-name">{user?.name ?? 'User'}</div>
            <div className="sd-sidebar-user-role">{roleLabel}</div>
          </div>
        </div>

        <div className="sd-nav-label">{isAdmin ? 'Management' : isTech ? 'Navigation' : 'Menu'}</div>
        <ul className="sd-nav">
          {navItems.map(({ path, label, Ico }) => (
            <li key={path}>
              <button
                className={`sd-nav-item ${isActive(path) ? 'active' : ''}`}
                onClick={() => go(path)}
              >
                <Ico />
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="sd-sidebar-tip">
          <div className="sd-sidebar-tip-icon"><Icon.Info /></div>
          <p>{isTech
            ? 'Update ticket status after completing repairs to notify the reporter.'
            : 'Attach images to help technicians understand the issue faster.'
          }</p>
        </div>

        <div className="sd-sidebar-footer">
          <button className="sd-sidebar-logout" onClick={logout}>
            <Icon.Logout />
            Sign out
          </button>
        </div>
      </aside>
    </>
  )
}
