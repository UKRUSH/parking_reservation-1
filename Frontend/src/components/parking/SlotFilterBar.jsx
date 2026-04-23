const TYPES    = ['ALL', 'CAR', 'MOTORCYCLE', 'SUV']
const STATUSES = ['ALL', 'AVAILABLE', 'OCCUPIED', 'MAINTENANCE']

export default function SlotFilterBar({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val })

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Search */}
      <input
        type="text"
        placeholder="Search slot number or zone…"
        value={filters.search ?? ''}
        onChange={e => set('search', e.target.value)}
        className="flex-1 min-w-[180px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
      />

      {/* Type */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Type</span>
        <div className="flex gap-1">
          {TYPES.map(t => (
            <button
              key={t}
              onClick={() => set('type', t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filters.type === t
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {t === 'ALL' ? 'All' : t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</span>
        <div className="flex gap-1">
          {STATUSES.map(s => (
            <button
              key={s}
              onClick={() => set('status', s)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                filters.status === s
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
              }`}
            >
              {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
