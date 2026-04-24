import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { parkingBookingApi } from '../../api/parkingBookingApi'
import { parkingSlotApi } from '../../api/parkingSlotApi'
import { helmetBorrowingApi } from '../../api/helmetBorrowingApi'
import ParkingMap from '../../components/parking/ParkingMap'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'

const STATUS_STYLES = {
  PENDING:   'bg-yellow-100 text-yellow-700',
  APPROVED:  'bg-green-100 text-green-700',
  REJECTED:  'bg-red-100 text-red-700',
  CANCELLED: 'bg-gray-100 text-gray-600',
}

const VEHICLE_TYPES = [
  {
    id: 'CAR',
    label: 'Car',
    icon: (
      <svg viewBox="0 0 64 32" className="w-16 h-8" fill="currentColor">
        <rect x="8" y="12" width="48" height="14" rx="3" />
        <rect x="16" y="6" width="28" height="10" rx="2" />
        <circle cx="18" cy="28" r="4" />
        <circle cx="46" cy="28" r="4" />
      </svg>
    ),
  },
  {
    id: 'MOTORCYCLE',
    label: 'Motorcycle',
    icon: (
      <svg viewBox="0 0 64 40" className="w-16 h-10" fill="currentColor">
        <circle cx="12" cy="30" r="8" fillOpacity="0" stroke="currentColor" strokeWidth="3" />
        <circle cx="52" cy="30" r="8" fillOpacity="0" stroke="currentColor" strokeWidth="3" />
        <path d="M12 30 L24 16 L38 16 L52 30" fillOpacity="0" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
        <rect x="30" y="10" width="10" height="6" rx="1" />
      </svg>
    ),
  },
  {
    id: 'SUV',
    label: 'SUV',
    icon: (
      <svg viewBox="0 0 64 36" className="w-16 h-9" fill="currentColor">
        <rect x="6" y="14" width="52" height="14" rx="3" />
        <rect x="12" y="6" width="36" height="12" rx="2" />
        <rect x="14" y="8" width="15" height="8" rx="1" fillOpacity="0.3" />
        <rect x="31" y="8" width="15" height="8" rx="1" fillOpacity="0.3" />
        <circle cx="18" cy="30" r="5" />
        <circle cx="46" cy="30" r="5" />
      </svg>
    ),
  },
]

