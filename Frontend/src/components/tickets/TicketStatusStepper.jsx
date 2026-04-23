const STEPS = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']

const STEP_LABEL = {
  OPEN:        'Open',
  IN_PROGRESS: 'In Progress',
  RESOLVED:    'Resolved',
  CLOSED:      'Closed',
}

export default function TicketStatusStepper({ status }) {
  if (status === 'REJECTED') {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
        <span className="text-red-500 text-sm font-semibold">✗ Ticket Rejected</span>
      </div>
    )
  }

  const currentIndex = STEPS.indexOf(status)

  return (
    <div className="flex items-center gap-0">
      {STEPS.map((step, idx) => {
        const done    = idx < currentIndex
        const active  = idx === currentIndex
        const pending = idx > currentIndex

        return (
          <div key={step} className="flex items-center">
            {/* Circle */}
            <div className="flex flex-col items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors
                ${done    ? 'bg-green-500 border-green-500 text-white' : ''}
                ${active  ? 'bg-blue-600 border-blue-600 text-white' : ''}
                ${pending ? 'bg-white border-gray-300 text-gray-400' : ''}
              `}>
                {done ? '✓' : idx + 1}
              </div>
              <span className={`text-xs mt-1 whitespace-nowrap font-medium
                ${done    ? 'text-green-600' : ''}
                ${active  ? 'text-blue-600'  : ''}
                ${pending ? 'text-gray-400'  : ''}
              `}>
                {STEP_LABEL[step]}
              </span>
            </div>

            {/* Connector line */}
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-10 mx-1 mb-4 rounded-full transition-colors
                ${idx < currentIndex ? 'bg-green-400' : 'bg-gray-200'}
              `} />
            )}
          </div>
        )
      })}
    </div>
  )
}
