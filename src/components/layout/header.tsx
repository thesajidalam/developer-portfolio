'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Sun, Moon, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { MobileNav } from '@/components/layout/mobile-nav'
import { CommandPalette } from '@/components/layout/command-palette'

const navLinks = [
  { href: '/explore', label: 'Explore' },
  { href: '/categories', label: 'Categories' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/submit', label: 'Submit' },
]

export function Header() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)
  const [, setTheme] = useState<'light' | 'dark'>('dark')

  function toggleTheme() {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'))
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-2.5">
            <div className="relative flex h-8 w-8 items-center justify-center">
              <svg
                viewBox="0 0 32 32"
                fill="none"
                className="h-8 w-8 text-amber-500"
                aria-hidden="true"
              >
                <rect
                  x="13"
                  y="6"
                  width="6"
                  height="20"
                  rx="1.5"
                  fill="currentColor"
                  opacity="0.9"
                />
                <circle cx="16" cy="9" r="3.5" fill="currentColor" />
                <path
                  d="M8 4C8 4 10 9 16 9C22 9 24 4 24 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.4"
                />
                <path
                  d="M5 2C5 2 9 8 16 8C23 8 27 2 27 2"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  opacity="0.2"
                />
                <rect
                  x="11"
                  y="26"
                  width="10"
                  height="3"
                  rx="1.5"
                  fill="currentColor"
                  opacity="0.6"
                />
              </svg>
            </div>
            <span className="text-lg font-semibold tracking-tight text-zinc-50">
              DevBeacon
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navLinks.map(link => {
              const active = pathname === link.href || pathname.startsWith(link.href + '/')
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-zinc-800/80 text-zinc-50'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                  )}
                >
                  {link.label}
                </Link>
              )
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* Search / Command palette trigger */}
            <button
              onClick={() => setCommandOpen(true)}
              className="hidden items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-1.5 text-sm text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-300 sm:flex"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search...</span>
              <kbd className="ml-2 flex h-5 select-none items-center gap-0.5 rounded border border-zinc-700 bg-zinc-800 px-1.5 font-mono text-[10px] font-medium text-zinc-400">
                ⌘K
              </kbd>
            </button>

            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9 text-zinc-400 hover:text-zinc-100"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Submit CTA - desktop */}
            <Link href="/submit" className="hidden sm:block">
              <Button
                size="sm"
                className="bg-amber-500 text-zinc-950 font-semibold hover:bg-amber-400 shadow-sm shadow-amber-500/20"
              >
                Submit
              </Button>
            </Link>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-zinc-400 hover:text-zinc-100 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            >
              <Menu className={cn('h-5 w-5 transition-all', mobileOpen && 'rotate-90 scale-0')} />
              <X className={cn('absolute h-5 w-5 transition-all', mobileOpen ? 'rotate-0 scale-100' : '-rotate-90 scale-0')} />
            </Button>
          </div>
        </div>
      </header>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </>
  )
}
