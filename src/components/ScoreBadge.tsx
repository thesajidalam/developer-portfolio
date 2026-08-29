import { cn, getScoreBg, getScoreColor } from '@/lib/utils'
import { scoreLabel } from '@/lib/scoring'

export function ScoreBadge({ score, className }: { score: number; className?: string }) {
  const title = scoreLabel(score).label
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
        getScoreBg(score),
        getScoreColor(score),
        className,
      )}
      title={`${title} — ${score}/100`}
    >
      <span aria-hidden className="text-[0.8em]">★</span>
      {Math.round(score)}
    </span>
  )
}

export function ScoreBar({ label, value, color }: { label: string; value: number; color?: string }) {
  const c = color ?? getScoreColor(value)
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{label}</span>
        <span className={cn('font-semibold', c)}>{Math.round(value)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className={cn('h-full rounded-full', c.replace('text-', 'bg-'))}
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      </div>
    </div>
  )
}
