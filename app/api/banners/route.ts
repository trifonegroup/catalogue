import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types'

type BannerInsert = Database['public']['Tables']['banners']['Insert']

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('banners')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { headline, sub, badge_text, cta_text, cta_href, image_url, sort_order, is_active } = body

  if (!headline?.trim()) {
    return NextResponse.json({ error: 'headline is required' }, { status: 422 })
  }

  const insertData: BannerInsert = {
    headline: headline.trim(),
    sub: sub ?? null,
    badge_text: badge_text ?? 'New Arrivals',
    cta_text: cta_text ?? 'Browse Catalogue',
    cta_href: cta_href ?? '#products',
    image_url: image_url ?? null,
    sort_order: sort_order ?? 0,
    is_active: is_active ?? true,
  }

  const { data, error } = await supabase
    .from('banners')
    // @ts-ignore – insert param resolves to never[] in next build (.next/types artifact)
    .insert(insertData)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
