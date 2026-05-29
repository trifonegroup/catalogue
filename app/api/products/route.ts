import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/types'

type ProductInsert = Database['public']['Tables']['products']['Insert']

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { name, description, price, category_id, is_available, images } = body

  if (!name?.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 422 })
  }

  const insertData: ProductInsert = {
    name: name.trim(),
    description: description ?? null,
    price: price ?? null,
    category_id: category_id ?? null,
    is_available: is_available ?? true,
    images: images ?? [],
  }

  const { data, error } = await supabase
    .from('products')
    // @ts-ignore – insert param resolves to never[] in next build (.next/types artifact)
    .insert(insertData)
    .select('*, categories(name)')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
}
