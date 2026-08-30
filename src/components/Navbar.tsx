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
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#060914]/70 backdrop-blur-xl animate-hero">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="DevFolio home" className="transition-opacity hover:opacity-85">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-1.5 md:flex">
          {links.map((l) => {
            const active =
              l.href === '/' ? pathname === '/' : pathname.startsWith(l.href)
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'group relative rounded-lg px-3.5 py-2 text-sm font-medium transition-colors',
                  active ? 'text-white' : 'text-slate-400 hover:text-white',
                )}
              >
                {l.label}
                <span
                  className={cn(
                    'absolute inset-x-3 -bottom-0.5 h-px origin-left rounded-full bg-gradient-to-r from-indigo-400 to-sky-400 transition-transform duration-300 ease-out',
                    active ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100',
                  )}
                />
              </Link>
            )
          })}
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
            className="shine rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
          >
            + Add yours
          </Link>
        </div>
      </div>
    </header>
  )
}
