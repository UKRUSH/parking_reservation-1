import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { helmetApi } from '../../api/helmetApi'
import NotificationBell from '../../components/common/NotificationBell'
import HelmetFilterBar from '../../components/helmets/HelmetFilterBar'
import HelmetCard from '../../components/helmets/HelmetCard'

const EMPTY_FORM = { serialNumber: '', size: 'MEDIUM', condition: 'GOOD' }

export default function HelmetCataloguePage() {
  const { user, logout } = useAuth()
  const navigate         = useNavigate()
  const isAdmin          = user?.roles?.includes('ADMIN')

  const [helmets, setHelmets] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({ search: '', size: 'ALL', status: 'ALL', condition: 'ALL' })

  const [modalOpen,  setModalOpen]  = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [saving,     setSaving]     = useState(false)
  const [error,      setError]      = useState('')

  const fetchHelmets = () => {
    setLoading(true)
    helmetApi.getAll({})
      .then(res => setHelmets(res.data.data || []))
      .catch(() => setHelmets([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchHelmets() }, [])

  const displayed = useMemo(() => {
    const q = filters.search.toLowerCase()
    return helmets.filter(h => {
      if (filters.size      !== 'ALL' && h.size      !== filters.size)      return false
      if (filters.status    !== 'ALL' && h.status    !== filters.status)    return false
      if (filters.condition !== 'ALL' && h.condition !== filters.condition) return false
      if (q && !h.serialNumber.toLowerCase().includes(q))                   return false
      return true
    })
  }, [helmets, filters])

  const openAdd = () => {
    setEditTarget(null)
    setForm(EMPTY_FORM)
    setError('')
    setModalOpen(true)
  }

  const openEdit = (helmet) => {
    setEditTarget(helmet)
    setForm({ serialNumber: helmet.serialNumber, size: helmet.size, condition: helmet.condition, status: helmet.status })
    setError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.serialNumber || !form.size || !form.condition) {
      setError('All fields are required.')
      return
    }
    setSaving(true)
    setError('')
    try {
      if (editTarget) {
        await helmetApi.update(editTarget.id, form)
      } else {
        await helmetApi.create(form)
      }
      setModalOpen(false)
      fetchHelmets()
    } catch (e) {
      setError(e.response?.data?.message || 'An error occurred.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Retire this helmet from inventory?')) return
    try {
      await helmetApi.delete(id)
      setHelmets(prev => prev.filter(h => h.id !== id))
    } catch (e) {
      alert(e.response?.data?.message || 'Delete failed.')
    }
  }

  const handleStatusChange = async (id, status) => {
    try {
      const res = await helmetApi.updateStatus(id, status)
      const updated = res.data.data
      setHelmets(prev => prev.map(h => h.id === id ? { ...h, status: updated.status } : h))
    } catch (e) {
      alert(e.response?.data?.message || 'Status update failed.')
    }
  }

  const stats = {
    total:     helmets.length,
    available: helmets.filter(h => h.status === 'AVAILABLE').length,
    inUse:     helmets.filter(h => h.status === 'IN_USE').length,
    retired:   helmets.filter(h => h.status === 'RETIRED').length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-600 text-sm">← Back</button>
          <h1 className="text-xl font-bold text-gray-800">Helmet Inventory</h1>
        </div>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto p-6 space-y-5">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Helmets', val: stats.total,     color: 'border-purple-500' },
            { label: 'Available',     val: stats.available, color: 'border-green-500'  },
            { label: 'In Use',        val: stats.inUse,     color: 'border-blue-500'   },
            { label: 'Retired',       val: stats.retired,   color: 'border-gray-400'   },
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
            {displayed.length} helmet{displayed.length !== 1 ? 's' : ''} shown
          </h2>
          {isAdmin && (
            <button
              onClick={openAdd}
              className="flex items-center gap-2 bg-purple-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-purple-700 transition-colors"
            >
              + Add Helmet
            </button>
          )}
        </div>

        {/* Filters */}
        <HelmetFilterBar filters={filters} onChange={setFilters} />

        {/* Grid */}
        {loading ? (
          <div className="text-center py-16 text-gray-400">Loading helmets…</div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            {helmets.length === 0
              ? 'No helmets in inventory yet. Add one to get started.'
              : 'No helmets match your filters.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {displayed.map(helmet => (
              <HelmetCard
                key={helmet.id}
                helmet={helmet}
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
              {editTarget ? 'Edit Helmet' : 'Add Helmet to Inventory'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Serial Number</label>
                <input
                  value={form.serialNumber}
                  onChange={e => setForm(p => ({ ...p, serialNumber: e.target.value }))}
                  placeholder="e.g. HLM-001"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Size</label>
                  <select
                    value={form.size}
                    onChange={e => setForm(p => ({ ...p, size: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
                  >
                    <option value="SMALL">Small</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LARGE">Large</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Condition</label>
                  <select
                    value={form.condition}
                    onChange={e => setForm(p => ({ ...p, condition: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
                  >
                    <option value="GOOD">Good</option>
                    <option value="FAIR">Fair</option>
                    <option value="POOR">Poor</option>
                  </select>
                </div>
              </div>

              {editTarget && (
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
                  >
                    <option value="AVAILABLE">Available</option>
                    <option value="IN_USE">In Use</option>
                    <option value="RETIRED">Retired</option>
                  </select>
                </div>
              )}

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
                className="flex-1 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700 disabled:opacity-50 transition-colors"
              >
                {saving ? 'Saving…' : editTarget ? 'Update' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
