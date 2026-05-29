import { Suspense } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import PublicNav from '@/components/PublicNav'
import type { Category } from '@/lib/types'

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data } = await supabase.from('categories').select('*').order('name')
  const categories = (data ?? []) as Category[]

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F6F8]">

      {/* Utility bar */}
      <div className="bg-[#060E1C] hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between text-xs text-gray-500">
          <span>Contact us to place an order or enquire about any product</span>
          <span>Catalogue updated regularly — check back for new arrivals</span>
        </div>
      </div>

      {/* Nav — Suspense required because PublicNav uses useSearchParams */}
      <Suspense fallback={
        <header className="bg-[#111827] sticky top-0 z-30 shadow-xl h-16 flex items-center px-6">
          <Image src="/logo.png" alt="Trifone" width={40} height={40} className="rounded" />
        </header>
      }>
        <PublicNav categories={categories} />
      </Suspense>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer id="contact" className="bg-[#0A1220] border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col items-center gap-4 text-center">
          <Image src="/logo.png" alt="Trifone" width={48} height={48} className="rounded" />
          <Link
            href="/contact"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            Contact Us
          </Link>
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} Trifone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
