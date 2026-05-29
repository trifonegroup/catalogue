'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import type { Category } from '@/lib/types'

interface Props {
  categories: Category[]
}

export default function PublicNav({ categories }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('q') ?? '')
  const [catOpen, setCatOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Keep input in sync when URL changes (e.g. clear from page)
  useEffect(() => {
    setSearch(searchParams.get('q') ?? '')
  }, [searchParams])

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setCatOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    router.push(q ? `/?q=${encodeURIComponent(q)}#products` : '/#products')
  }

  const handleCategorySelect = (id: string) => {
    setCatOpen(false)
    router.push(`/?category=${id}#products`)
  }

  return (
    <header className="bg-[#111827] sticky top-0 z-30 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-6">

        {/* Logo */}
        <Link href="/" className="shrink-0">
          <Image src="/logo.png" alt="Trifone" width={40} height={40} className="rounded" />
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1 shrink-0">

          {/* Categories dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setCatOpen(o => !o)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${catOpen ? 'bg-white/10 text-white' : 'text-gray-300 hover:text-white hover:bg-white/8'}`}
            >
              Categories
              <svg
                className={`w-3.5 h-3.5 transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {catOpen && (
              <div className="absolute left-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 z-50">
                <button
                  onClick={() => { setCatOpen(false); router.push('/#products') }}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 font-medium transition-colors"
                >
                  All Products
                </button>
                {categories.length > 0 && (
                  <div className="border-t border-gray-100 mt-1 pt-1">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className="w-full text-left px-4 py-2.5 text-sm text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
                {categories.length === 0 && (
                  <p className="px-4 py-2 text-xs text-gray-400">No categories yet</p>
                )}
              </div>
            )}
          </div>

          {/* Contact Us */}
          <Link
            href="/contact"
            className="px-3 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/8 transition-colors"
          >
            Contact Us
          </Link>
        </nav>

        {/* Search form */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-xl hidden sm:flex items-center gap-2 mx-2"
        >
          <div className="relative w-full">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search products…"
              className="w-full pl-9 pr-10 py-2.5 bg-white/10 hover:bg-white/[0.13] border border-white/10 rounded-xl text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/15 transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => { setSearch(''); router.push('/#products') }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <button
            type="submit"
            className="shrink-0 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors"
          >
            Search
          </button>
        </form>
      </div>
    </header>
  )
}
