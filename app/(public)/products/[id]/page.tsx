import { createClient } from '@/lib/supabase/server'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { ProductWithCategory, Setting } from '@/lib/types'

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
        <div className="space-y-3">
          {images.length > 0 ? (
            <>
              {/* Main image */}
              <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50">
                <Image
                  src={images[0]}
                  alt={product.name}
                  fill
                  className="object-contain p-6"
                  priority
                />
              </div>
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((url, i) => (
                    <div
                      key={url}
                      className="relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                    >
                      <Image
                        src={url}
                        alt={`${product.name} ${i + 1}`}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
              <svg className="w-24 h-24 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

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
