import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/server'
import HeroSlider from '@/components/HeroSlider'
import ProductCard from '@/components/ProductCard'
import type { ProductWithCategory, Setting, Banner, Category } from '@/lib/types'

interface Props {
  searchParams: Promise<{ q?: string; category?: string }>
}

export default async function CataloguePage({ searchParams }: Props) {
  const { q, category } = await searchParams
  const supabase = await createClient()

  // Filtered products query
  let productsQuery = supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  if (q?.trim()) productsQuery = productsQuery.ilike('name', `%${q.trim()}%`)
  if (category)   productsQuery = productsQuery.eq('category_id', category)

  const [
    { data: products },
    { data: settingData },
    { data: bannersData },
    { data: categoriesData },
  ] = await Promise.all([
    productsQuery,
    supabase.from('settings').select('*').eq('key', 'show_prices').single(),
    supabase.from('banners').select('*').eq('is_active', true).order('sort_order').order('created_at'),
    supabase.from('categories').select('*').order('name'),
  ])

  const showPrice     = (settingData as Setting | null)?.value === 'true'
  const filteredProducts = (products ?? []) as ProductWithCategory[]
  const banners       = (bannersData ?? []) as Banner[]
  const categories    = (categoriesData ?? []) as Category[]

  // Active filter labels
  const activeCategory = category ? categories.find(c => c.id === category) : null
  const isFiltered = !!(q?.trim() || category)

  // Sidebar: always unfiltered featured/latest
  const { data: featuredData } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(4)

  const featuredProducts  = (featuredData ?? []) as ProductWithCategory[]
  const sidebarProducts   = featuredProducts.length > 0 ? featuredProducts : filteredProducts.slice(0, 4)

  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="bg-[#0D1424]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4" style={{ minHeight: '420px' }}>

            <div className="lg:col-span-2" style={{ minHeight: '360px' }}>
              <HeroSlider slides={banners} />
            </div>

            {/* Featured sidebar */}
            <div className="hidden lg:flex flex-col gap-1 overflow-hidden">
              <div className="flex items-center justify-between mb-1 px-1">
                <h3 className="text-white text-sm font-semibold">
                  {featuredProducts.length > 0 ? 'Featured Products' : 'Latest Products'}
                </h3>
                <Link href="#products" className="text-blue-400 hover:text-blue-300 text-xs transition-colors">
                  View all →
                </Link>
              </div>

              {sidebarProducts.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-gray-600 text-sm">No products yet</p>
                </div>
              ) : (
                sidebarProducts.map((product) => {
                  const img = product.images?.[0]
                  return (
                    <Link
                      key={product.id}
                      href={`/products/${product.id}`}
                      className="flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/[0.08] rounded-xl p-3 transition-colors group flex-1"
                    >
                      <div className="relative w-14 h-14 rounded-lg bg-white/10 shrink-0 overflow-hidden">
                        {img ? (
                          <Image src={img} alt={product.name} fill sizes="56px" className="object-contain p-1" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        {product.categories?.name && (
                          <p className="text-blue-400 text-[10px] font-semibold uppercase tracking-wider mb-0.5">
                            {product.categories.name}
                          </p>
                        )}
                        <p className="text-white text-xs font-medium line-clamp-2 leading-tight group-hover:text-blue-300 transition-colors">
                          {product.name}
                        </p>
                        {showPrice && product.price != null && (
                          <p className="text-gray-300 text-xs font-bold mt-1">
                            ${Number(product.price).toFixed(2)}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Products ──────────────────────────────────────────── */}
      <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Section header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {activeCategory ? activeCategory.name : q?.trim() ? `Search: "${q.trim()}"` : 'All Products'}
            </h2>
            <p className="text-sm text-gray-400 mt-0.5">
              {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {!isFiltered && ' — contact us to order'}
            </p>
          </div>
          {isFiltered && (
            <Link
              href="/#products"
              className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear filter
            </Link>
          )}
        </div>

        {/* Grid */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            {isFiltered ? (
              <>
                <svg className="w-14 h-14 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <p className="text-lg font-medium text-gray-400">No products match</p>
                <p className="text-sm text-gray-300 mt-1">Try a different search or browse all categories.</p>
                <Link href="/#products" className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View all products
                </Link>
              </>
            ) : (
              <>
                <svg className="w-16 h-16 text-gray-200 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <p className="text-lg font-medium text-gray-400">No products yet</p>
                <p className="text-sm text-gray-300 mt-1">Check back soon.</p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} showPrice={showPrice} />
            ))}
          </div>
        )}
      </section>
    </>
  )
}
