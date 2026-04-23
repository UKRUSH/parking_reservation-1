import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { parkingSlotApi } from '../../api/parkingSlotApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import '../student/StudentDashboardPage.css'
import './ParkingSlotsPage.css'

/* ── Icons ───────────────────────────────────────────────────────────────── */
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
  Parking: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v-4m0 0V6h5a3 3 0 010 6H8z" />
      <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={2} />
    </svg>
  ),
  ArrowRight: () => (
    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="16" height="16">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
}

const TYPE_LABEL = { CAR: 'Car', MOTORCYCLE: 'Moto', SUV: 'SUV' }

/* ── Sidebar ─────────────────────────────────────────────────────────────── */
function Sidebar({ open, onClose, user, logout, isAdmin }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = isAdmin
    ? [
        { path: '/dashboard',      label: 'Dashboard',         Ico: Icon.Dashboard },
        { path: '/admin/bookings', label: 'All Bookings',      Ico: Icon.Bookings  },
        { path: '/parking',        label: 'Parking Map',       Ico: Icon.Map       },
        { path: '/notifications',  label: 'Notifications',     Ico: Icon.Bell      },
      ]
    : [
        { path: '/student/dashboard', label: 'Dashboard',         Ico: Icon.Dashboard },
        { path: '/my-bookings',       label: 'My Bookings',       Ico: Icon.Bookings  },
        { path: '/parking',           label: 'Find Parking',      Ico: Icon.Map       },
        { path: '/my-borrowings',     label: 'Helmet Borrowings', Ico: Icon.Helmet    },
        { path: '/tickets',           label: 'Incident Tickets',  Ico: Icon.Shield    },
        { path: '/notifications',     label: 'Notifications',     Ico: Icon.Bell      },
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
            <div className="sd-sidebar-brand-sub">Parking Portal</div>
          </div>
        </div>
        <div className="sd-sidebar-user">
          <div className="sd-sidebar-avatar">{user?.name?.[0]?.toUpperCase() ?? '?'}</div>
          <div style={{ minWidth: 0 }}>
            <div className="sd-sidebar-user-name">{user?.name ?? 'User'}</div>
            <div className="sd-sidebar-user-role">{isAdmin ? 'Admin' : 'Student'}</div>
          </div>
        </div>
        <div className="sd-nav-label">Menu</div>
        <ul className="sd-nav">
          {navItems.map(({ path, label, Ico }) => (
            <li key={path}>
              <button
                className={`sd-nav-item ${location.pathname === path ? 'active' : ''}`}
                onClick={() => go(path)}
              >
                <Ico />{label}
              </button>
            </li>
          ))}
        </ul>
        <div className="sd-sidebar-tip">
          <div className="sd-sidebar-tip-icon"><Icon.Info /></div>
          <p>Click any <strong>green</strong> slot to select it, then tap <em>Book</em>.</p>
        </div>
        <div className="sd-sidebar-footer">
          <button className="sd-sidebar-logout" onClick={logout}><Icon.Logout /> Sign out</button>
        </div>
      </aside>
    </>
  )
}

/* ── Helpers ─────────────────────────────────────────────────────────────── */
function formatDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

