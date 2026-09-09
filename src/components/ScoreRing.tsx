function ringColor(score: number): string {
  if (score >= 90) return '#34d399'
  if (score >= 75) return '#10b981'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

export function ScoreRing({ score, size = 64, label }: { score: number; size?: number; label?: string }) {
  const pct = Math.max(0, Math.min(100, score))
  const stroke = Math.max(5, Math.round(size * 0.085))
  const R = (size - stroke) / 2
  const C = 2 * Math.PI * R
  const offset = C - (pct / 100) * C
  const c = ringColor(score)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(190,160,194,0.14)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="none"
          stroke={c}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.7s cubic-bezier(0.16,1,0.3,1)' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-display font-bold leading-none tracking-tight"
          style={{ fontSize: size / 3.1, color: c }}
        >
          {Math.round(score)}
        </span>
        {label ? (
          <span className="mt-0.5 font-medium uppercase tracking-wide text-slate-500" style={{ fontSize: Math.max(7, size * 0.075) }}>
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}