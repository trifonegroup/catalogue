import { createClient } from '@/lib/supabase/server'
import CategoriesClient from './CategoriesClient'
import type { Category } from '@/lib/types'

export default async function CategoriesPage() {
  const supabase = await createClient()

  const { data } = await supabase.from('categories').select('*').order('name')
  const categories = (data ?? []) as Category[]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Organise your products into categories. Deleting a category uncategorises its products.
        </p>
      </div>
      <CategoriesClient categories={categories} />
    </div>
  )
}
