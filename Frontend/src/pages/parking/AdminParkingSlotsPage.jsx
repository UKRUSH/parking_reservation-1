import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { parkingSlotApi } from '../../api/parkingSlotApi'
import NotificationBell from '../../components/common/NotificationBell'
import './AdminParkingSlotsPage.css'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const SearchIcon = () => (
  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="aps-search-icon">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" />
  </svg>
)

const PIcon = () => (
  <svg className="aps-hero-icon" viewBox="0 0 64 64" fill="none" stroke="currentColor"
    strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="4" width="56" height="56" rx="10" />
    <path d="M22 44V20h14a10 10 0 010 20H22" />
  </svg>
)

/* ── Helpers ────────────────────────────────────────────────────────────────── */
const TYPES    = ['ALL', 'CAR', 'MOTORCYCLE', 'SUV']
const STATUSES = ['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE']
const TYPE_LABEL   = { CAR: 'Car', MOTORCYCLE: 'Motorcycle', SUV: 'SUV' }

const typeBadge = (type) => {
  const map = { CAR: 'aps-badge--car', MOTORCYCLE: 'aps-badge--motorcycle', SUV: 'aps-badge--suv' }
  return `aps-badge ${map[type] ?? ''}`
}
const statusBadge = (status) => {
  const map = { AVAILABLE: 'aps-badge--available', OCCUPIED: 'aps-badge--occupied', MAINTENANCE: 'aps-badge--maintenance' }
  return `aps-badge ${map[status] ?? ''}`
}

const EMPTY_FORM = { slotNumber: '', zone: '', type: 'CAR' }

/* ══════════════════════════════════════════════════════════════════════════════
   Page
   ══════════════════════════════════════════════════════════════════════════════ */
