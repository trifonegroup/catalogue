import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ProductWithCategory, Setting } from '@/lib/types'
import ImageSlider from '@/components/ImageSlider'

export const revalidate = 60

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: productData } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', id)
    .single()

  const { data: settingData } = await supabase
    .from('settings')
    .select('*')
    .eq('key', 'show_prices')
    .single()

  if (!productData) notFound()

  const product = productData as ProductWithCategory
  const showPrice = (settingData as Setting | null)?.value === 'true'
  const images: string[] = product.images ?? []

  return (
    <div className="space-y-8">
      {/* Back link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Back to catalogue
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Image gallery */}
        <ImageSlider images={images} productName={product.name} />

        {/* Info */}
        <div className="space-y-5">
          {/* Category */}
          {(product as any).categories?.name && (
            <p className="text-sm font-medium text-blue-600 uppercase tracking-wide">
              {(product as any).categories.name}
            </p>
          )}

          <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          {showPrice && product.price != null && (
            <p className="text-3xl font-bold text-gray-900">
              ${Number(product.price).toFixed(2)}
            </p>
          )}

          {/* Description */}
          {product.description && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">
                Description
              </h2>
              <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
