import { cn, getScoreBg, getScoreColor } from '@/lib/utils'
import { scoreLabel } from '@/lib/scoring'

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const title = scoreLabel(score).label
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-white/10 px-2.5 py-1 text-xs font-semibold backdrop-blur-sm',
        getScoreBg(score),
        getScoreColor(score),
        className,
      )}
      title={`${title} — ${score}/100`}
    >
      <span aria-hidden className="text-[0.8em] drop-shadow">★</span>
      {Math.round(score)}
    </span>
  )
}

const BAR_GRADIENTS: Record<string, string> = {
  'bg-red-400/10': 'from-red-400 to-orange-400',
  'bg-orange-400/10': 'from-orange-400 to-amber-400',
  'bg-amber-400/10': 'from-amber-400 to-emerald-400',
  'bg-green-500/10': 'from-green-500 to-emerald-400',
  'bg-emerald-400/10': 'from-emerald-400 to-emerald-300',
}

export function ScoreBar({ label, value, color }: { label: string; value: number; color?: string }) {
  const c = color ?? getScoreColor(value)
  const grad = BAR_GRADIENTS[getScoreBg(value) as string] ?? 'from-indigo-500 to-indigo-300'
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-slate-400">{label}</span>
        <span className={cn('font-semibold tabular-nums', c)}>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r', grad)}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}
