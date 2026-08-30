import Link from 'next/link'
import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn('group inline-flex items-center gap-2.5', className)}>
      <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500 to-sky-400 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
        <span className="absolute inset-0 bg-gradient-to-br from-indigo-400/0 via-white/20 to-transparent" />
        <span className="relative">D</span>
      </span>
      <span className="text-lg font-bold tracking-tight">
        Dev<span className="text-gradient">Folio</span>
      </span>
    </Link>
  )
}
