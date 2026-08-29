'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={cn(
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                pathname === l.href
                  ? 'bg-slate-800/80 text-white'
                  : 'text-slate-400 hover:bg-slate-800/40 hover:text-white',
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/api/v1/stats"
            className="hidden rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white sm:block"
          >
            API
          </Link>
          <Link
            href="/submit"
            className="rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03]"
          >
            + Add yours
          </Link>
        </div>
      </div>
    </header>
  )
}
