const TYPE_LABEL = { CAR: 'Car', MOTORCYCLE: 'Motorcycle', BICYCLE: 'Bicycle' }

const SLOT_COLORS = {
  selected:    'bg-blue-600 border-blue-700 text-white cursor-pointer scale-105',
  available:   'bg-green-100 border-green-400 text-green-800 cursor-pointer hover:bg-green-200 hover:scale-105',
  unavailable: 'bg-red-100 border-red-300 text-red-400 cursor-not-allowed',
  maintenance: 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed',
}

function SlotCell({ slot, selected, onSelect }) {
  const bookable = slot.available
  const colorClass = selected
    ? SLOT_COLORS.selected
    : bookable
      ? SLOT_COLORS.available
      : slot.status === 'MAINTENANCE'
        ? SLOT_COLORS.maintenance
        : SLOT_COLORS.unavailable

  return (
    <button
      onClick={() => bookable && onSelect(slot)}
      disabled={!bookable}
      title={bookable ? `Select ${slot.slotNumber}` : `${slot.slotNumber} — Unavailable`}
      className={`h-12 rounded border-2 text-xs font-bold flex items-center justify-center transition-all duration-150 ${colorClass}`}
    >
      {slot.slotNumber}
    </button>
  )
}

function ZonePanel({ name, slots, selectedId, onSelect }) {
  const available = slots.filter(s => s.available).length
  const type = slots[0]?.type ?? ''

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Zone header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">Zone {name}</span>
          <span className="text-xs text-gray-400">{TYPE_LABEL[type] ?? type}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          available > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {available}/{slots.length} free
        </span>
      </div>

      {/* 6-column slot grid → 24 slots = 4 rows */}
      <div className="p-3 grid grid-cols-6 gap-1.5">
        {slots.map(slot => (
          <SlotCell
            key={slot.id}
            slot={slot}
            selected={slot.id === selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}

export default function ParkingMap({ slots, selectedId, onSelect }) {
  const zones = slots.reduce((acc, slot) => {
    const z = slot.zone || 'Other'
    if (!acc[z]) acc[z] = []
    acc[z].push(slot)
    return acc
  }, {})

  const totalAvailable = slots.filter(s => s.available).length

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-green-100 border border-green-400 inline-block" />
          Available ({totalAvailable})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-red-100 border border-red-300 inline-block" />
          Occupied
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-blue-600 inline-block" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-gray-100 border border-gray-300 inline-block" />
          Maintenance
        </span>
      </div>

      {/* Entrance */}
      <div className="text-center">
        <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-8 py-1 rounded-full tracking-widest">
          ENTRANCE
        </span>
      </div>

      {/* Zones — 2 per row on md+, 1 per row on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(zones).map(([zoneName, zoneSlots]) => (
          <ZonePanel
            key={zoneName}
            name={zoneName}
            slots={zoneSlots}
            selectedId={selectedId}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
}
