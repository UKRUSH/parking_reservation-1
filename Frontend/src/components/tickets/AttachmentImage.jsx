import { useEffect, useState } from 'react'
import { ticketApi } from '../../api/ticketApi'

export default function AttachmentImage({ ticketId, fileId, originalName, onDelete, canDelete }) {
  const [src, setSrc]         = useState(null)
  const [loading, setLoading] = useState(true)
  const [open, setOpen]       = useState(false)

  useEffect(() => {
    let objectUrl = null
    ticketApi.downloadAttachment(ticketId, fileId)
      .then(res => {
        objectUrl = URL.createObjectURL(res.data)
        setSrc(objectUrl)
      })
      .catch(() => {})
      .finally(() => setLoading(false))

    return () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }
  }, [ticketId, fileId])

  if (loading) {
    return (
      <div className="w-28 h-28 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
        <span className="text-gray-300 text-xs">Loading…</span>
      </div>
    )
  }

  if (!src) {
    return (
      <div className="w-28 h-28 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center">
        <span className="text-red-400 text-xs text-center px-2">Failed to load</span>
      </div>
    )
  }

  return (
    <>
      {/* Thumbnail */}
      <div className="relative group w-28">
        <img
          src={src}
          alt={originalName}
          onClick={() => setOpen(true)}
          className="w-28 h-28 object-cover rounded-xl border border-gray-200 cursor-zoom-in hover:opacity-90 transition"
        />
        <p className="text-xs text-gray-400 truncate mt-1 text-center">{originalName}</p>

        {canDelete && (
          <button
            onClick={() => onDelete(fileId)}
            className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
            title="Delete attachment"
          >
            ×
          </button>
        )}
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <img src={src} alt={originalName} className="w-full max-h-[80vh] object-contain rounded-xl shadow-2xl" />
            <p className="text-center text-white text-sm mt-2 opacity-70">{originalName}</p>
            <button
              onClick={() => setOpen(false)}
              className="absolute top-2 right-2 bg-white/20 hover:bg-white/40 text-white w-8 h-8 rounded-full font-bold text-lg flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  )
}
