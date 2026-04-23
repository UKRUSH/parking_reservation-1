import { useRef, useState } from 'react'

const MAX_FILES = 3
const MAX_MB = 5
const ALLOWED = ['image/jpeg', 'image/png']

export default function AttachmentUploader({ files, onChange }) {
  const inputRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  const handleFiles = (incoming) => {
    const list = Array.from(incoming)
    const valid = []
    const errors = []

    for (const f of list) {
      if (!ALLOWED.includes(f.type)) {
        errors.push(`${f.name}: only JPEG and PNG allowed`)
        continue
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        errors.push(`${f.name}: exceeds 5 MB limit`)
        continue
      }
      valid.push(f)
    }

    const combined = [...files, ...valid]
    if (combined.length > MAX_FILES) {
      errors.push(`Maximum ${MAX_FILES} attachments allowed`)
      onChange(combined.slice(0, MAX_FILES))
    } else {
      onChange(combined)
    }

    if (errors.length > 0) alert(errors.join('\n'))
  }

  const remove = (index) => {
    onChange(files.filter((_, i) => i !== index))
  }

  const onDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => files.length < MAX_FILES && inputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer
          ${dragOver ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'}
          ${files.length >= MAX_FILES ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        <p className="text-2xl mb-1">🖼️</p>
        <p className="text-sm text-gray-600 font-medium">
          {files.length >= MAX_FILES
            ? 'Maximum 3 files reached'
            : 'Drop images here or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">JPEG or PNG · max 5 MB each · up to 3 files</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Preview list */}
      {files.length > 0 && (
        <div className="space-y-2">
          {files.map((file, idx) => (
            <div key={idx} className="flex items-center gap-3 bg-gray-50 rounded-lg px-3 py-2">
              <img
                src={URL.createObjectURL(file)}
                alt={file.name}
                className="w-10 h-10 object-cover rounded"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-700 font-medium truncate">{file.name}</p>
                <p className="text-xs text-gray-400">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button
                type="button"
                onClick={() => remove(idx)}
                className="text-gray-400 hover:text-red-500 transition-colors text-lg font-bold"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
