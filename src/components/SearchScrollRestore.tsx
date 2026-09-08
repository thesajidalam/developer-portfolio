'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

const KEY = 'df-search-scroll'

// When the user filters/searches from the gallery, a normal GET navigation runs
// and the browser resets the scroll to the top. Stash the pre-navigation scroll
// position and, only for pages carrying a non-empty search query, restore it so
// the results stay in view. Every other navigation keeps its default behaviour.
export function SearchScrollRestore() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    function onFormSubmit(e: Event) {
      const target = e.target as HTMLElement | null
      const form = target?.closest?.('form')
      if (!form || form.method !== 'get') return
      try {
        sessionStorage.setItem(KEY, String(window.scrollY || 0))
      } catch {
        // ignore storage errors
      }
    }
    window.addEventListener('submit', onFormSubmit, true)
    return () => window.removeEventListener('submit', onFormSubmit, true)
  }, [])

  useEffect(() => {
    if (pathname !== '/') return
    const q = searchParams.get('search')
    if (!q) return
    const saved = Number(sessionStorage.getItem(KEY) || '0')
    try {
      sessionStorage.removeItem(KEY)
    } catch {
      // ignore storage errors
    }
    const raf = requestAnimationFrame(() => {
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const pos = Math.min(saved || 0, max)
      if (pos > 0) window.scrollTo(0, pos)
    })
    return () => cancelAnimationFrame(raf)
  }, [pathname, searchParams])

  return null
}