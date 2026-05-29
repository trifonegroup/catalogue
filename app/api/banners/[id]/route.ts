import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types'

type BannerUpdate = Database['public']['Tables']['banners']['Update']

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const patch: BannerUpdate = {}
  const allowed: (keyof BannerUpdate)[] = [
    'headline', 'sub', 'badge_text', 'cta_text', 'cta_href', 'image_url', 'sort_order', 'is_active',
  ]
  for (const key of allowed) {
    if (key in body) (patch as Record<string, unknown>)[key] = body[key]
  }

  // @ts-ignore – update param resolves to never in next build (.next/types artifact)
  const { data, error } = await supabase
    .from('banners')
    // @ts-ignore – update param resolves to never in next build (.next/types artifact)
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Clean up storage image before deleting
  const { data: banner } = await supabase
    .from('banners')
    .select('image_url')
    .eq('id', id)
    .single() as { data: { image_url: string | null } | null, error: unknown }

  if (banner?.image_url) {
    const marker = '/banner-images/'
    const idx = banner.image_url.indexOf(marker)
    if (idx !== -1) {
      const storagePath = banner.image_url.slice(idx + marker.length)
      await supabase.storage.from('banner-images').remove([storagePath])
    }
  }

  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
