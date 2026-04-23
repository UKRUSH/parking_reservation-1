import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ticketApi } from '../../api/ticketApi'
import { useAuth } from '../../context/AuthContext'
import NotificationBell from '../../components/common/NotificationBell'
import AttachmentUploader from '../../components/tickets/AttachmentUploader'

const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']

export default function CreateTicketPage() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    title: '', description: '', location: '', priority: 'MEDIUM',
  })
  const [files, setFiles]   = useState([])
  const [busy, setBusy]         = useState(false)
  const [uploadStep, setUploadStep] = useState('')
  const [error, setError]       = useState('')

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.title.trim() || !form.description.trim()) {
      setError('Title and description are required.')
      return
    }

    setBusy(true)
    setUploadStep('Creating ticket…')
    try {
      const res = await ticketApi.create(form)
      const ticketId = res.data.data.id

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          setUploadStep(`Uploading image ${i + 1} of ${files.length}…`)
          try {
            await ticketApi.uploadAttachment(ticketId, files[i])
          } catch {
            // Attachment failures don't block ticket creation
          }
        }
      }

      navigate(`/tickets/${ticketId}`)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create ticket. Please try again.')
    } finally {
      setBusy(false)
      setUploadStep('')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-800">Smart Campus</h1>
        <div className="flex items-center gap-4">
          <NotificationBell />
          <span className="text-sm text-gray-600">{user?.name}</span>
          <button onClick={() => navigate('/tickets')} className="text-sm text-blue-500 hover:underline">
            My Tickets
          </button>
          <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-6 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Report an Incident</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Describe the issue and upload supporting images if available.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              maxLength={200}
              placeholder="Brief summary of the incident"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              rows={4}
              value={form.description}
              onChange={handleChange}
              placeholder="Describe what happened, when, and any relevant details…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          {/* Location + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Block A, Level 2"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {PRIORITIES.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Attachments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments <span className="text-gray-400 font-normal">(optional · up to 3 images)</span>
            </label>
            <AttachmentUploader files={files} onChange={setFiles} />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/tickets')}
              className="flex-1 border border-gray-300 text-gray-700 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 bg-blue-600 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {uploadStep || 'Submit Ticket'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
