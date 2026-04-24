import { useEffect, useState, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { parkingSlotApi } from '../../api/parkingSlotApi'
import NotificationBell from '../../components/common/NotificationBell'
import '../student/StudentDashboardPage.css'
import '../admin/AdminDashboardPage.css'
import './AdminParkingSlotsPage.css'

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

/* ── Admin Sidebar ───────────────────────────────────────────────────────── */
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

/* ── Constants ──────────────────────────────────────────────────────────────── */
const TYPE_LABEL  = { CAR: 'Car', MOTORCYCLE: 'Motorcycle', SUV: 'SUV' }
const TYPE_PREFIX = { CAR: 'C', MOTORCYCLE: 'M', SUV: 'S' }
const TYPES       = ['CAR', 'MOTORCYCLE', 'SUV']

const EMPTY_ZONE_FORM = { zone: '', type: 'CAR', slotPrefix: '', count: 24 }
const EMPTY_SLOT_FORM = { slotNumber: '', zone: '', type: 'CAR' }

/* ── Helpers ────────────────────────────────────────────────────────────────── */
function typeBadgeClass(type) {
  return `aps-badge ${
    type === 'CAR' ? 'aps-badge--car' :
    type === 'MOTORCYCLE' ? 'aps-badge--motorcycle' : 'aps-badge--suv'
  }`
}
function statusBadgeClass(status) {
  return `aps-badge ${
    status === 'AVAILABLE' ? 'aps-badge--available' :
    status === 'OCCUPIED'  ? 'aps-badge--occupied'  : 'aps-badge--maintenance'
  }`
}

/* ══════════════════════════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════════════════════════ */
export default function AdminParkingSlotsPage() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [slots,   setSlots]   = useState([])
  const [loading, setLoading] = useState(true)

  /* modal: 'addZone' | 'viewSlots' | 'editSlot' | null */
  const [modal,      setModal]      = useState(null)
  const [activeZone, setActiveZone] = useState(null)   // { zone, type } for viewSlots
  const [editTarget, setEditTarget] = useState(null)   // slot object for editSlot

  const [zoneForm,   setZoneForm]   = useState(EMPTY_ZONE_FORM)
  const [slotForm,   setSlotForm]   = useState(EMPTY_SLOT_FORM)
  const [saving,     setSaving]     = useState(false)
  const [formError,  setFormError]  = useState('')

  /* type filter for zone list */
  const [typeFilter, setTypeFilter] = useState('ALL')

  /* ── fetch all slots once ── */
  const fetchSlots = () => {
    setLoading(true)
    parkingSlotApi.getSlots()
      .then(res => setSlots(res.data.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchSlots() }, [])

  /* ── derive zones from slots ── */
  const allZones = useMemo(() => {
    const map = {}
    slots.forEach(s => {
      const key = `${s.zone}__${s.type}`
      if (!map[key]) map[key] = { zone: s.zone, type: s.type, slots: [] }
      map[key].slots.push(s)
    })
    return Object.values(map).sort((a, b) =>
      a.type.localeCompare(b.type) || a.zone.localeCompare(b.zone)
    )
  }, [slots])

  const displayedZones = useMemo(() =>
    typeFilter === 'ALL' ? allZones : allZones.filter(z => z.type === typeFilter),
  [allZones, typeFilter])

  /* ── zone stats ── */
  const stats = useMemo(() => ({
    totalZones: allZones.length,
    totalSlots: slots.length,
    available:  slots.filter(s => s.status === 'AVAILABLE').length,
    occupied:   slots.filter(s => s.status === 'OCCUPIED').length,
  }), [allZones, slots])

  /* ── slots for active zone (viewSlots modal) ── */
  const zoneSlots = useMemo(() => {
    if (!activeZone) return []
    return slots.filter(s => s.zone === activeZone.zone && s.type === activeZone.type)
  }, [slots, activeZone])

  /* ── open modals ── */
  const openAddZone = () => {
    setZoneForm(EMPTY_ZONE_FORM); setFormError(''); setModal('addZone')
  }
  const openViewSlots = (zone, type) => {
    setActiveZone({ zone, type }); setModal('viewSlots')
  }
  const openEditSlot = (slot) => {
    setEditTarget(slot)
    setSlotForm({ slotNumber: slot.slotNumber, zone: slot.zone, type: slot.type })
    setFormError('')
    setModal('editSlot')
  }
  const closeModal = () => { setModal(null); setFormError('') }

  /* ── auto-fill slot prefix when zone/type changes ── */
  const handleZoneFormChange = (key, val) => {
    setZoneForm(prev => {
      const next = { ...prev, [key]: val }
      if (key === 'zone' || key === 'type') {
        const z = key === 'zone' ? val : prev.zone
        const t = key === 'type' ? val : prev.type
        next.slotPrefix = (TYPE_PREFIX[t] ?? '') + z.toUpperCase()
      }
      return next
    })
  }

  /* ── ADD ZONE ── */
  const handleAddZone = async () => {
    if (!zoneForm.zone.trim() || !zoneForm.type || !zoneForm.slotPrefix.trim()) {
      setFormError('All fields are required.'); return
    }
    setSaving(true); setFormError('')
    try {
      await parkingSlotApi.createZone({
        zone:       zoneForm.zone.trim().toUpperCase(),
        type:       zoneForm.type,
        slotPrefix: zoneForm.slotPrefix.trim().toUpperCase(),
        count:      Number(zoneForm.count),
      })
      closeModal(); fetchSlots()
    } catch (e) {
      setFormError(e.response?.data?.message || 'Failed to create zone.')
    } finally { setSaving(false) }
  }

  /* ── DELETE ZONE ── */
  const handleDeleteZone = async (zone, type) => {
    if (!window.confirm(`Delete all slots in Zone ${zone} (${TYPE_LABEL[type]})?\nThis will also remove all bookings for these slots.`)) return
    try {
      await parkingSlotApi.deleteZone(zone, type)
      setSlots(prev => prev.filter(s => !(s.zone === zone && s.type === type)))
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed.')
    }
  }

  /* ── EDIT SLOT ── */
  const handleEditSlot = async () => {
    if (!slotForm.slotNumber.trim() || !slotForm.zone.trim()) {
      setFormError('All fields are required.'); return
    }
    setSaving(true); setFormError('')
    try {
      const res = await parkingSlotApi.update(editTarget.id, slotForm)
      const updated = res.data.data
      setSlots(prev => prev.map(s => s.id === editTarget.id ? { ...s, ...updated } : s))
      closeModal()
    } catch (e) {
      setFormError(e.response?.data?.message || 'Update failed.')
    } finally { setSaving(false) }
  }

  /* ── DELETE SLOT ── */
  const handleDeleteSlot = async (id, slotNumber) => {
    if (!window.confirm(`Delete slot ${slotNumber}?`)) return
    try {
      await parkingSlotApi.delete(id)
      setSlots(prev => prev.filter(s => s.id !== id))
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed.')
    }
  }

  /* ── STATUS CHANGE ── */
  const handleStatusChange = async (id, status) => {
    try {
      const res = await parkingSlotApi.updateStatus(id, status)
      const updated = res.data.data
      setSlots(prev => prev.map(s => s.id === id ? { ...s, status: updated.status } : s))
    } catch (e) {
      alert(e.response?.data?.message || 'Status update failed.')
    }
  }

  /* ═════════════════════════════════════════════ RENDER ═══════════════════ */
  return (
    <div className="sd-shell ad-admin">
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} user={user} logout={logout} />

      <div className="sd-main">

      {/* ── Topbar ── */}
      <header className="sd-topbar">
        <button className="sd-menu-btn" onClick={() => setSidebarOpen(true)}>
          <Icon.Menu />
        </button>
        <div className="sd-topbar-title">Slot Management</div>
        <div className="sd-topbar-right">
          <NotificationBell />
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="aps-hero">
        <div className="aps-hero-text">
          <div className="aps-hero-eyebrow">Admin · Parking Management</div>
          <h1 className="aps-hero-title">Zone Management</h1>
          <p className="aps-hero-sub">Add, delete, and manage parking zones across all campus areas</p>
          <div className="aps-hero-actions">
            <button className="aps-hero-btn-add" onClick={openAddZone}>+ Add Zone</button>
          </div>
        </div>
        <div className="aps-hero-visual">
          <svg className="aps-hero-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor"
            strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="4" width="56" height="56" rx="10" />
            <path d="M22 44V20h14a10 10 0 010 20H22" />
          </svg>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="aps-stats-row">
        {[
          { label: 'Total Zones',  val: stats.totalZones, accent: '#6366f1', bg: '#ede9fe' },
          { label: 'Total Slots',  val: stats.totalSlots, accent: '#3b82f6', bg: '#dbeafe' },
          { label: 'Available',    val: stats.available,  accent: '#10b981', bg: '#d1fae5' },
          { label: 'Occupied',     val: stats.occupied,   accent: '#f59e0b', bg: '#fef3c7' },
        ].map(({ label, val, accent, bg }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: '14px', border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)', padding: '1rem 1.125rem',
            display: 'flex', alignItems: 'center', gap: '0.875rem',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="18" height="18" fill="none" stroke={accent} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v-4m0 0V6h5a3 3 0 010 6H8z" />
                <rect x="3" y="3" width="18" height="18" rx="3" strokeWidth={2} />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e293b', lineHeight: 1.2 }}>{loading ? '…' : val}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="aps-filters">
        <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Vehicle Type</span>
        <div className="aps-filter-tabs">
          {['ALL', ...TYPES].map(t => (
            <button key={t}
              className={`aps-filter-tab ${typeFilter === t ? 'active' : ''}`}
              onClick={() => setTypeFilter(t)}>
              {t === 'ALL' ? 'All Types' : TYPE_LABEL[t]}
            </button>
          ))}
        </div>
        <button className="aps-add-btn" style={{ marginLeft: 'auto' }} onClick={openAddZone}>
          + Add Zone
        </button>
      </div>

      {/* ── Zone Table ── */}
      <div className="aps-content">
        <div className="aps-toolbar">
          <span className="aps-section-label">
            {loading ? 'Loading…' : `${displayedZones.length} zone${displayedZones.length !== 1 ? 's' : ''}`}
            {typeFilter !== 'ALL' ? ` · ${TYPE_LABEL[typeFilter]}` : ''}
          </span>
        </div>

        {loading ? (
          <div className="aps-empty"><div className="aps-empty-title">Loading zones…</div></div>
        ) : displayedZones.length === 0 ? (
          <div className="aps-empty">
            <div className="aps-empty-title">No zones found</div>
            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.375rem' }}>
              Click "+ Add Zone" to create the first zone.
            </p>
          </div>
        ) : (
          <div className="aps-zone-grid">
            {displayedZones.map(z => {
              const avail = z.slots.filter(s => s.status === 'AVAILABLE').length
              const occ   = z.slots.filter(s => s.status === 'OCCUPIED').length
              const maint = z.slots.filter(s => s.status === 'MAINTENANCE').length
              return (
                <div key={`${z.zone}__${z.type}`} className="aps-zone-card">
                  {/* Card header */}
                  <div className="aps-zone-card-header">
                    <div className="aps-zone-letter">{z.zone}</div>
                    <div>
                      <div className="aps-zone-card-title">Zone {z.zone}</div>
                      <div className="aps-zone-card-sub">
                        <span className={typeBadgeClass(z.type)} style={{ fontSize: '0.625rem', padding: '0.1rem 0.45rem' }}>
                          {TYPE_LABEL[z.type]}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="aps-zone-card-stats">
                    <div className="aps-zone-stat">
                      <div className="aps-zone-stat-val">{z.slots.length}</div>
                      <div className="aps-zone-stat-label">Total</div>
                    </div>
                    <div className="aps-zone-stat">
                      <div className="aps-zone-stat-val aps-zone-stat-val--green">{avail}</div>
                      <div className="aps-zone-stat-label">Available</div>
                    </div>
                    <div className="aps-zone-stat">
                      <div className="aps-zone-stat-val aps-zone-stat-val--red">{occ}</div>
                      <div className="aps-zone-stat-label">Occupied</div>
                    </div>
                    <div className="aps-zone-stat">
                      <div className="aps-zone-stat-val aps-zone-stat-val--gray">{maint}</div>
                      <div className="aps-zone-stat-label">Maintenance</div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="aps-zone-card-actions">
                    <button className="aps-btn aps-btn--edit"
                      onClick={() => openViewSlots(z.zone, z.type)}>
                      View Slots
                    </button>
                    <button className="aps-btn aps-btn--delete"
                      onClick={() => handleDeleteZone(z.zone, z.type)}>
                      Delete
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ═══════════ MODAL: ADD ZONE ═══════════ */}
      {modal === 'addZone' && (
        <div className="aps-modal-overlay">
          <div className="aps-modal">
            <h2 className="aps-modal-title">Add New Zone</h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="aps-field">
                <label>Zone Letter</label>
                <input className="aps-input"
                  value={zoneForm.zone}
                  onChange={e => handleZoneFormChange('zone', e.target.value.toUpperCase())}
                  placeholder="e.g. K" maxLength={3} />
              </div>
              <div className="aps-field">
                <label>Vehicle Type</label>
                <select className="aps-select"
                  value={zoneForm.type}
                  onChange={e => handleZoneFormChange('type', e.target.value)}>
                  {TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="aps-field">
                <label>Slot Prefix</label>
                <input className="aps-input"
                  value={zoneForm.slotPrefix}
                  onChange={e => setZoneForm(p => ({ ...p, slotPrefix: e.target.value.toUpperCase() }))}
                  placeholder="e.g. CK" maxLength={4} />
                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  Slots will be named: {zoneForm.slotPrefix || '??'}01 … {zoneForm.slotPrefix || '??'}{String(zoneForm.count).padStart(2,'0')}
                </div>
              </div>
              <div className="aps-field">
                <label>Number of Slots</label>
                <input className="aps-input" type="number" min={1} max={100}
                  value={zoneForm.count}
                  onChange={e => setZoneForm(p => ({ ...p, count: e.target.value }))} />
              </div>
            </div>

            {formError && <p className="aps-error">{formError}</p>}
            <div className="aps-modal-actions">
              <button className="aps-modal-cancel" onClick={closeModal}>Cancel</button>
              <button className="aps-modal-save" onClick={handleAddZone} disabled={saving}>
                {saving ? 'Creating…' : 'Create Zone'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: VIEW SLOTS ═══════════ */}
      {modal === 'viewSlots' && activeZone && (
        <div className="aps-modal-overlay" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="aps-modal" style={{ maxWidth: 700 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 className="aps-modal-title" style={{ marginBottom: 0 }}>
                  Zone {activeZone.zone} — {TYPE_LABEL[activeZone.type]}
                </h2>
                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.25rem' }}>
                  {zoneSlots.length} slots · {zoneSlots.filter(s => s.status === 'AVAILABLE').length} available
                </p>
              </div>
              <button onClick={closeModal} style={{
                width: 30, height: 30, borderRadius: '50%', background: '#f1f5f9',
                border: 'none', cursor: 'pointer', fontSize: '1rem', color: '#64748b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>✕</button>
            </div>

            <div style={{ maxHeight: '60vh', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: 12 }}>
              <table className="aps-table" style={{ marginBottom: 0 }}>
                <thead>
                  <tr>
                    <th>Slot #</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zoneSlots.map(slot => (
                    <tr key={slot.id}>
                      <td><span className="aps-td-slot">{slot.slotNumber}</span></td>
                      <td>
                        <select className="aps-status-select"
                          value={slot.status}
                          onChange={e => handleStatusChange(slot.id, e.target.value)}>
                          <option value="AVAILABLE">Available</option>
                          <option value="OCCUPIED">Occupied</option>
                          <option value="MAINTENANCE">Maintenance</option>
                        </select>
                      </td>
                      <td>
                        <div className="aps-action-row">
                          <button className="aps-btn aps-btn--edit" onClick={() => openEditSlot(slot)}>Edit</button>
                          <button className="aps-btn aps-btn--delete"
                            onClick={() => handleDeleteSlot(slot.id, slot.slotNumber)}>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="aps-modal-actions" style={{ marginTop: '1.25rem' }}>
              <button className="aps-modal-cancel" style={{ flex: 'none', padding: '0.5rem 1.5rem' }} onClick={closeModal}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════ MODAL: EDIT SLOT ═══════════ */}
      {modal === 'editSlot' && editTarget && (
        <div className="aps-modal-overlay">
          <div className="aps-modal">
            <h2 className="aps-modal-title">Edit Slot — {editTarget.slotNumber}</h2>

            <div className="aps-field">
              <label>Slot Number</label>
              <input className="aps-input"
                value={slotForm.slotNumber}
                onChange={e => setSlotForm(p => ({ ...p, slotNumber: e.target.value.toUpperCase() }))}
                placeholder="e.g. CA01" />
            </div>
            <div className="aps-field">
              <label>Zone</label>
              <input className="aps-input"
                value={slotForm.zone}
                onChange={e => setSlotForm(p => ({ ...p, zone: e.target.value.toUpperCase() }))}
                placeholder="e.g. A" />
            </div>
            <div className="aps-field">
              <label>Vehicle Type</label>
              <select className="aps-select"
                value={slotForm.type}
                onChange={e => setSlotForm(p => ({ ...p, type: e.target.value }))}>
                {TYPES.map(t => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
              </select>
            </div>

            {formError && <p className="aps-error">{formError}</p>}
            <div className="aps-modal-actions">
              <button className="aps-modal-cancel" onClick={() => setModal('viewSlots')}>← Back</button>
              <button className="aps-modal-save" onClick={handleEditSlot} disabled={saving}>
                {saving ? 'Saving…' : 'Update Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
      </div>{/* sd-main */}
    </div>
  )
}
