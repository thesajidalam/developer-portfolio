import { getScoreColor } from '@/lib/utils'

const SIZE = 64
const STROKE = 6
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

export function ScoreRing({ score, size = 64, label }: { score: number; size?: number; label?: string }) {
  const color = getScoreColor(score)
  const pct = Math.max(0, Math.min(100, score))
  const offset = C - (pct / 100) * C

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(148,163,184,0.2)" strokeWidth={STROKE} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="none"
          stroke="currentColor"
          strokeWidth={STROKE}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          className={color}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-bold leading-none" style={{ fontSize: size / 3.2 }}>
          {Math.round(score)}
        </span>
        {label ? <span className="text-[0.6em] opacity-60">{label}</span> : null}
      </div>
    </div>
  )
}
