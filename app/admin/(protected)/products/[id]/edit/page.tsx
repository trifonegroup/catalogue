import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductForm from '../../ProductForm'
import type { Product, Category } from '@/lib/types'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditProductPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()

  const { data: productData } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  const { data: categoriesData } = await supabase
    .from('categories')
    .select('*')
    .order('name')

  const product = productData as Product | null
  const categories = (categoriesData ?? []) as Category[]

  if (!product) notFound()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
        <p className="text-sm text-gray-500 mt-0.5 truncate max-w-lg">{product.name}</p>
      </div>
      <ProductForm categories={categories} product={product} />
    </div>
  )
}
