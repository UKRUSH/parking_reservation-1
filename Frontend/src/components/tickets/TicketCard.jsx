import { useNavigate } from 'react-router-dom'

const STATUS_STYLE = {
  OPEN:        'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-700',
  RESOLVED:    'bg-green-100 text-green-700',
  CLOSED:      'bg-gray-100 text-gray-600',
  REJECTED:    'bg-red-100 text-red-700',
}

const PRIORITY_STYLE = {
  LOW:      'bg-gray-100 text-gray-500',
  MEDIUM:   'bg-blue-50 text-blue-600',
  HIGH:     'bg-orange-100 text-orange-600',
  CRITICAL: 'bg-red-100 text-red-600',
}

function fmt(dt) {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function TicketCard({ ticket }) {
  const navigate = useNavigate()

  return (
    <div
      onClick={() => navigate(`/tickets/${ticket.id}`)}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 cursor-pointer hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="font-semibold text-gray-800 text-sm leading-snug line-clamp-2 flex-1">
          {ticket.title}
        </h3>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[ticket.status] ?? ''}`}>
            {ticket.status.replace('_', ' ')}
          </span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${PRIORITY_STYLE[ticket.priority] ?? ''}`}>
            {ticket.priority}
          </span>
        </div>
      </div>

      {ticket.location && (
        <p className="text-xs text-gray-400 mb-2">📍 {ticket.location}</p>
      )}

      <p className="text-xs text-gray-500 line-clamp-2 mb-3">{ticket.description}</p>

      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>#{ticket.id} · {ticket.userName}</span>
        <span>{fmt(ticket.createdAt)}</span>
      </div>

      {ticket.technicianName && (
        <p className="text-xs text-gray-400 mt-1.5">
          🔧 Assigned to <span className="font-medium text-gray-600">{ticket.technicianName}</span>
        </p>
      )}
    </div>
  )
}
