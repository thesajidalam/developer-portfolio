'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export function SearchShortcut() {
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const inField = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'
      if (inField || tag === 'A' || tag === 'BUTTON') return
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return
      e.preventDefault()
      if (pathname === '/') {
        const el = document.querySelector<HTMLInputElement>('input[name="search"]')
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          el.focus()
        }
      } else {
        router.push('/?search=')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [pathname, router])

  return null
}
