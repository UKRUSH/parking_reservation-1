const STATUS_STYLE = {
  AVAILABLE:   'bg-green-100 text-green-700',
  OCCUPIED:    'bg-red-100 text-red-600',
  MAINTENANCE: 'bg-gray-100 text-gray-500',
}

const TYPE_STYLE = {
  CAR:        'bg-blue-100 text-blue-700',
  MOTORCYCLE: 'bg-purple-100 text-purple-700',
  SUV:        'bg-emerald-100 text-emerald-700',
}

export default function SlotCard({ slot, isAdmin, onEdit, onDelete, onStatusChange }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="text-lg font-bold text-gray-800">{slot.slotNumber}</div>
          <div className="text-xs text-gray-400 mt-0.5">Zone {slot.zone}</div>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLE[slot.status] ?? 'bg-gray-100 text-gray-500'}`}>
          {slot.status}
        </span>
      </div>

      {/* Type badge */}
      <span className={`self-start text-xs font-semibold px-2.5 py-1 rounded-full ${TYPE_STYLE[slot.type] ?? 'bg-gray-100 text-gray-500'}`}>
        {slot.type}
      </span>

      {/* Admin actions */}
      {isAdmin && (
        <div className="flex gap-2 pt-1 border-t border-gray-100">
          <button
            onClick={() => onEdit(slot)}
            className="flex-1 text-xs font-semibold py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
          >
            Edit
          </button>
          <select
            value={slot.status}
            onChange={e => onStatusChange(slot.id, e.target.value)}
            className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-200 bg-white"
          >
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
          <button
            onClick={() => onDelete(slot.id)}
            className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
          >
            Del
          </button>
        </div>
      )}
    </div>
  )
}
