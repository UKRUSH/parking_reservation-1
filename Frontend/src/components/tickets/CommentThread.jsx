import { useState } from 'react'
import { ticketApi } from '../../api/ticketApi'

function fmt(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

function initials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export default function CommentThread({ ticketId, comments, currentUserId, isAdmin, onRefresh }) {
  const [text, setText] = useState('')
  const [editId, setEditId] = useState(null)
  const [editText, setEditText] = useState('')
  const [busy, setBusy] = useState(false)

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!text.trim()) return
    setBusy(true)
    try {
      await ticketApi.addComment(ticketId, text.trim())
      setText('')
      onRefresh()
    } finally {
      setBusy(false)
    }
  }

  const handleEdit = async (commentId) => {
    if (!editText.trim()) return
    setBusy(true)
    try {
      await ticketApi.editComment(ticketId, commentId, editText.trim())
      setEditId(null)
      setEditText('')
      onRefresh()
    } finally {
      setBusy(false)
    }
  }

  const handleDelete = async (commentId) => {
    if (!confirm('Delete this comment?')) return
    setBusy(true)
    try {
      await ticketApi.deleteComment(ticketId, commentId)
      onRefresh()
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-gray-700 text-sm">
        Comments ({comments.length})
      </h3>

      {/* Comment list */}
      {comments.length === 0 ? (
        <p className="text-sm text-gray-400 italic">No comments yet. Be the first to comment.</p>
      ) : (
        <div className="space-y-3">
          {comments.map((c) => {
            const isOwn = c.authorId === currentUserId
            const canEdit = isOwn
            const canDelete = isOwn || isAdmin

            return (
              <div key={c.id} className="flex gap-3">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {initials(c.authorName)}
                </div>

                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-gray-800">{c.authorName}</span>
                    <span className="text-xs text-gray-400">{fmt(c.createdAt)}</span>
                    {c.updatedAt !== c.createdAt && (
                      <span className="text-xs text-gray-300">(edited)</span>
                    )}
                  </div>

                  {editId === c.id ? (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(c.id)}
                          disabled={busy}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => { setEditId(null); setEditText('') }}
                          className="px-3 py-1 border border-gray-300 text-gray-600 rounded text-xs font-medium hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{c.content}</p>
                      {(canEdit || canDelete) && (
                        <div className="flex gap-3 mt-1">
                          {canEdit && (
                            <button
                              onClick={() => { setEditId(c.id); setEditText(c.content) }}
                              className="text-xs text-blue-500 hover:underline"
                            >
                              Edit
                            </button>
                          )}
                          {canDelete && (
                            <button
                              onClick={() => handleDelete(c.id)}
                              disabled={busy}
                              className="text-xs text-red-400 hover:underline disabled:opacity-50"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* New comment form */}
      <form onSubmit={handleAdd} className="flex gap-2 pt-2 border-t border-gray-100">
        <textarea
          rows={2}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Write a comment…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button
          type="submit"
          disabled={busy || !text.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 self-end"
        >
          Post
        </button>
      </form>
    </div>
  )
}
