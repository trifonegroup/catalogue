import Link from 'next/link'
import Image from 'next/image'
import type { ProductWithCategory } from '@/lib/types'

interface ProductCardProps {
  product: ProductWithCategory
  showPrice: boolean
}

export default function ProductCard({ product, showPrice }: ProductCardProps) {
  const firstImage = product.images?.[0]

  return (
    <Link
      href={`/products/${product.id}`}
      className="group bg-white rounded-xl overflow-hidden flex flex-col"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
    >
      {/* Image area */}
      <div className="relative aspect-square bg-gray-50 overflow-hidden">
        {firstImage ? (
          <Image
            src={firstImage}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-contain p-4 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-gray-200">
            <svg className="w-14 h-14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

      </div>

      {/* Info */}
      <div className="p-3.5 flex flex-col gap-1 flex-1 border-t border-gray-100">
        {product.categories?.name && (
          <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest">
            {product.categories.name}
          </p>
        )}
        <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        {showPrice && product.price != null && (
          <p className="mt-1 text-base font-extrabold text-gray-900">
            ${Number(product.price).toFixed(2)}
          </p>
        )}
      </div>
    </Link>
  )
}
