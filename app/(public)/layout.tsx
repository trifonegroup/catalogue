import { Suspense } from 'react'
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
          <span className="text-xl font-extrabold text-white tracking-tight">
            Tri<span className="text-blue-500">fone</span>
          </span>
        </header>
      }>
        <PublicNav categories={categories} />
      </Suspense>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer id="contact" className="bg-[#0A1220] text-gray-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 pb-10 border-b border-white/5">
            <div>
              <div className="text-xl font-extrabold text-white mb-3 tracking-tight">
                Tri<span className="text-blue-500">fone</span>
              </div>
              <p className="text-sm leading-relaxed text-gray-500 max-w-xs">
                Your trusted source for quality electronics and gadgets. Browse our catalogue and contact us to order.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Quick Links</h4>
              <ul className="space-y-2.5 text-sm">
                <li><a href="/" className="hover:text-white transition-colors">All Products</a></li>
                <li><a href="/admin/login" className="hover:text-white transition-colors">Admin Portal</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">Contact Us</h4>
              <ul className="space-y-2.5 text-sm">
                <li>Contact us to place orders</li>
                <li>or enquire about product availability</li>
              </ul>
            </div>
          </div>
          <p className="text-xs text-gray-600 text-center pt-6">
            © 2025 Trifone. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
