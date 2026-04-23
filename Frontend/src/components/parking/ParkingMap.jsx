const TYPE_LABEL = { CAR: 'Car', MOTORCYCLE: 'Motorcycle', SUV: 'SUV' }

const SLOT_COLORS = {
  selected:       'bg-blue-600 border-blue-700 text-white cursor-pointer scale-105',
  available:      'bg-green-100 border-green-400 text-green-800 cursor-pointer hover:bg-green-200 hover:scale-105',
  partiallyBooked:'bg-orange-100 border-orange-400 text-orange-800 cursor-pointer hover:bg-orange-200 hover:scale-105',
  occupied:       'bg-red-100 border-red-300 text-red-400 cursor-not-allowed',
  maintenance:    'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed',
}

function SlotCell({ slot, selected, onSelect }) {
  // Bookable = physical status is AVAILABLE (regardless of time-based occupancy)
  const bookable        = slot.status === 'AVAILABLE'
  const partiallyBooked = bookable && !slot.available

  const colorClass = selected
    ? SLOT_COLORS.selected
    : !bookable
      ? slot.status === 'MAINTENANCE'
        ? SLOT_COLORS.maintenance
        : SLOT_COLORS.occupied
      : partiallyBooked
        ? SLOT_COLORS.partiallyBooked
        : SLOT_COLORS.available

  const titleText = selected
    ? `${slot.slotNumber} — Selected`
    : !bookable
      ? `${slot.slotNumber} — ${slot.status === 'MAINTENANCE' ? 'Under maintenance' : 'Unavailable'}`
      : partiallyBooked
        ? `${slot.slotNumber} — Some times taken, click to see schedule`
        : `${slot.slotNumber} — Available`

  return (
    <button
      onClick={() => bookable && onSelect(slot)}
      disabled={!bookable}
      title={titleText}
      className={`relative h-12 rounded border-2 text-xs font-bold flex items-center justify-center transition-all duration-150 ${colorClass}`}
    >
      {slot.slotNumber}
      {partiallyBooked && !selected && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-orange-500 rounded-full" />
      )}
    </button>
  )
}

function ZonePanel({ name, slots, selectedId, onSelect, showTypeLabel }) {
  const fullyFree = slots.filter(s => s.available).length
  const bookable  = slots.filter(s => s.status === 'AVAILABLE').length
  const type      = slots[0]?.type ?? ''

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Zone header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-700">Zone {name}</span>
          {showTypeLabel && (
            <span className="text-xs text-gray-400">{TYPE_LABEL[type] ?? type}</span>
          )}
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
          bookable > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
        }`}>
          {fullyFree}/{slots.length} free
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

export default function ParkingMap({ slots, selectedId, onSelect, showTypeLabel = true }) {
  const zones = slots.reduce((acc, slot) => {
    const z = slot.zone || 'Other'
    if (!acc[z]) acc[z] = []
    acc[z].push(slot)
    return acc
  }, {})

  const totalFree         = slots.filter(s => s.available).length
  const totalPartial      = slots.filter(s => s.status === 'AVAILABLE' && !s.available).length

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-600">
        <span className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded bg-green-100 border border-green-400 inline-block" />
          Free ({totalFree})
        </span>
        {totalPartial > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="w-3.5 h-3.5 rounded bg-orange-100 border border-orange-400 inline-block" />
            Partially booked ({totalPartial})
          </span>
        )}
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
            showTypeLabel={showTypeLabel}
          />
        ))}
      </div>
    </div>
  )
}
