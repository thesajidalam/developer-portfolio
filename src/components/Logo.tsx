import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="DevFolio — curated developer portfolios, rated with transparency"
    >
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-[10px] bg-gradient-to-br from-violet-500 via-fuchsia-500 to-lime-400 text-white shadow-lg shadow-violet-500/30 ring-1 ring-inset ring-white/20 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
        <span className="absolute inset-0 bg-gradient-to-br from-white/25 via-transparent to-transparent" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="relative h-[18px] w-[18px]"
          aria-hidden="true"
        >
          <rect x="5" y="11" width="2.4" height="8" rx="1.2" fill="currentColor" fillOpacity="0.85" />
          <rect x="10.8" y="7" width="2.4" height="12" rx="1.2" fill="currentColor" fillOpacity="0.95" />
          <rect x="16.6" y="3" width="2.4" height="16" rx="1.2" fill="currentColor" />
        </svg>
      </span>
      <span className="text-lg font-bold tracking-tight text-white">
        Dev<span className="text-gradient">Folio</span>
      </span>
    </Link>
  )
}
