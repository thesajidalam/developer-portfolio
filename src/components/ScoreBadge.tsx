import { Star } from 'lucide-react'
import { cn, getScoreBg, getScoreColor } from '@/lib/utils'
import { scoreLabel } from '@/lib/scoring'

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const title = scoreLabel(score).label
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold',
        getScoreBg(score),
        getScoreColor(score),
        className,
      )}
      title={`${title} — ${score}/100`}
    >
      <Star className="h-3 w-3 fill-current" aria-hidden />
      {Math.round(score)}
    </span>
  )
}

const BAR_COLORS: Record<string, string> = {
  'bg-red-400/10': '#ff657a',
  'bg-orange-400/10': '#ff7a52',
  'bg-amber-400/10': '#f2b84b',
  'bg-green-500/10': '#35d07f',
  'bg-emerald-400/10': '#4fe29b',
}

export function ScoreBar({ label, value, color }: { label: string; value: number; color?: string }) {
  const c = color ?? getScoreColor(value)
  const fill = BAR_COLORS[getScoreBg(value) as string] ?? '#7dd3fc'
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-400">{label}</span>
        <span className={cn('font-semibold tabular-nums', c)}>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/70">
        <div
          className="h-full rounded-full transition-[width] duration-500 ease-out"
          style={{ width: `${Math.max(0, Math.min(100, value))}%`, backgroundColor: fill }}
        />
      </div>
    </div>
  )
}