const SIZES      = ['ALL', 'SMALL', 'MEDIUM', 'LARGE']
const STATUSES   = ['ALL', 'AVAILABLE', 'IN_USE', 'RETIRED']
const CONDITIONS = ['ALL', 'GOOD', 'FAIR', 'POOR']

export default function HelmetFilterBar({ filters, onChange }) {
  const set = (key, val) => onChange({ ...filters, [key]: val })

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 shadow-sm">
      {/* Search */}
      <input
        type="text"
        placeholder="Search serial number…"
        value={filters.search ?? ''}
        onChange={e => set('search', e.target.value)}
        className="flex-1 min-w-[180px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
      />

      {/* Size */}
      <FilterGroup label="Size" options={SIZES} current={filters.size} onSelect={v => set('size', v)} activeColor="bg-purple-600 border-purple-600 text-white" />

      {/* Status */}
      <FilterGroup label="Status" options={STATUSES} current={filters.status} onSelect={v => set('status', v)} activeColor="bg-green-600 border-green-600 text-white" />

      {/* Condition */}
      <FilterGroup label="Condition" options={CONDITIONS} current={filters.condition} onSelect={v => set('condition', v)} activeColor="bg-amber-500 border-amber-500 text-white" />
    </div>
  )
}

function FilterGroup({ label, options, current, onSelect, activeColor }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</span>
      <div className="flex gap-1">
        {options.map(o => (
          <button
            key={o}
            onClick={() => onSelect(o)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              current === o
                ? activeColor
                : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            {o === 'ALL' ? 'All' : o.charAt(0) + o.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  )
}
