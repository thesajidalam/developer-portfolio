'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Menu, Search, X } from 'lucide-react'
import { Logo } from '@/components/Logo'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Gallery' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/compare', label: 'Compare' },
  { href: '/submit', label: 'Submit' },
]

export function Navbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function isActive(href: string) {
    return href === '/' ? pathname === '/' : pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#08111f]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="DevFolio home" className="transition-opacity hover:opacity-85">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                isActive(l.href)
                  ? 'bg-[#3b82f6]/15 text-[#d9e4f7]'
                  : 'text-slate-400 hover:bg-white/[0.05] hover:text-white',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/?focus=search"
            className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-sm text-slate-300 transition-colors hover:border-[#3b82f6]/50 hover:text-white md:inline-flex"
            aria-label="Search portfolios"
          >
            <Search className="h-3.5 w-3.5 text-slate-500" aria-hidden />
            <span>Search</span>
            <kbd className="rounded border border-white/10 bg-white/[0.04] px-1.5 font-mono text-[10px] text-slate-400">/</kbd>
          </Link>
          <Link
            href="/submit"
            className="btn-primary hidden rounded-full px-4 py-2 text-sm font-semibold text-white md:inline-flex"
          >
            Add yours
          </Link>
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-slate-300 transition-colors hover:text-white md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-white/[0.06] bg-[#030810]/95 px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive(l.href) ? 'bg-[#3b82f6]/15 text-[#d9e4f7]' : 'text-slate-300 hover:bg-white/[0.05] hover:text-white',
                )}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/?focus=search"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              <Search className="h-4 w-4 text-slate-500" aria-hidden />
              Search portfolios
            </Link>
            <Link
              href="/api/v1/stats"
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-slate-300 transition-colors hover:bg-white/[0.05] hover:text-white"
            >
              Public API
            </Link>
            <Link
              href="/submit"
              onClick={() => setOpen(false)}
              className="btn-primary mt-2 rounded-full px-4 py-2.5 text-center text-sm font-semibold text-white"
            >
              Add yours
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}