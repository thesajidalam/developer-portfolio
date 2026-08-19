import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

const colorVariants = {
  blue: 'bg-blue-500/10 text-blue-500',
  amber: 'bg-amber-500/10 text-amber-500',
  emerald: 'bg-emerald-500/10 text-emerald-500',
  red: 'bg-red-500/10 text-red-500',
  violet: 'bg-violet-500/10 text-violet-500',
}

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  trend?: { value: string; positive: boolean }
  color?: keyof typeof colorVariants
}

export function StatsCard({
  icon: Icon,
  label,
  value,
  trend,
  color = 'blue',
}: StatsCardProps) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-center justify-between">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-lg',
            colorVariants[color]
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        {trend && (
          <span
            className={cn(
              'text-xs font-medium',
              trend.positive ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-zinc-50">{value}</p>
        <p className="mt-0.5 text-sm text-zinc-400">{label}</p>
      </div>
    </div>
  )
}
