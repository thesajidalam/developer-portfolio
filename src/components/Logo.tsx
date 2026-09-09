import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('group inline-flex items-center gap-2.5', className)}
      aria-label="DevFolio — curated developer portfolios, rated with transparency"
    >
      <span className="relative flex h-8 w-8 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#1c0b24] to-[#180921] shadow-lg shadow-[#7B337E]/20 ring-1 ring-inset ring-white/10 transition-transform duration-300 group-hover:scale-105">
        <Moon />
        <span className="absolute right-[6px] top-[6px] h-[3px] w-[3px] rounded-full bg-[#00C4FF]" />
      </span>
      <span className="text-lg font-bold tracking-tight text-[#ede4f0]">
        Dev<span className="text-[#b98cc5]">Folio</span>
      </span>
    </Link>
  )
}

function Moon() {
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" aria-hidden="true">
      <path
        d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"
        fill="#f5d5e0"
        fillOpacity="0.95"
      />
    </svg>
  )
}