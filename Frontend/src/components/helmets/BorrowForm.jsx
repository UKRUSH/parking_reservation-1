import { useState } from 'react'
import { helmetBorrowingApi } from '../../api/helmetBorrowingApi'

export default function BorrowForm({ onSuccess, onCancel }) {
  const [purpose, setPurpose]       = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]           = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      await helmetBorrowingApi.create({ purpose: purpose.trim() || undefined })
      setPurpose('')
      onSuccess?.()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Purpose <span className="text-gray-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          placeholder="e.g. Motorcycle ride to lecture block"
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-xs text-gray-400 mt-1">
          Briefly describe why you need to borrow a helmet.
        </p>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      <div className="flex gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>
    </form>
  )
}
