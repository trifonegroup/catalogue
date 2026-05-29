'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  id: string
  isFeatured: boolean
}

export default function FeaturedToggle({ id, isFeatured }: Props) {
  const [featured, setFeatured] = useState(isFeatured)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const toggle = async () => {
    setLoading(true)
    const next = !featured
    setFeatured(next)
    await fetch(`/api/products/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_featured: next }),
    })
    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      title={featured ? 'Remove from featured' : 'Mark as featured'}
      className={`text-lg leading-none transition-all ${loading ? 'opacity-40' : featured ? 'text-yellow-400 hover:text-gray-300' : 'text-gray-200 hover:text-yellow-400'}`}
    >
      ★
    </button>
  )
}
