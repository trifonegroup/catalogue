'use client'

import { useRouter } from 'next/navigation'
import PriceToggle from '@/components/PriceToggle'

export default function SettingsClient({ initialShowPrices }: { initialShowPrices: boolean }) {
  const router = useRouter()

  const handleToggle = async (value: boolean) => {
    await fetch('/api/settings', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: 'show_prices', value: value.toString() }),
    })
    router.refresh()
  }

  return <PriceToggle initialValue={initialShowPrices} onToggle={handleToggle} />
}
