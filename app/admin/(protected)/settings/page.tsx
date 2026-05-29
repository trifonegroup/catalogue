import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'
import type { Setting } from '@/lib/types'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: setting } = await supabase
    .from('settings')
    .select('*')
    .eq('key', 'show_prices')
    .single()

  const showPrices = (setting as Setting | null)?.value === 'true'

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">Configure your public catalogue behaviour.</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        <div className="px-5 py-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-900">Show prices</p>
              <p className="text-sm text-gray-500 mt-0.5">
                When enabled, product prices are visible to all visitors on the public catalogue.
              </p>
            </div>
            <SettingsClient initialShowPrices={showPrices} />
          </div>
        </div>
      </div>
    </div>
  )
}
