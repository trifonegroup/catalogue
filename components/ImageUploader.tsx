'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface ImageUploaderProps {
  existingUrls?: string[]
  onUploadComplete: (urls: string[]) => void
}

export default function ImageUploader({ existingUrls = [], onUploadComplete }: ImageUploaderProps) {
  const [previews, setPreviews] = useState<string[]>(existingUrls)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    setUploading(true)

    const formData = new FormData()
    for (const file of Array.from(files)) {
      formData.append('file', file)
    }

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const json = await res.json()

    if (!res.ok) {
      setError(json.error ?? 'Upload failed')
      setUploading(false)
      return
    }

    const merged = [...previews, ...(json.urls as string[])]
    setPreviews(merged)
    onUploadComplete(merged)
    setUploading(false)
  }, [previews, onUploadComplete])

  const removeImage = (url: string) => {
    const updated = previews.filter((u) => u !== url)
    setPreviews(updated)
    onUploadComplete(updated)
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}>
        <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p className="text-sm font-medium text-gray-600">
          {uploading ? 'Uploading…' : 'Click to upload images'}
        </p>
        <p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP up to 10MB each</p>
        <input
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </label>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {previews.map((url) => (
            <div key={url} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <Image src={url} alt="Product image" fill className="object-contain p-1" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs leading-none"
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
