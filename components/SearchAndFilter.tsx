'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useEffect, useState, useCallback } from 'react'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
  resultCount: number
  totalCount: number
}

export default function SearchAndFilter({ categories, resultCount, totalCount }: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const selectedCategory = searchParams.get('category') ?? ''

  const pushURL = useCallback((q: string, category: string) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    const qs = params.toString()
    router.push(`${pathname}${qs ? `?${qs}` : ''}#products`, { scroll: false })
  }, [router, pathname])

  // Debounce search input → URL update
  useEffect(() => {
    const t = setTimeout(() => pushURL(search, selectedCategory), 350)
    return () => clearTimeout(t)
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  const setCategory = (id: string) => pushURL(search, id)

  const clearAll = () => {
    setSearch('')
    pushURL('', '')
  }

  const isFiltered = !!search || !!selectedCategory

  return (
    <div className="space-y-3">
      {/* Search + clear row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-8 py-2.5 rounded-xl border border-gray-200 bg-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {isFiltered && (
          <button
            onClick={clearAll}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium whitespace-nowrap transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Category pills */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              !selectedCategory
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Result count */}
      {isFiltered && (
        <p className="text-sm text-gray-400">
          {resultCount === 0
            ? 'No products found'
            : `${resultCount} product${resultCount !== 1 ? 's' : ''} found`}
          {resultCount !== totalCount && ` (of ${totalCount})`}
        </p>
      )}
    </div>
  )
}
