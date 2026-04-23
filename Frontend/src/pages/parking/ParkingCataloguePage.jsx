import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { parkingSlotApi } from '../../api/parkingSlotApi'
import NotificationBell from '../../components/common/NotificationBell'
import SlotFilterBar from '../../components/parking/SlotFilterBar'
import SlotCard from '../../components/parking/SlotCard'

const EMPTY_FORM = { slotNumber: '', zone: '', type: 'CAR' }

export default function ParkingCataloguePage() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const isAdmin          = user?.roles?.includes('ADMIN')

  const [slots,   setSlots]   = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', type: 'ALL', status: 'ALL' })

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const fetchSlots = () => {
    setLoading(true)
    parkingSlotApi.getSlots()
      .then(res => setSlots(res.data.data || []))
      .catch(() => setSlots([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchSlots() }, [])

  const displayed = useMemo(() => {
    const q = filters.search.toLowerCase()
    return slots.filter(s => {
      if (filters.type   !== 'ALL' && s.type   !== filters.type)   return false
      if (filters.status !== 'ALL' && s.status !== filters.status) return false
      if (q && !s.slotNumber.toLowerCase().includes(q)
            && !s.zone?.toLowerCase().includes(q))                 return false
      return true
    })
  }, [slots, filters])

  const openAdd = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (slot) => {
    setEditTarget(slot)
    setForm({ slotNumber: slot.slotNumber, zone: slot.zone, type: slot.type })
    setError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.slotNumber || !form.zone || !form.type) {
      setError('All fields are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editTarget) {
        await parkingSlotApi.update(editTarget.id, form)
      } else {
        await parkingSlotApi.create(form)
      }
      setModalOpen(false)
      fetchSlots()
    } catch (e) {
      setError(e.response?.data?.message || 'An error occurred.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this parking slot?')) return
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

  const stats = {
    total:       slots.length,
    available:   slots.filter(s => s.status === 'AVAILABLE').length,
    occupied:    slots.filter(s => s.status === 'OCCUPIED').length,
    maintenance: slots.filter(s => s.status === 'MAINTENANCE').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
          <h1 className="text-xl font-bold text-gray-800">Parking Slot Catalogue</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Slots',  val: stats.total,       color: 'border-blue-500'  },
            { label: 'Available',    val: stats.available,   color: 'border-green-500' },
            { label: 'Occupied',     val: stats.occupied,    color: 'border-red-400'   },
            { label: 'Maintenance',  val: stats.maintenance, color: 'border-gray-400'  },
          ].map(({ label, val, color }) => (
            <div key={label} className={`bg-white rounded-xl p-4 shadow-sm border-l-4 ${color}`}>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{loading ? '…' : val}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">
            {displayed.length} slot{displayed.length !== 1 ? 's' : ''} shown
          </h2>
          {isAdmin && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
            >
              + Add Slot
            </button>
          )}
        </div>

        {/* Filters */}
        <SlotFilterBar filters={filters} onChange={setFilters} />

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading slots…</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">No slots match your filters.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {displayed.map(slot => (
              <SlotCard
                key={slot.id}
                slot={slot}
                isAdmin={isAdmin}
                onEdit={openEdit}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-5">
              {editTarget ? 'Edit Parking Slot' : 'Add Parking Slot'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Slot Number</label>
                <input
                  value={form.slotNumber}
                  onChange={e => setForm(p => ({ ...p, slotNumber: e.target.value }))}
                  placeholder="e.g. CA01"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Zone</label>
                <input
                  value={form.zone}
                  onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
                  placeholder="e.g. A"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Type</label>
                <select
                  value={form.type}
                  onChange={e => setForm(p => ({ ...p, type: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                >
                  <option value="CAR">Car</option>
                  <option value="MOTORCYCLE">Motorcycle</option>
                  <option value="SUV">SUV</option>
                </select>
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : editTarget ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
