'use client'

import { useState, useTransition } from 'react'

interface PriceToggleProps {
  initialValue: boolean
  onToggle: (value: boolean) => Promise<void>
}

export default function PriceToggle({ initialValue, onToggle }: PriceToggleProps) {
  const [enabled, setEnabled] = useState(initialValue)
  const [isPending, startTransition] = useTransition()

  const handleChange = () => {
    const next = !enabled
    setEnabled(next)
    startTransition(async () => {
      await onToggle(next)
    })
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={handleChange}
        disabled={isPending}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60 ${enabled ? 'bg-blue-600' : 'bg-gray-300'}`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
      </button>
      <span className="text-sm font-medium text-gray-700">
        {enabled ? 'Prices visible to customers' : 'Prices hidden from customers'}
      </span>
      {isPending && <span className="text-xs text-gray-400">Saving…</span>}
    </div>
  )
}
