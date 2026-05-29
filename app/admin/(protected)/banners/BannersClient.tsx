'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Banner } from '@/lib/types'

interface Props {
  banners: Banner[]
}

const EMPTY_FORM = {
  headline: '',
  sub: '',
  badge_text: 'New Arrivals',
  cta_text: 'Browse Catalogue',
  cta_href: '#products',
  sort_order: 0,
}

export default function BannersClient({ banners }: Props) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)

  const [form, setForm] = useState(EMPTY_FORM)
  const [editId, setEditId] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const openNew = () => {
    setEditId(null)
    setForm(EMPTY_FORM)
    setImageFile(null)
    setImagePreview(null)
    setCurrentImageUrl(null)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const openEdit = (b: Banner) => {
    setEditId(b.id)
    setForm({
      headline: b.headline,
      sub: b.sub ?? '',
      badge_text: b.badge_text ?? 'New Arrivals',
      cta_text: b.cta_text ?? 'Browse Catalogue',
      cta_href: b.cta_href ?? '#products',
      sort_order: b.sort_order,
    })
    setImageFile(null)
    setImagePreview(null)
    setCurrentImageUrl(b.image_url)
    setError(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
    } else {
      setImagePreview(null)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      let image_url = currentImageUrl

      // Upload new image if selected
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        fd.append('bucket', 'banner-images')
        const res = await fetch('/api/upload', { method: 'POST', body: fd })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error ?? 'Upload failed')
        image_url = json.urls[0]
      }

      const payload = { ...form, image_url }

      if (editId) {
        const res = await fetch(`/api/banners/${editId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error ?? 'Save failed')
        }
      } else {
        const res = await fetch('/api/banners', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (!res.ok) {
          const json = await res.json()
          throw new Error(json.error ?? 'Save failed')
        }
      }

      openNew()
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    setDeletingId(id)
    await fetch(`/api/banners/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    if (editId === id) openNew()
    router.refresh()
  }

  const handleToggleActive = async (b: Banner) => {
    setTogglingId(b.id)
    await fetch(`/api/banners/${b.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !b.is_active }),
    })
    setTogglingId(null)
    router.refresh()
  }

  const input = 'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
  const label = 'block text-xs font-medium text-gray-600 mb-1'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

      {/* ── Left: Banner list ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700 text-sm">
            {banners.length} banner{banners.length !== 1 ? 's' : ''}
          </h2>
          <button
            onClick={openNew}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            + New banner
          </button>
        </div>

        {banners.length === 0 && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center text-sm text-gray-400">
            No banners yet. Create one using the form.
          </div>
        )}

        {banners.map((b) => (
          <div
            key={b.id}
            className={`bg-white rounded-xl border p-4 flex gap-4 items-start transition-colors ${editId === b.id ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-200'}`}
          >
            {/* Thumbnail */}
            <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
              {b.image_url ? (
                <Image src={b.image_url} alt={b.headline} fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-900 to-blue-700">
                  <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900 truncate">{b.headline}</p>
                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full ${b.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {b.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
              {b.sub && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{b.sub}</p>}
              <p className="text-xs text-gray-400 mt-0.5">Order: {b.sort_order}</p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => handleToggleActive(b)}
                disabled={togglingId === b.id}
                className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
                title={b.is_active ? 'Hide' : 'Show'}
              >
                {b.is_active ? '👁 Hide' : '👁 Show'}
              </button>
              <button
                onClick={() => openEdit(b)}
                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(b.id)}
                disabled={deletingId === b.id}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                {deletingId === b.id ? '…' : 'Delete'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Right: Form ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-5 text-sm">
          {editId ? 'Edit Banner' : 'New Banner'}
        </h2>

        <form onSubmit={handleSave} className="space-y-4">
          {/* Headline */}
          <div>
            <label className={label}>Headline *</label>
            <input
              className={input}
              value={form.headline}
              onChange={e => setForm(f => ({ ...f, headline: e.target.value }))}
              placeholder="Quality Electronics You Can Trust"
              required
            />
          </div>

          {/* Sub text */}
          <div>
            <label className={label}>Sub text</label>
            <textarea
              className={input + ' resize-none'}
              rows={2}
              value={form.sub}
              onChange={e => setForm(f => ({ ...f, sub: e.target.value }))}
              placeholder="Explore our range of top-tier gadgets and devices."
            />
          </div>

          {/* Badge + CTA in a row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>Badge text</label>
              <input
                className={input}
                value={form.badge_text}
                onChange={e => setForm(f => ({ ...f, badge_text: e.target.value }))}
                placeholder="New Arrivals"
              />
            </div>
            <div>
              <label className={label}>Sort order</label>
              <input
                type="number"
                className={input}
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
                min={0}
              />
            </div>
          </div>

          {/* CTA */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={label}>CTA button text</label>
              <input
                className={input}
                value={form.cta_text}
                onChange={e => setForm(f => ({ ...f, cta_text: e.target.value }))}
                placeholder="Browse Catalogue"
              />
            </div>
            <div>
              <label className={label}>CTA link</label>
              <input
                className={input}
                value={form.cta_href}
                onChange={e => setForm(f => ({ ...f, cta_href: e.target.value }))}
                placeholder="#products"
              />
            </div>
          </div>

          {/* Image upload */}
          <div>
            <label className={label}>Banner image (optional)</label>
            {(imagePreview ?? currentImageUrl) && (
              <div className="relative w-full h-32 rounded-lg overflow-hidden mb-2 bg-gray-100">
                <Image
                  src={imagePreview ?? currentImageUrl!}
                  alt="Banner preview"
                  fill
                  className="object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null)
                    setImagePreview(null)
                    setCurrentImageUrl(null)
                    if (fileRef.current) fileRef.current.value = ''
                  }}
                  className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/60 text-white text-xs flex items-center justify-center hover:bg-black/80"
                >
                  ✕
                </button>
              </div>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-blue-50 file:text-blue-700 file:text-xs file:font-medium hover:file:bg-blue-100 cursor-pointer"
            />
            <p className="text-xs text-gray-400 mt-1">Recommended: 1200×480px. Shows on the right side of the slide.</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold text-sm rounded-lg py-2.5 transition-colors"
            >
              {saving ? 'Saving…' : editId ? 'Save Changes' : 'Create Banner'}
            </button>
            {editId && (
              <button
                type="button"
                onClick={openNew}
                className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
