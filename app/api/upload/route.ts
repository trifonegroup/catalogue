import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const ALLOWED_BUCKETS = ['product-images', 'banner-images'] as const
type Bucket = typeof ALLOWED_BUCKETS[number]

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart/form-data' }, { status: 400 })
  }

  const files = formData.getAll('file') as File[]
  if (files.length === 0) {
    return NextResponse.json({ error: 'No files provided' }, { status: 422 })
  }

  const bucketParam = formData.get('bucket')?.toString() ?? 'product-images'
  const bucket: Bucket = (ALLOWED_BUCKETS as readonly string[]).includes(bucketParam)
    ? (bucketParam as Bucket)
    : 'product-images'

  const urls: string[] = []

  for (const file of files) {
    if (!(file instanceof File)) continue

    const safeName = file.name.replace(/[^a-z0-9.\-_]/gi, '_')
    const path = `${bucket}/${crypto.randomUUID()}-${safeName}`

    const arrayBuffer = await file.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (uploadError) {
      return NextResponse.json({ error: `Upload failed: ${uploadError.message}` }, { status: 500 })
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    urls.push(data.publicUrl)
  }

  return NextResponse.json({ urls }, { status: 201 })
}
