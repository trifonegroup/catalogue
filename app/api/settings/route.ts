import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()

  const { data, error } = await supabase.from('settings').select('key, value')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Return as a flat key→value object: { show_prices: "true" }
  const result = Object.fromEntries(data.map(({ key, value }) => [key, value]))
  return NextResponse.json(result)
}

export async function PATCH(request: NextRequest) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { key, value } = body

  if (!key || value === undefined) {
    return NextResponse.json({ error: 'key and value are required' }, { status: 422 })
  }

  const { data, error } = await supabase
    .from('settings')
    // @ts-ignore – update param resolves to never in next build (.next/types artifact)
    .update({ value: String(value) })
    .eq('key', key)
    .select()
    .single()

  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}
