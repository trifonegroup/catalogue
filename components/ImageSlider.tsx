'use client'

import Image from 'next/image'
import { useState } from 'react'

interface Props {
  images: string[]
  productName: string
}

export default function ImageSlider({ images, productName }: Props) {
  const [current, setCurrent] = useState(0)

  if (images.length === 0) {
    return (
      <div className="aspect-square rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center">
        <svg className="w-24 h-24 text-gray-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    )
  }

  const prev = () => setCurrent((c) => (c - 1 + images.length) % images.length)
  const next = () => setCurrent((c) => (c + 1) % images.length)

  return (
    <div className="space-y-3">
      {/* Main image with arrows */}
      <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group">
        <Image
          src={images[current]}
          alt={`${productName} ${current + 1}`}
          fill
          className="object-contain p-6 transition-opacity duration-300"
          priority
        />

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              aria-label="Previous image"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={next}
              aria-label="Next image"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/80 hover:bg-white shadow rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  aria-label={`Go to image ${i + 1}`}
                  className={`w-2 h-2 rounded-full transition-colors ${i === current ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((url, i) => (
            <button
              key={url}
              onClick={() => setCurrent(i)}
              className={`relative shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 bg-gray-50 transition-colors ${
                i === current ? 'border-blue-500' : 'border-gray-200 hover:border-gray-400'
              }`}
            >
              <Image
                src={url}
                alt={`${productName} ${i + 1}`}
                fill
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