function formatDateTime(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString()
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatTime(dt) {
  return new Date(dt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}
function formatDateShort(dt) {
  return new Date(dt).toLocaleDateString([], { month: 'short', day: 'numeric' })
}


function localDateStr(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ── Booking form modal ────────────────────────────────────────────────────────
function BookingFormModal({ slot, vehicleType, onClose, onBooked }) {
  const vehicleLabel = VEHICLE_TYPES.find(v => v.id === vehicleType)?.label ?? vehicleType

  const todayStr  = localDateStr()
  const maxDateStr = localDateStr(new Date(Date.now() + 2 * 24 * 60 * 60 * 1000))

  // Default start = next full hour; end = start + 2 h
  const defaultTimes = () => {
    const now = new Date()
    now.setMinutes(0, 0, 0)
    now.setHours(now.getHours() + 1)
    const start = now.toTimeString().slice(0, 5)
    now.setHours(now.getHours() + 2)
    const end = now.toTimeString().slice(0, 5)
    return { start, end }
  }
  const { start: defStart, end: defEnd } = defaultTimes()

  const [form, setForm] = useState({
    vehicleNumber: '',
    date: todayStr,
    startTime: defStart,
    endTime: defEnd,
    purpose: '',
  })
  const [submitting, setSubmitting]     = useState(false)
  const [error, setError]               = useState(null)
  const [slotBookings, setSlotBookings] = useState([])
  const [loadingSlot, setLoadingSlot]   = useState(true)
  const [slotError, setSlotError]       = useState(null)

  // Helmet borrowing state (only relevant for MOTORCYCLE)
  const [helmetWanted, setHelmetWanted]           = useState(false)
  const [helmetCount, setHelmetCount]             = useState(1)
  const [helmetPurpose, setHelmetPurpose]         = useState('')
  const [hasActiveHelmet, setHasActiveHelmet]     = useState(false)
  const [helmetCheckLoading, setHelmetCheckLoading] = useState(vehicleType === 'MOTORCYCLE')

  useEffect(() => {
    if (vehicleType !== 'MOTORCYCLE') return
    helmetBorrowingApi.getAll()
      .then(res => {
        const active = (res.data.data || []).some(b => b.status === 'PENDING' || b.status === 'ISSUED')
        setHasActiveHelmet(active)
      })
      .catch(() => {})
      .finally(() => setHelmetCheckLoading(false))
  }, [vehicleType])

  const fetchSlotBookings = () => {
    setLoadingSlot(true)
    setSlotError(null)
    parkingBookingApi.getBySlot(slot.id)
      .then(res => setSlotBookings(res.data.data || []))
      .catch(err => setSlotError(err.response?.status === 404 ? 'Endpoint not found — restart the backend.' : 'Could not load schedule.'))
      .finally(() => setLoadingSlot(false))
  }

  useEffect(() => { fetchSlotBookings() }, [slot.id])

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!/^[A-Z]{2,3} [0-9]{4}$/.test(form.vehicleNumber)) {
      setError('Enter a valid plate: 2–3 letters then 4 digits (e.g. AB 1234 or CAB 5678)')
      return
    }

    const startDT = `${form.date}T${form.startTime}:00`
    const endDT   = `${form.date}T${form.endTime}:00`

    if (form.date < todayStr || form.date > maxDateStr) {
      setError('Bookings are only allowed within the next 2 days'); return
    }
    if (endDT <= startDT) { setError('End time must be after start time'); return }
    if (new Date(startDT) < new Date()) { setError('Start time cannot be in the past'); return }

    setSubmitting(true)
    setError(null)
    try {
      const bookingRes = await parkingBookingApi.create({
        slotId: slot.id,
        startTime: startDT,
        endTime: endDT,
        vehicleNumber: form.vehicleNumber,
        purpose: form.purpose.trim() || `${vehicleLabel} parking`,
      })
      if (vehicleType === 'MOTORCYCLE' && helmetWanted && !hasActiveHelmet) {
        try {
          const newBookingId = bookingRes.data?.data?.id ?? null
          await helmetBorrowingApi.create({
            purpose: helmetPurpose.trim() || undefined,
            quantity: helmetCount,
            bookingId: newBookingId,
          })
        } catch {
          // helmet request failed silently — parking booking already confirmed
        }
      }
      onBooked()
    } catch (err) {
      setError(err.response?.data?.message || 'Booking failed. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-bold text-gray-800">Reserve Parking Slot</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">✕</button>
        </div>

        <div className="overflow-y-auto flex-1">
          {/* Slot info banner */}
          <div className="mx-6 mt-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-4">
            <span className="text-2xl font-extrabold text-blue-700">{slot.slotNumber}</span>
            <div className="text-sm text-blue-800 leading-tight">
              <div>Zone <strong>{slot.zone}</strong></div>
              <div className="text-blue-500">{vehicleLabel} parking</div>
            </div>
          </div>

          {/* ── Slot booking times ── */}
          <div className="mx-6 mt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Slot Schedule
            </p>

            {loadingSlot ? (
              <p className="text-xs text-gray-400 py-2">Loading schedule...</p>
            ) : slotError ? (
              <div className="flex items-center gap-2 py-1">
                <p className="text-xs text-red-500">{slotError}</p>
                <button onClick={fetchSlotBookings} className="text-xs text-blue-500 hover:underline shrink-0">Retry</button>
              </div>
            ) : slotBookings.length === 0 ? (
              <p className="text-xs text-green-600 py-1">No upcoming bookings — slot is fully available.</p>
            ) : (
              <div className="space-y-1 max-h-44 overflow-y-auto pr-1">
                {(() => {
                  // Group bookings by local date
                  const groups = {}
                  slotBookings.forEach(b => {
                    const key = localDateStr(new Date(b.startTime))
                    if (!groups[key]) groups[key] = []
                    groups[key].push(b)
                  })
                  return Object.entries(groups).map(([dateKey, items]) => (
                    <div key={dateKey}>
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mt-2 mb-0.5">
                        {new Date(`${dateKey}T12:00:00`).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </p>
                      {items.map(b => (
                        <div
                          key={b.id}
                          className="bg-red-50 border border-red-100 rounded-lg px-3 py-1.5 text-xs font-mono text-red-700"
                        >
                          {formatTime(b.startTime)} — {formatTime(b.endTime)}
                        </div>
                      ))}
                    </div>
                  ))
                })()}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="px-6 pb-6 pt-4 space-y-4">

            {/* Vehicle number — Sri Lankan format: 2–3 letters + 4 digits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. AB 1234 or CAB 5678"
                value={form.vehicleNumber}
                onChange={e => {
                  const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                  let letters = '', digits = '', i = 0
                  while (i < raw.length && /[A-Z]/.test(raw[i]) && letters.length < 3) letters += raw[i++]
                  while (i < raw.length && /[0-9]/.test(raw[i]) && digits.length < 4) digits += raw[i++]
                  set('vehicleNumber', digits.length > 0 ? `${letters} ${digits}` : letters)
                }}
                maxLength={8}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">2–3 letters followed by 4 digits &nbsp;·&nbsp; e.g. AB 1234</p>
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                min={todayStr}
                max={maxDateStr}
                value={form.date}
                onChange={e => set('date', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Start / End time */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={e => set('startTime', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={e => set('endTime', e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
            </div>

            {/* Duration hint */}
            {form.startTime && form.endTime && form.startTime < form.endTime && (
              <p className="text-xs text-gray-500">
                Duration: {(() => {
                  const [sh, sm] = form.startTime.split(':').map(Number)
                  const [eh, em] = form.endTime.split(':').map(Number)
                  const mins = (eh * 60 + em) - (sh * 60 + sm)
                  if (mins <= 0) return '—'
                  const h = Math.floor(mins / 60), m = mins % 60
                  return h > 0 ? `${h}h ${m > 0 ? m + 'm' : ''}` : `${m}m`
                })()}
              </p>
            )}

            {/* Purpose (optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purpose <span className="text-gray-400 font-normal">(optional)</span>
              </label>
              <input
                type="text"
                placeholder={`${vehicleLabel} parking`}
                value={form.purpose}
                onChange={e => set('purpose', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Helmet borrowing section — Motorcycle only */}
            {vehicleType === 'MOTORCYCLE' && (
              <div className="border border-orange-200 bg-orange-50 rounded-xl px-4 py-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">🪖</span>
                  <p className="text-sm font-semibold text-orange-800">Helmet Borrowing</p>
                </div>

                {helmetCheckLoading ? (
                  <p className="text-xs text-orange-600">Checking helmet availability…</p>
                ) : hasActiveHelmet ? (
                  <p className="text-xs text-orange-700 bg-orange-100 border border-orange-200 rounded-lg px-3 py-2">
                    You already have an active helmet request. It will be handled separately.
                  </p>
                ) : (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={helmetWanted}
                        onChange={e => setHelmetWanted(e.target.checked)}
                        className="w-4 h-4 accent-orange-500"
                      />
                      <span className="text-sm text-orange-800">Also request a campus helmet</span>
                    </label>

                    {helmetWanted && (
                      <div className="mt-3 space-y-3">
                        {/* Quantity selector */}
                        <div>
                          <p className="text-xs font-medium text-orange-700 mb-1.5">How many helmets?</p>
                          <div className="flex gap-2">
                            {[1, 2].map(n => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setHelmetCount(n)}
                                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold border transition ${
                                  helmetCount === n
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'bg-white text-orange-700 border-orange-300 hover:bg-orange-50'
                                }`}
                              >
                                <span>🪖</span> {n}
                              </button>
                            ))}
                          </div>
                        </div>

                        <input
                          type="text"
                          placeholder="Helmet purpose (optional)"
                          value={helmetPurpose}
                          onChange={e => setHelmetPurpose(e.target.value)}
                          className="w-full border border-orange-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 bg-white"
                        />
                        <p className="text-xs text-orange-500">
                          Helmet request will be submitted automatically with your booking.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Confirm Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ── Step 1: Vehicle type picker ───────────────────────────────────────────────
function VehicleSelector({ onSelect }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-gray-800 mb-1">Select Your Vehicle</h3>
      <p className="text-sm text-gray-500 mb-6">We will show available spaces for your vehicle type</p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {VEHICLE_TYPES.map((v) => (
          <button
            key={v.id}
            onClick={() => onSelect(v.id)}
            className="bg-white border-2 border-gray-200 rounded-xl p-6 flex flex-col items-center gap-3 hover:border-blue-500 hover:bg-blue-50 transition-all"
          >
            <span className="text-gray-700">{v.icon}</span>
            <span className="font-semibold text-gray-800">{v.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step 2: Map ───────────────────────────────────────────────────────────────
function SlotPicker({ vehicleType, onBack, onBooked }) {
  const [slots, setSlots]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState(null)
  const [selected, setSelected] = useState(null)

  const vehicleLabel = VEHICLE_TYPES.find(v => v.id === vehicleType)?.label

  useEffect(() => {
    setLoading(true)
    setError(null)
    parkingSlotApi
      .getSlots(vehicleType)
      .then(res => setSlots(res.data.data || []))
      .catch(() => setError('Could not load parking map. Is the backend running?'))
      .finally(() => setLoading(false))
  }, [vehicleType])

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <button onClick={onBack} className="text-sm text-blue-600 hover:underline">← Back</button>
        <h3 className="text-lg font-semibold text-gray-800">{vehicleLabel} Parking Spaces</h3>
        <span className="text-xs text-gray-400">Click a green slot to book</span>
      </div>

      {loading ? (
        <p className="text-gray-500 py-8 text-center">Loading parking map...</p>
      ) : error ? (
        <p className="text-red-600 bg-red-50 px-4 py-3 rounded-lg text-sm">{error}</p>
      ) : slots.length === 0 ? (
        <p className="text-gray-500 py-8 text-center">No parking spaces found for this vehicle type.</p>
      ) : (
        <ParkingMap
          slots={slots}
          selectedId={selected?.id}
          onSelect={setSelected}
        />
      )}

      {/* Booking form modal */}
      {selected && (
        <BookingFormModal
          slot={selected}
          vehicleType={vehicleType}
          onClose={() => setSelected(null)}
          onBooked={onBooked}
        />
      )}
    </div>
  )
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function MyBookingsPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [bookings, setBookings]           = useState([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [step, setStep]                   = useState('list')   // 'list' | 'vehicle' | 'map'
  const [vehicleType, setVehicleType]     = useState(null)

  const loadBookings = () => {
    setLoadingBookings(true)
    parkingBookingApi.getAll()
      .then(res => setBookings(res.data.data || []))
      .finally(() => setLoadingBookings(false))
  }

  useEffect(() => { loadBookings() }, [])

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return
    await parkingBookingApi.cancel(id)
    loadBookings()
  }

  const handleBooked = () => {
    setStep('list')
    setVehicleType(null)
    loadBookings()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={() => navigate('/student-dashboard')} className="text-sm text-blue-500 hover:underline">
            Dashboard
          </button>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">

        {/* ── Booking flow panel ── */}
        {step !== 'list' && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {step === 'vehicle' && (
              <VehicleSelector onSelect={type => { setVehicleType(type); setStep('map') }} />
            )}
            {step === 'map' && (
              <SlotPicker
                vehicleType={vehicleType}
                onBack={() => setStep('vehicle')}
                onBooked={handleBooked}
              />
            )}
          </div>
        )}

        {/* ── Bookings list ── */}
        {step === 'list' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">My Parking Bookings</h2>
              <button
                onClick={() => setStep('vehicle')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                + New Booking
              </button>
            </div>

            {loadingBookings ? (
              <p className="text-gray-500">Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-8 text-center text-gray-500">
                No bookings yet. Click <strong>+ New Booking</strong> to get started.
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => (
                  <div key={b.id} className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">
                          Slot {b.slotNumber}
                          {b.zone && <span className="text-gray-500 font-normal"> — Zone {b.zone}</span>}
                        </p>
                        {b.vehicleNumber && (
                          <p className="text-sm font-medium text-gray-700 mt-0.5">
                            Vehicle: <span className="tracking-widest">{b.vehicleNumber}</span>
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDateTime(b.startTime)} → {formatDateTime(b.endTime)}
                        </p>
                        {b.purpose && (
                          <p className="text-sm text-gray-400 mt-0.5">{b.purpose}</p>
                        )}
                        {b.rejectionReason && (
                          <p className="text-sm text-red-500 mt-1">Reason: {b.rejectionReason}</p>
                        )}
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status] ?? ''}`}>
                          {b.status}
                        </span>
                        {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                          <button
                            onClick={() => handleCancel(b.id)}
                            className="text-xs text-red-500 hover:underline"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
