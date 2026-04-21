const SLOT_COLORS = {
  selected:    'bg-blue-600 border-blue-700 text-white cursor-pointer',
  available:   'bg-green-100 border-green-400 text-green-800 cursor-pointer hover:bg-green-200',
  unavailable: 'bg-red-100 border-red-300 text-red-400 cursor-not-allowed',
  maintenance: 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed',
}

function ParkingSlot({ slot, selected, onSelect }) {
  const isBookable = slot.available
  const colorClass = selected
    ? SLOT_COLORS.selected
    : isBookable
      ? SLOT_COLORS.available
      : slot.status === 'MAINTENANCE'
        ? SLOT_COLORS.maintenance
        : SLOT_COLORS.unavailable

  return (
    <button
      onClick={() => isBookable && onSelect(slot)}
      disabled={!isBookable}
      title={isBookable ? `Select ${slot.slotNumber}` : `${slot.slotNumber} — Occupied`}
      className={`w-14 h-16 rounded border-2 text-xs font-bold flex flex-col items-center justify-center gap-0.5 transition-all ${colorClass}`}
    >
      <span className="text-sm leading-none">{slot.slotNumber}</span>
      {selected && <span className="text-[8px] uppercase tracking-wide opacity-80">Selected</span>}
    </button>
  )
}

function Zone({ name, slots, selectedId, onSelect }) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest mb-3">
        Zone {name}
        <span className="ml-2 text-gray-400 font-normal normal-case">
          ({slots.filter(s => s.available).length} available)
        </span>
      </p>
      {/* 4 columns × 3 rows grid for 12 slots */}
      <div className="grid grid-cols-4 gap-2">
        {slots.map((slot) => (
          <ParkingSlot
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

  const totalAvailable = slots.filter((s) => s.available).length

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-green-100 border border-green-400 inline-block" />
          Available ({totalAvailable})
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-red-100 border border-red-300 inline-block" />
          Occupied
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-blue-600 border border-blue-700 inline-block" />
          Selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-4 h-4 rounded bg-gray-100 border border-gray-300 inline-block" />
          Maintenance
        </span>
      </div>

      {/* Entrance */}
      <div className="text-center">
        <span className="inline-block bg-yellow-400 text-yellow-900 text-xs font-bold px-6 py-1 rounded-full tracking-wider">
          ENTRANCE
        </span>
      </div>

      {/* 2×2 zone grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(zones).map(([zoneName, zoneSlots]) => (
          <Zone
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
