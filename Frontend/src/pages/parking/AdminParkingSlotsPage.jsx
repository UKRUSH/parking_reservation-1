import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { parkingSlotApi } from '../../api/parkingSlotApi'
import NotificationBell from '../../components/common/NotificationBell'
import './AdminParkingSlotsPage.css'

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
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>

      {/* ── Topbar ── */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '0.875rem 1.75rem', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button onClick={() => navigate('/admin/dashboard')}
            style={{ fontSize: '0.8125rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer' }}>
            ← Dashboard
          </button>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Zone Management</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NotificationBell />
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{user?.name}</span>
          <button onClick={logout} style={{ fontSize: '0.8125rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
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
    </div>
  )
}
