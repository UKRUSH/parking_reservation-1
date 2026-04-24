import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import { userApi } from '../../api/userApi'
import '../student/StudentDashboardPage.css'
import './AdminDashboardPage.css'
import './UserManagementPage.css'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const Icon = {
  Menu: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="22" height="22">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Dashboard: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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
  Users: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  Helmet: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
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
  Info: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Logout: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
}

/* ── Sidebar ──────────────────────────────────────────────────────────────── */
function AdminSidebar({ open, onClose, user, logout }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    { path: '/admin/dashboard',          label: 'Dashboard',         Ico: Icon.Dashboard },
    { path: '/admin/bookings',           label: 'Parking Requests',  Ico: Icon.Bookings  },
    { path: '/admin/parking-management', label: 'Slot Management',   Ico: Icon.Parking   },
    { path: '/parking',                  label: 'Parking Map',       Ico: Icon.Map       },
    { path: '/admin/helmet-borrowings',  label: 'Helmet Borrowings', Ico: Icon.Helmet    },
    { path: '/admin/users',              label: 'User Management',   Ico: Icon.Users     },
    { path: '/tickets',                  label: 'Incident Tickets',  Ico: Icon.Shield    },
    { path: '/notifications',            label: 'Notifications',     Ico: Icon.Bell      },
  ]

  const go = (path) => { navigate(path); onClose() }

  return (
    <>
      <div className={`sd-overlay ${open ? '' : 'hidden'}`} onClick={onClose} />
      <aside className={`sd-sidebar ${open ? 'open' : ''}`}>
        <div className="sd-sidebar-header">
          <div className="sd-sidebar-logo">SC</div>
          <div>
            <div className="sd-sidebar-brand">Smart Campus</div>
            <div className="sd-sidebar-brand-sub">Admin Portal</div>
          </div>
        </div>
        <div className="sd-sidebar-user">
          <div className="sd-sidebar-avatar">{user?.name?.[0]?.toUpperCase() ?? 'A'}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sd-sidebar-user-name">{user?.name ?? 'Admin'}</div>
            <div className="sd-sidebar-user-role">Administrator</div>
          </div>
        </div>
        <div className="sd-nav-label">Management</div>
        <ul className="sd-nav">
          {navItems.map(({ path, label, Ico }) => (
            <li key={path}>
              <button
                className={`sd-nav-item ${location.pathname === path ? 'active' : ''}`}
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
          <p>You have <strong>admin</strong> access to all campus systems.</p>
        </div>
        <div className="sd-sidebar-footer">
          <button className="sd-sidebar-logout" onClick={logout}>
            <Icon.Logout /> Sign out
          </button>
        </div>
      </aside>
    </>
  )
}

/* ── Skeleton rows ────────────────────────────────────────────────────────── */
function SkeletonRows() {
  return Array.from({ length: 5 }).map((_, i) => (
    <tr key={i}>
      <td style={{ padding: '0.875rem 1.125rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="um-skel um-skel-avatar" />
          <div style={{ flex: 1 }}>
            <div className="um-skel" style={{ width: '60%', marginBottom: '0.35rem' }} />
            <div className="um-skel" style={{ width: '35%', height: '10px' }} />
          </div>
        </div>
      </td>
      <td style={{ padding: '0.875rem 1.125rem' }}>
        <div className="um-skel" style={{ width: '75%' }} />
      </td>
      <td style={{ padding: '0.875rem 1.125rem' }}>
        <div className="um-skel" style={{ width: '80px' }} />
      </td>
      <td style={{ padding: '0.875rem 1.125rem' }}>
        <div className="um-skel" style={{ width: '60px', borderRadius: '9999px' }} />
      </td>
      <td style={{ padding: '0.875rem 1.125rem' }}>
        <div className="um-skel" style={{ width: '70px' }} />
      </td>
    </tr>
  ))
}

/* ── Constants ────────────────────────────────────────────────────────────── */
const ROLES = [
  { value: 'USER',       label: 'Student'    },
  { value: 'TECHNICIAN', label: 'Technician' },
  { value: 'ADMIN',      label: 'Admin'      },
]

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function UserManagementPage() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [users,       setUsers]       = useState([])
  const [loading,     setLoading]     = useState(true)
  const [error,       setError]       = useState('')
  const [updating,    setUpdating]    = useState(null)
  const [search,      setSearch]      = useState('')
  const [roleFilter,  setRoleFilter]  = useState('ALL')

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      setError('No session token — please log in to view users.')
      setLoading(false)
      return
    }
    userApi.getAll()
      .then((res) => setUsers(res.data.data || []))
      .catch(() => setError('Failed to load users. Make sure the backend is running and your account has ADMIN access.'))
      .finally(() => setLoading(false))
  }, [])

  const changeRole = async (userId, role) => {
    setUpdating(userId)
    try {
      const res = await userApi.updateRole(userId, role)
      setUsers((prev) => prev.map((u) => u.id === userId ? res.data.data : u))
    } finally {
      setUpdating(null)
    }
  }

  const deactivate = async (userId) => {
    if (!window.confirm('Deactivate this user?')) return
    await userApi.deactivate(userId)
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, active: false } : u))
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return users.filter((u) => {
      const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
      const role = [...(u.roles ?? [])][0] ?? 'USER'
      const matchRole = roleFilter === 'ALL' || role === roleFilter
      return matchSearch && matchRole
    })
  }, [users, search, roleFilter])

  const totalUsers    = users.length
  const activeUsers   = users.filter((u) => u.active).length
  const adminCount    = users.filter((u) => [...(u.roles ?? [])].includes('ADMIN')).length
  const inactiveCount = users.filter((u) => !u.active).length

  return (
    <div className="sd-shell ad-admin">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        user={user}
        logout={logout}
      />

      <div className="sd-main">
        {/* Topbar */}
        <header className="sd-topbar">
          <button className="sd-menu-btn" onClick={() => setSidebarOpen(true)}>
            <Icon.Menu />
          </button>
          <div className="sd-topbar-title">User Management</div>
          <div className="sd-topbar-right">
            <NotificationBell />
          </div>
        </header>

        {/* Hero */}
        <div className="um-hero">
          <div className="um-hero-text">
            <div className="um-hero-eyebrow">Admin Portal · User Management</div>
            <h1 className="um-hero-title">Manage Users</h1>
            <p className="um-hero-sub">View accounts, assign roles and manage access across the campus platform.</p>
          </div>
          <div className="um-hero-visual">
            <div className="um-hero-icon">👥</div>
            <span className="um-hero-chip um-hero-chip--tl">🟢 {activeUsers} Active</span>
            <span className="um-hero-chip um-hero-chip--tr">🛡️ {adminCount} Admins</span>
            <span className="um-hero-chip um-hero-chip--br">📋 {totalUsers} Total</span>
          </div>
        </div>

        {/* Stats strip */}
        <div className="um-stats">
          <div className="um-stat-card">
            <div className="um-stat-icon um-stat-icon--purple">👥</div>
            <div>
              <div className="um-stat-val">{loading ? <span className="um-skel" style={{ width: 36, display: 'inline-block' }} /> : totalUsers}</div>
              <div className="um-stat-label">Total Users</div>
            </div>
          </div>
          <div className="um-stat-card">
            <div className="um-stat-icon um-stat-icon--green">✅</div>
            <div>
              <div className="um-stat-val">{loading ? <span className="um-skel" style={{ width: 36, display: 'inline-block' }} /> : activeUsers}</div>
              <div className="um-stat-label">Active</div>
            </div>
          </div>
          <div className="um-stat-card">
            <div className="um-stat-icon um-stat-icon--indigo">🛡️</div>
            <div>
              <div className="um-stat-val">{loading ? <span className="um-skel" style={{ width: 36, display: 'inline-block' }} /> : adminCount}</div>
              <div className="um-stat-label">Admins</div>
            </div>
          </div>
          <div className="um-stat-card">
            <div className="um-stat-icon um-stat-icon--red">⛔</div>
            <div>
              <div className="um-stat-val">{loading ? <span className="um-skel" style={{ width: 36, display: 'inline-block' }} /> : inactiveCount}</div>
              <div className="um-stat-label">Inactive</div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="um-content">

          {error && (
            <div className="um-error">
              <span className="um-error-icon">⚠️</span>
              <div>
                <div className="um-error-title">Could not load users</div>
                <div className="um-error-msg">{error}</div>
              </div>
            </div>
          )}

          {!error && (
            <>
              {/* Toolbar */}
              <div className="um-toolbar">
                <div className="um-search-wrap">
                  <svg className="um-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                  </svg>
                  <input
                    className="um-search"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <select
                  className="um-filter-select"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="USER">Students</option>
                  <option value="ADMIN">Admins</option>
                </select>
                {!loading && (
                  <span className="um-result-count">
                    {filtered.length} {filtered.length === 1 ? 'user' : 'users'}
                  </span>
                )}
              </div>

              {/* Table */}
              <div className="um-panel">
                <table className="um-table">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading && <SkeletonRows />}

                    {!loading && filtered.length === 0 && (
                      <tr>
                        <td colSpan={5}>
                          <div className="um-empty">
                            <div className="um-empty-icon">🔍</div>
                            <div className="um-empty-title">No users found</div>
                            <div className="um-empty-sub">
                              {search || roleFilter !== 'ALL'
                                ? 'Try adjusting your search or filter.'
                                : 'No users have registered yet.'}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}

                    {!loading && filtered.map((u) => {
                      const role = [...(u.roles ?? [])][0] ?? 'USER'
                      return (
                        <tr key={u.id} className={!u.active ? 'um-row--inactive' : ''}>
                          <td>
                            <div className="um-user-cell">
                              <div className="um-avatar">{(u.name ?? '?')[0].toUpperCase()}</div>
                              <div>
                                <div className="um-user-name">{u.name}</div>
                                <div className="um-user-id">ID #{u.id}</div>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="um-email">{u.email}</span>
                          </td>
                          <td>
                            <div className="um-role-wrap">
                              <select
                                className={`um-role-select ${role === 'ADMIN' ? 'um-role--admin' : role === 'TECHNICIAN' ? 'um-role--tech' : ''}`}
                                value={role}
                                disabled={updating === u.id || !u.active}
                                onChange={(e) => changeRole(u.id, e.target.value)}
                              >
                                {ROLES.map((r) => (
                                  <option key={r.value} value={r.value}>{r.label}</option>
                                ))}
                              </select>
                              {updating === u.id && <div className="um-updating" />}
                            </div>
                          </td>
                          <td>
                            <span className={`um-badge ${u.active ? 'um-badge--active' : 'um-badge--inactive'}`}>
                              <span className="um-badge-dot" />
                              {u.active ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            {u.active && (
                              <button
                                className="um-btn-deactivate"
                                onClick={() => deactivate(u.id)}
                              >
                                ⛔ Deactivate
                              </button>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