function ParkingHeroVisual() {
  return (
    <div className="ps-hero-visual" aria-hidden="true">
      <div className="ps-hero-slots">
        {[
          'free', 'taken', 'free', 'taken',
          'free', 'taken', 'taken', 'free',
          'free', 'taken', 'free', 'taken',
        ].map((state, index) => (
          <div key={index} className={`ps-hero-slot ps-hero-slot--${state}`}>
            {state === 'free' ? 'P' : <span className="ps-hero-slot-car">🚗</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

const VEHICLE_FILTERS = [
  { key: 'ALL', label: 'All' },
  { key: 'CAR', label: 'Car' },
  { key: 'MOTORCYCLE', label: 'Motorbike' },
  { key: 'SUV', label: 'SUV' },
]

/* ══════════════════════════════════════════════════════════════════════════
   Main page
   ══════════════════════════════════════════════════════════════════════════ */
export default function ParkingSlotsPage() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const isAdmin          = user?.roles?.includes('ADMIN')

  const [sidebarOpen, setSidebarOpen]   = useState(false)
  const [slots, setSlots]               = useState([])
  const [loading, setLoading]           = useState(true)
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [searchQuery, setSearchQuery]   = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [typeFilter, setTypeFilter]     = useState('ALL')

  const fetchSlots = () => {
    setLoading(true)
    parkingSlotApi.getSlots(typeFilter === 'ALL' ? undefined : typeFilter)
      .then(res => setSlots(res.data.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSlots(); setSelectedSlot(null) }, [typeFilter])

  /* ── slot status helper ── */
  const slotClass = (slot) => {
    if (selectedSlot?.id === slot.id) return 'ps-slot--selected'
    if (slot.status === 'MAINTENANCE') return 'ps-slot--maintenance'
    if (slot.status !== 'AVAILABLE')   return 'ps-slot--occupied'
    if (!slot.available)               return 'ps-slot--partial'
    return 'ps-slot--available'
  }

  const filteredSlots = slots.filter((slot) => {
    const q = searchQuery.trim().toLowerCase()
    const matchesSearch = !q || [slot.slotNumber, slot.zone, slot.type]
      .filter(Boolean)
      .some(value => String(value).toLowerCase().includes(q))

    const slotStatus = slot.status === 'MAINTENANCE'
      ? 'MAINTENANCE'
      : slot.status !== 'AVAILABLE'
        ? 'OCCUPIED'
        : slot.available
          ? 'AVAILABLE'
          : 'PARTIAL'

    const matchesStatus = statusFilter === 'ALL' || slotStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const visibleByZone = filteredSlots.reduce((acc, slot) => {
    const zone = slot.zone || 'Other'
    if (!acc[zone]) acc[zone] = []
    acc[zone].push(slot)
    return acc
  }, {})

  const stats = {
    total: slots.length,
    available: slots.filter(slot => slot.status === 'AVAILABLE' && slot.available).length,
    occupied: slots.filter(slot => slot.status !== 'AVAILABLE').length,
    maintenance: slots.filter(slot => slot.status === 'MAINTENANCE').length,
  }

  return (
    <div className="sd-shell">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}
        user={user} logout={logout} isAdmin={isAdmin} />

      <div className="sd-main">
        {/* ── Topbar ── */}
        <header className="sd-topbar">
          <div className="sd-topbar-left">
            <button className="sd-hamburger" onClick={() => setSidebarOpen(v => !v)} aria-label="menu">
              <Icon.Menu />
            </button>
            <span className="sd-topbar-title">Find Parking</span>
          </div>
          <div className="sd-topbar-right">
            <span className="sd-topbar-date">{formatDate()}</span>
            <NotificationBell />
            {!isAdmin && (
              <button
                onClick={() => navigate('/my-bookings')}
                style={{ display:'flex', alignItems:'center', gap:'0.4rem', background:'#059669', color:'#fff', border:'none', borderRadius:'9999px', padding:'0.4rem 1.125rem', fontSize:'0.8125rem', fontWeight:700, cursor:'pointer' }}
              >
                My Bookings
              </button>
            )}
            <div className="sd-topbar-avatar" title={user?.name} onClick={() => setSidebarOpen(v => !v)}>
              {user?.name?.[0]?.toUpperCase() ?? '?'}
            </div>
          </div>
        </header>

        <div className="sd-body">

          <div className="ps-hero">
            <div className="ps-hero-text">
              <div className="ps-hero-eyebrow">Campus Parking System</div>
              <h1 className="ps-hero-title">Parking Spaces</h1>
              <p className="ps-hero-sub">Browse live slot availability across the campus zones</p>
              {!isAdmin && (
                <div className="ps-hero-actions">
                  <button className="ps-hero-btn" onClick={() => navigate('/my-bookings')}>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" width="15" height="15">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Reserve a Space
                  </button>
                </div>
              )}
            </div>
            <ParkingHeroVisual />
          </div>

          <div className="ps-stats-row">
            {[
              { label: 'Total', value: stats.total, color: 'ps-stat-icon--blue' },
              { label: 'Available', value: stats.available, color: 'ps-stat-icon--green' },
              { label: 'Occupied', value: stats.occupied, color: 'ps-stat-icon--amber' },
              { label: 'Maintenance', value: stats.maintenance, color: 'ps-stat-icon--slate' },
            ].map(({ label, value, color }) => (
              <div key={label} className="ps-stat-card">
                <div className={`ps-stat-icon ${color}`}><Icon.Parking /></div>
                <div>
                  <div className="ps-stat-label">{label}</div>
                  <div className="ps-stat-value">{loading ? '…' : value}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="ps-toolbar">
            <div className="ps-vehicle-filter">
              <span className="ps-vehicle-filter-label">Vehicle Type</span>
              <div className="ps-filter-tabs">
                {VEHICLE_FILTERS.map((item) => (
                  <button
                    key={item.key}
                    className={`ps-filter-tab ${typeFilter === item.key ? 'active' : ''}`}
                    onClick={() => setTypeFilter(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ps-search-wrap">
              <svg className="ps-search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                className="ps-search"
                type="text"
                placeholder="Search by slot, zone, or vehicle type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="ps-filter-tabs">
              {[
                { key: 'ALL', label: `All (${slots.length})` },
                { key: 'AVAILABLE', label: 'Available' },
                { key: 'PARTIAL', label: 'Partially booked' },
                { key: 'OCCUPIED', label: 'Occupied' },
                { key: 'MAINTENANCE', label: 'Maintenance' },
              ].map((item) => (
                <button
                  key={item.key}
                  className={`ps-filter-tab ${statusFilter === item.key ? 'active' : ''}`}
                  onClick={() => setStatusFilter(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="ps-list-count">
            {filteredSlots.length} parking slots
          </div>

          {/* ── Main content ── */}
          <div className="ps-content">

            {/* ── Slots panel ── */}
            <div className="ps-slots-panel">
              {loading ? (
                <div className="ps-empty"><div className="ps-empty-title">Loading parking spaces…</div></div>
              ) : filteredSlots.length === 0 ? (
                <div className="ps-empty"><div className="ps-empty-title">No parking spaces found.</div></div>
              ) : (
                <>
                  <div className="ps-entrance">
                    <span className="ps-entrance-label">Entrance / Exit</span>
                  </div>
                  {Object.entries(visibleByZone).sort(([a], [b]) => a.localeCompare(b)).map(([zoneName, zoneSlots]) => {
                    const freeCount = zoneSlots.filter(s => s.available).length
                    return (
                      <div key={zoneName} className="ps-zone-section">
                        <div className="ps-zone-title">
                          Zone {zoneName}
                          <span className={`ps-zone-badge ${freeCount > 0 ? 'ps-zone-badge--ok' : 'ps-zone-badge--full'}`}>
                            {freeCount}/{zoneSlots.length} free
                          </span>
                        </div>
                        <div className="ps-slots-grid">
                          {zoneSlots.map(slot => {
                            const bookable = slot.status === 'AVAILABLE'
                            const isSelected = selectedSlot?.id === slot.id
                            return (
                              <button
                                key={slot.id}
                                className={`ps-slot ${slotClass(slot)}`}
                                onClick={() => {
                                  if (!bookable) return
                                  setSelectedSlot(isSelected ? null : slot)
                                }}
                                disabled={!bookable}
                                title={bookable ? `${slot.slotNumber} – Click to select` : `${slot.slotNumber} – Unavailable`}
                              >
                                <span className="ps-slot-num">{slot.slotNumber}</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </>
              )}
            </div>

            {/* ── Info / booking CTA panel ── */}
            {selectedSlot ? (
              <div className="ps-booking-panel">
                <div className="ps-booking-card">
                  <div className="ps-booking-header">
                    <span className="ps-booking-header-title">Slot Selected</span>
                    <button className="ps-booking-close" onClick={() => setSelectedSlot(null)}>✕</button>
                  </div>

                  <div className="ps-booking-slot-info">
                    <div className="ps-booking-slot-badge">{selectedSlot.slotNumber}</div>
                    <div>
                      <div className="ps-booking-slot-meta-zone">Zone {selectedSlot.zone}</div>
                      <div className="ps-booking-slot-meta-type">{selectedSlot.type} parking space</div>
                    </div>
                  </div>

                  <div style={{ padding: '1.125rem 1.25rem 1.375rem' }}>
                    <p style={{ fontSize:'0.8125rem', color:'#64748b', lineHeight:1.5, marginBottom:'1.125rem' }}>
                      You selected <strong style={{ color:'#1e293b' }}>Slot {selectedSlot.slotNumber}</strong> in Zone {selectedSlot.zone}.
                      Head to the bookings page to complete your reservation.
                    </p>

                    {!isAdmin && (
                      <button
                        className="ps-btn-submit"
                        style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem' }}
                        onClick={() => navigate('/my-bookings')}
                      >
                        Book a Parking Space <Icon.ArrowRight />
                      </button>
                    )}

                    <button
                      style={{ width:'100%', marginTop:'0.625rem', background:'none', border:'1.5px solid #e2e8f0', color:'#64748b', borderRadius:'10px', padding:'0.5rem', fontSize:'0.875rem', fontWeight:600, cursor:'pointer' }}
                      onClick={() => setSelectedSlot(null)}
                    >
                      Deselect
                    </button>
                  </div>
                </div>

                {/* Quick tip */}
                <div className="ps-tip-box">
                  <div className="ps-tip-icon">💡</div>
                  <p className="ps-tip-text">
                    On the bookings page, choose your vehicle type, pick this or any other slot, and set your time.
                  </p>
                </div>
              </div>
            ) : !isAdmin ? (
              /* Default CTA when nothing selected */
              <div className="ps-booking-panel">
                <div className="ps-cta-card">
                  <div className="ps-cta-icon">🅿️</div>
                  <div className="ps-cta-title">Ready to book?</div>
                  <div className="ps-cta-desc">
                    Select a green slot on the map, or go straight to the booking page to choose your vehicle type and preferred time.
                  </div>
                  <button
                    className="ps-btn-submit"
                    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:'0.5rem', marginTop:'1rem' }}
                    onClick={() => navigate('/my-bookings')}
                  >
                    Go to Booking Page <Icon.ArrowRight />
                  </button>
                </div>
              </div>
            ) : null}

          </div>
        </div>
      </div>
    </div>
  )
}
