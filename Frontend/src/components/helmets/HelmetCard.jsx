const STATUS_STYLE = {
  AVAILABLE: 'bg-green-100 text-green-700',
  IN_USE:    'bg-blue-100 text-blue-600',
  RETIRED:   'bg-gray-100 text-gray-500',
}

const CONDITION_STYLE = {
  GOOD: 'bg-emerald-100 text-emerald-700',
  FAIR: 'bg-amber-100 text-amber-700',
  POOR: 'bg-red-100 text-red-600',
}

const SIZE_ICON = { SMALL: 'S', MEDIUM: 'M', LARGE: 'L' }

export default function HelmetCard({ helmet, isAdmin, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
            {SIZE_ICON[helmet.size] ?? '?'}
          </div>
          <div>
            <div className="text-sm font-bold text-gray-800">{helmet.serialNumber}</div>
            <div className="text-xs text-gray-400">{helmet.size}</div>
          </div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[helmet.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {helmet.status === 'IN_USE' ? 'In Use' : helmet.status.charAt(0) + helmet.status.slice(1).toLowerCase()}
        </span>
      </div>

      {/* Condition badge */}
      <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${CONDITION_STYLE[helmet.condition] ?? 'bg-gray-100 text-gray-500'}`}>
        Condition: {helmet.condition.charAt(0) + helmet.condition.slice(1).toLowerCase()}
      </span>

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={() => onEdit(helmet)}
            className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 transition-colors"
          >
            Edit
          </button>
          <select
            value={helmet.status}
            onChange={e => onStatusChange(helmet.id, e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200 bg-white"
          >
            <option value="AVAILABLE">Available</option>
            <option value="IN_USE">In Use</option>
            <option value="RETIRED">Retired</option>
          </select>
          <button
            onClick={() => onDelete(helmet.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            Del
          </button>
        </div>
      )}
    </div>
  )
}
