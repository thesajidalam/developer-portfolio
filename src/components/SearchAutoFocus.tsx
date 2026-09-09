'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'

export function SearchAutoFocus() {
  const params = useSearchParams()

  useEffect(() => {
    if (params.get('focus') !== 'search') return
    const el = document.getElementById('df-search-input') as HTMLInputElement | null
    el?.focus()
    document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [params])

  return null
}