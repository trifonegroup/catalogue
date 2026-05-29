import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types'

type ProductUpdate = Database['public']['Tables']['products']['Update']

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('id', id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  // Only pick known fields so callers can't overwrite id/created_at
  const patch: ProductUpdate = { updated_at: new Date().toISOString() }
  const allowed: (keyof ProductUpdate)[] = [
    'name', 'description', 'price', 'category_id', 'is_available', 'is_featured', 'images',
  ]
  for (const key of allowed) {
    if (key in body) (patch as Record<string, unknown>)[key] = body[key]
  }

  const { data, error } = await supabase
    .from('products')
    // @ts-ignore – update param resolves to never in next build (.next/types artifact)
    .update(patch)
    .eq('id', id)
    .select('*, categories(name)')
    .single()

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Fetch image URLs before deleting so we can clean up storage
  const { data: product } = await supabase
    .from('products')
    .select('images')
    .eq('id', id)
    .single() as { data: { images: string[] } | null, error: unknown }

  // Delete associated storage objects
  if (product?.images?.length) {
    const storagePaths = product.images
      .map((url: string) => {
        // URL shape: .../storage/v1/object/public/product-images/<path>
        const marker = '/product-images/'
        const idx = url.indexOf(marker)
        return idx !== -1 ? url.slice(idx + marker.length) : null
      })
      .filter(Boolean) as string[]

    if (storagePaths.length > 0) {
      await supabase.storage.from('product-images').remove(storagePaths)
    }
  }

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return new NextResponse(null, { status: 204 })
}
