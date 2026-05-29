'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
}

export default function CategoriesClient({ categories }: Props) {
  const router = useRouter()

  const [name, setName] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Failed to create')
    } else {
      setName('')
      router.refresh()
    }
    setSaving(false)
  }

  const startEdit = (cat: Category) => {
    setEditId(cat.id)
    setEditName(cat.name)
    setError(null)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editId) return
    setSaving(true)
    setError(null)
    const res = await fetch(`/api/categories/${editId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editName }),
    })
    const json = await res.json()
    if (!res.ok) {
      setError(json.error ?? 'Failed to update')
    } else {
      setEditId(null)
      setEditName('')
      router.refresh()
    }
    setSaving(false)
  }

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Delete "${catName}"? Products in this category will become uncategorised.`)) return
    setDeletingId(id)
    await fetch(`/api/categories/${id}`, { method: 'DELETE' })
    setDeletingId(null)
    if (editId === id) setEditId(null)
    router.refresh()
  }

  const inputCls = 'flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'

  return (
    <div className="max-w-xl space-y-6">

      {/* Create form */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-700 mb-4">Add New Category</h2>
        <form onSubmit={handleCreate} className="flex gap-2">
          <input
            className={inputCls}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Laptops, Phones, Accessories"
            required
          />
          <button
            type="submit"
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors shrink-0"
          >
            {saving ? 'Adding…' : 'Add'}
          </button>
        </form>
        {error && !editId && (
          <p className="text-xs text-red-600 mt-2">{error}</p>
        )}
      </div>

      {/* Category list */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {categories.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-400">
            No categories yet. Add one above.
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {categories.map(cat => (
              <li key={cat.id} className="px-4 py-3">
                {editId === cat.id ? (
                  <form onSubmit={handleUpdate} className="flex gap-2">
                    <input
                      className={inputCls}
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      required
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors shrink-0"
                    >
                      {saving ? '…' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 px-2 transition-colors"
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-900">{cat.name}</span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => startEdit(cat)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
                        disabled={deletingId === cat.id}
                        className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                      >
                        {deletingId === cat.id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </div>
                )}
                {error && editId === cat.id && (
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
