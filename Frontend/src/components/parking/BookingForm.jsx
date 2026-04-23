import { useState } from 'react'
import { parkingBookingApi } from '../../api/parkingBookingApi'

export default function BookingForm({ onSuccess, onCancel }) {
  const [form, setForm] = useState({
    slotId: '',
    startTime: '',
    endTime: '',
    purpose: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await parkingBookingApi.create({
        slotId: Number(form.slotId),
        startTime: form.startTime,
        endTime: form.endTime,
        purpose: form.purpose,
      })
      onSuccess?.()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create booking'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Slot ID</label>
        <input
          type="number"
          name="slotId"
          value={form.slotId}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter parking slot ID"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
        <input
          type="datetime-local"
          name="startTime"
          value={form.startTime}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
        <input
          type="datetime-local"
          name="endTime"
          value={form.endTime}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose (optional)</label>
        <input
          type="text"
          name="purpose"
          value={form.purpose}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g. Daily commute"
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Request Booking'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 rounded-lg py-2 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  )
}
