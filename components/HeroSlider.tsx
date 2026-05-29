'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Banner } from '@/lib/types'

// Fallback slides used when no banners exist in the database
const FALLBACK_SLIDES: Banner[] = [
  {
    id: 'f1', headline: 'Quality Electronics\nYou Can Trust', sub: 'Explore our carefully sourced range of gadgets, devices, and accessories.',
    badge_text: 'New Arrivals', cta_text: 'Browse Catalogue', cta_href: '#products',
    image_url: null, sort_order: 0, is_active: true, created_at: '',
  },
  {
    id: 'f2', headline: 'Premium Tech\nAt Every Budget', sub: 'From entry-level to professional grade — find the right device for your needs.',
    badge_text: 'Featured Items', cta_text: 'See All Products', cta_href: '#products',
    image_url: null, sort_order: 1, is_active: true, created_at: '',
  },
  {
    id: 'f3', headline: 'Everything You\nNeed, One Place', sub: 'Hundreds of products across all major categories. Catalogue updated weekly.',
    badge_text: 'Trusted Brands', cta_text: 'Explore Now', cta_href: '#products',
    image_url: null, sort_order: 2, is_active: true, created_at: '',
  },
]

const GRADIENTS = [
  { bg: 'from-[#0A1628] via-[#0D2137] to-[#081020]', glow: 'from-blue-600/25' },
  { bg: 'from-[#0D1A3E] via-[#162447] to-[#0A1228]', glow: 'from-indigo-600/25' },
  { bg: 'from-[#0C1E35] via-[#0F2A45] to-[#091828]', glow: 'from-cyan-600/25' },
]

interface Props {
  slides: Banner[]
}

export default function HeroSlider({ slides }: Props) {
  const activeSlides = slides.length > 0 ? slides : FALLBACK_SLIDES
  const [current, setCurrent] = useState(0)
  const [tick, setTick] = useState(0)

  const go = useCallback((idx: number) => {
    setCurrent(idx)
    setTick(t => t + 1)
  }, [])

  useEffect(() => {
    const t = setInterval(() => go((current + 1) % activeSlides.length), 5500)
    return () => clearInterval(t)
  }, [current, go, activeSlides.length])

  const slide = activeSlides[current]
  const grad = GRADIENTS[current % GRADIENTS.length]
  const hasImage = !!slide.image_url

  return (
    <div className="relative h-full rounded-2xl overflow-hidden">
      {/* Backgrounds */}
      {activeSlides.map((_, i) => {
        const g = GRADIENTS[i % GRADIENTS.length]
        return (
          <div
            key={i}
            className={`absolute inset-0 bg-gradient-to-br ${g.bg} transition-opacity duration-700 ${i === current ? 'opacity-100' : 'opacity-0'}`}
          />
        )
      })}

      {/* Glow (only when no image) */}
      {!hasImage && (
        <div className={`absolute inset-0 bg-gradient-to-l ${grad.glow} via-transparent to-transparent transition-all duration-700`} />
      )}

      {/* Decorative rings (only when no image) */}
      {!hasImage && (
        <>
          <div className="absolute -right-16 top-1/2 -translate-y-1/2 w-80 h-80 rounded-full border border-white/[0.04]" />
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full border border-white/[0.06]" />
          <div className="absolute right-16 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full border border-white/[0.08]" />
          <div
            className="absolute right-12 top-10 opacity-[0.07] pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
              backgroundSize: '18px 18px', width: '108px', height: '108px',
            }}
          />
        </>
      )}

      {/* Banner image (right side) */}
      {hasImage && (
        <div className="absolute right-0 top-0 bottom-0 w-1/2">
          <Image
            src={slide.image_url!}
            alt={slide.headline}
            fill
            className="object-cover opacity-60"
            priority
          />
          {/* Gradient fade from left to blend with text side */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0D1424] via-[#0D1424]/40 to-transparent" />
        </div>
      )}

      {/* Slide content */}
      <div
        key={tick}
        className="animate-fade-in-up relative z-10 flex flex-col justify-center h-full px-10 lg:px-14 py-10"
        style={{ maxWidth: hasImage ? '60%' : '100%' }}
      >
        <span className="inline-block text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5 w-fit bg-blue-600/20 text-blue-400 border border-blue-500/30">
          {slide.badge_text ?? 'New Arrivals'}
        </span>
        <h2 className="text-3xl lg:text-[40px] font-extrabold text-white leading-[1.15] mb-4 whitespace-pre-line">
          {slide.headline}
        </h2>
        {slide.sub && (
          <p className="text-gray-400 text-sm leading-relaxed max-w-[270px] mb-8">
            {slide.sub}
          </p>
        )}
        <Link
          href={slide.cta_href ?? '#products'}
          className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors w-fit"
        >
          {slide.cta_text ?? 'Browse Catalogue'}
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10 z-20">
        <div
          className="h-full bg-blue-500 transition-all duration-700"
          style={{ width: `${((current + 1) / activeSlides.length) * 100}%` }}
        />
      </div>

      {/* Arrows */}
      <button
        onClick={() => go((current - 1 + activeSlides.length) % activeSlides.length)}
        aria-label="Previous"
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 focus:outline-none"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button
        onClick={() => go((current + 1) % activeSlides.length)}
        aria-label="Next"
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center text-white transition-all hover:scale-110 focus:outline-none"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {activeSlides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 focus:outline-none ${
              i === current ? 'w-7 h-2 bg-blue-500' : 'w-2 h-2 bg-white/30 hover:bg-white/60'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