export default function AdminParkingSlotsPage() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()

  const [slots,   setSlots]   = useState([])
  const [loading, setLoading] = useState(true)

  const [typeFilter,   setTypeFilter]   = useState('ALL')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [search,       setSearch]       = useState('')

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)
  const [formError,  setFormError]  = useState('')

  /* ── fetch ── */
  const fetchSlots = () => {
    setLoading(true)
    parkingSlotApi.getSlots()
      .then(res => setSlots(res.data.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchSlots() }, [])

  /* ── filter ── */
  const displayed = useMemo(() => {
    const q = search.trim().toLowerCase()
    return slots.filter(s => {
      if (typeFilter   !== 'ALL' && s.type   !== typeFilter)   return false
      if (statusFilter !== 'ALL' && s.status !== statusFilter) return false
      if (q && !s.slotNumber.toLowerCase().includes(q)
            && !(s.zone ?? '').toLowerCase().includes(q))      return false
      return true
    })
  }, [slots, typeFilter, statusFilter, search])

  /* ── stats ── */
  const stats = useMemo(() => ({
    total:       slots.length,
    available:   slots.filter(s => s.status === 'AVAILABLE').length,
    occupied:    slots.filter(s => s.status === 'OCCUPIED').length,
    maintenance: slots.filter(s => s.status === 'MAINTENANCE').length,
  }), [slots])

  /* ── modal helpers ── */
  const openAdd = () => {
    setEditTarget(null); setForm(EMPTY_FORM); setFormError(''); setModalOpen(true)
  }
  const openEdit = (slot) => {
    setEditTarget(slot)
    setForm({ slotNumber: slot.slotNumber, zone: slot.zone, type: slot.type })
    setFormError('')
    setModalOpen(true)
  }

  /* ── CRUD ── */
  const handleSave = async () => {
    if (!form.slotNumber.trim() || !form.zone.trim() || !form.type) {
      setFormError('All fields are required.')
      return
    }
    setSaving(true); setFormError('')
    try {
      if (editTarget) {
        await parkingSlotApi.update(editTarget.id, form)
      } else {
        await parkingSlotApi.create(form)
      }
      setModalOpen(false)
      fetchSlots()
    } catch (e) {
      setFormError(e.response?.data?.message || 'An error occurred.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, slotNumber) => {
    if (!window.confirm(`Delete slot ${slotNumber}? This cannot be undone.`)) return
    try {
      await parkingSlotApi.delete(id)
      setSlots(prev => prev.filter(s => s.id !== id))
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed.')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const res = await parkingSlotApi.updateStatus(id, status)
      const updated = res.data.data
      setSlots(prev => prev.map(s => s.id === id ? { ...s, status: updated.status } : s))
    } catch (e) {
      alert(e.response?.data?.message || 'Status update failed.')
    }
  }

  return (
    <div style={{ background: '#f1f5f9', minHeight: '100vh' }}>

      {/* ── Topbar ── */}
      <header style={{
        background: '#fff', borderBottom: '1px solid #e2e8f0',
        padding: '0.875rem 1.75rem', display: 'flex',
        alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => navigate('/admin/dashboard')}
            style={{ fontSize: '0.8125rem', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
          >
            ← Dashboard
          </button>
          <span style={{ color: '#cbd5e1' }}>|</span>
          <span style={{ fontSize: '1rem', fontWeight: 800, color: '#1e293b' }}>Parking Slot Management</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <NotificationBell />
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>{user?.name}</span>
          <button onClick={logout} style={{ fontSize: '0.8125rem', color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
            Logout
          </button>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="aps-hero">
        <div className="aps-hero-text">
          <div className="aps-hero-eyebrow">Admin · Facilities Catalogue</div>
          <h1 className="aps-hero-title">Parking Slot Management</h1>
          <p className="aps-hero-sub">Add, edit, update status, and remove parking slots across all campus zones</p>
          <div className="aps-hero-actions">
            <button className="aps-hero-btn-add" onClick={openAdd}>
              + Add New Slot
            </button>
          </div>
        </div>
        <div className="aps-hero-visual"><PIcon /></div>
      </div>

      {/* ── Stats ── */}
      <div className="aps-stats-row">
        {[
          { label: 'Total Slots',  val: stats.total,       accent: '#3b82f6', bg: '#dbeafe' },
          { label: 'Available',    val: stats.available,   accent: '#10b981', bg: '#d1fae5' },
          { label: 'Occupied',     val: stats.occupied,    accent: '#f59e0b', bg: '#fef3c7' },
          { label: 'Maintenance',  val: stats.maintenance, accent: '#64748b', bg: '#f1f5f9' },
        ].map(({ label, val, accent, bg }) => (
          <div key={label} style={{
            background: '#fff', borderRadius: '14px',
            border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
            padding: '1rem 1.125rem', display: 'flex', alignItems: 'center', gap: '0.875rem',
          }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
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
        <div className="aps-search-wrap">
          <SearchIcon />
          <input
            className="aps-search"
            placeholder="Search slot number or zone…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Type</span>
          <div className="aps-filter-tabs">
            {TYPES.map(t => (
              <button key={t} className={`aps-filter-tab ${typeFilter === t ? 'active' : ''}`}
                onClick={() => setTypeFilter(t)}>
                {t === 'ALL' ? 'All' : TYPE_LABEL[t]}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Status</span>
          <div className="aps-filter-tabs">
            {STATUSES.map(s => (
              <button key={s} className={`aps-filter-tab green ${statusFilter === s ? 'active' : ''}`}
                onClick={() => setStatusFilter(s)}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="aps-content">
        <div className="aps-toolbar">
          <span className="aps-section-label">
            {loading ? 'Loading…' : `${displayed.length} slot${displayed.length !== 1 ? 's' : ''}`}
            {(typeFilter !== 'ALL' || statusFilter !== 'ALL' || search) ? ' (filtered)' : ''}
          </span>
          <button className="aps-add-btn" onClick={openAdd}>
            + Add Slot
          </button>
        </div>

        <div className="aps-table-wrap">
          {loading ? (
            <div className="aps-empty"><div className="aps-empty-title">Loading parking slots…</div></div>
          ) : displayed.length === 0 ? (
            <div className="aps-empty">
              <div className="aps-empty-title">No slots match your filters</div>
              <p style={{ fontSize: '0.8125rem', color: '#94a3b8', marginTop: '0.375rem' }}>
                Try adjusting the type or status filters.
              </p>
            </div>
          ) : (
            <table className="aps-table">
              <thead>
                <tr>
                  <th>Slot #</th>
                  <th>Zone</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map(slot => (
                  <tr key={slot.id}>
                    <td><span className="aps-td-slot">{slot.slotNumber}</span></td>
                    <td><span className="aps-td-zone">Zone {slot.zone}</span></td>
                    <td><span className={typeBadge(slot.type)}>{TYPE_LABEL[slot.type] ?? slot.type}</span></td>
                    <td>
                      <select
                        className="aps-status-select"
                        value={slot.status}
                        onChange={e => handleStatusChange(slot.id, e.target.value)}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="OCCUPIED">Occupied</option>
                        <option value="MAINTENANCE">Maintenance</option>
                      </select>
                    </td>
                    <td>
                      <div className="aps-action-row">
                        <button className="aps-btn aps-btn--edit" onClick={() => openEdit(slot)}>
                          Edit
                        </button>
                        <button className="aps-btn aps-btn--delete"
                          onClick={() => handleDelete(slot.id, slot.slotNumber)}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      {modalOpen && (
        <div className="aps-modal-overlay">
          <div className="aps-modal">
            <h2 className="aps-modal-title">
              {editTarget ? `Edit Slot — ${editTarget.slotNumber}` : 'Add New Parking Slot'}
            </h2>

            <div className="aps-field">
              <label>Slot Number</label>
              <input
                className="aps-input"
                value={form.slotNumber}
                onChange={e => setForm(p => ({ ...p, slotNumber: e.target.value.toUpperCase() }))}
                placeholder="e.g. CA01"
              />
            </div>

            <div className="aps-field">
              <label>Zone</label>
              <input
                className="aps-input"
                value={form.zone}
                onChange={e => setForm(p => ({ ...p, zone: e.target.value.toUpperCase() }))}
                placeholder="e.g. A"
              />
            </div>

            <div className="aps-field">
              <label>Vehicle Type</label>
              <select
                className="aps-select"
                value={form.type}
                onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
              >
                <option value="CAR">Car</option>
                <option value="MOTORCYCLE">Motorcycle</option>
                <option value="SUV">SUV</option>
              </select>
            </div>

            {formError && <p className="aps-error">{formError}</p>}

            <div className="aps-modal-actions">
              <button className="aps-modal-cancel" onClick={() => setModalOpen(false)}>Cancel</button>
              <button className="aps-modal-save" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving…' : editTarget ? 'Update Slot' : 'Create Slot'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
