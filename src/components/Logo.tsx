import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="DevFolio — curated developer portfolios, rated with transparency"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-br from-[#3e8bff] to-[#22d3ee] shadow-lg shadow-[#3e8bff]/25 ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-105">
        <span className="font-mono text-[13px] font-bold leading-none text-white tracking-tight">&lt;/&gt;</span>
        <span className="absolute -right-[3px] -top-[3px] h-2.5 w-2.5 rounded-full bg-[#F2B84B] ring-2 ring-[#0b0e1a]" />
      </span>
      <span className="text-lg font-bold tracking-tight text-[#e8eef9]">
        Dev<span className="text-[#7dd3fc]">Folio</span>
      </span>
    </Link>
  )
}