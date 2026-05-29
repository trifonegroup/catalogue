import { createClient } from '@/lib/supabase/server'
import BannersClient from './BannersClient'
import type { Banner } from '@/lib/types'

export default async function BannersPage() {
  const supabase = await createClient()

  const { data } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  const banners = (data ?? []) as Banner[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hero Banners</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Manage the slides shown in the homepage hero slider.
        </p>
      </div>
      <BannersClient banners={banners} />
    </div>
  )
}
