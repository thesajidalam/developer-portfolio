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
    <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#09090c]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" aria-label="DevFolio home" className="transition-opacity hover:opacity-85">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1 md:flex">
          {links.map((l) => {
            const active = l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'rounded-full px-4 py-1.5 text-sm font-medium transition-all',
                  active
                    ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25'
                    : 'text-slate-400 hover:bg-white/[0.06] hover:text-white',
                )}
              >
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/api/v1/stats"
            className="hidden rounded-full px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:text-white sm:block"
          >
            API
          </Link>
          <Link
            href="/submit"
            className="shine rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-violet-500/40 active:scale-95"
          >
            + Add yours
          </Link>
        </div>
      </div>
    </header>
  )
}
