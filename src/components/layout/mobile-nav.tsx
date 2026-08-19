'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, LayoutGrid, Trophy, PlusCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navLinks = [
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/rankings', label: 'Rankings', icon: Trophy },
  { href: '/submit', label: 'Submit', icon: PlusCircle },
]

interface MobileNavProps {
  open: boolean
  onClose: () => void
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const pathname = usePathname()

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className={cn(
          'fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-zinc-950 shadow-2xl transition-transform duration-300 ease-out md:hidden',
          open ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4">
            <span className="text-sm font-semibold text-zinc-200">Navigation</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            <ul className="space-y-1">
              {navLinks.map(link => {
                const Icon = link.icon
                const active = pathname === link.href || pathname.startsWith(link.href + '/')
                return (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        active
                          ? 'bg-amber-500/10 text-amber-400'
                          : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100'
                      )}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      {link.label}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Bottom CTA */}
          <div className="border-t border-zinc-800 p-4">
            <Link href="/submit" className="block">
              <Button className="w-full bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 shadow-sm shadow-amber-500/20">
                Submit Your Portfolio
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
