'use client'

import { useId } from 'react'

function ringColor(score: number): { from: string; to: string; text: string } {
  if (score >= 90) return { from: '#34d399', to: '#059669', text: '#34d399' }
  if (score >= 75) return { from: '#22c55e', to: '#15803d', text: '#22c55e' }
  if (score >= 60) return { from: '#fbbf24', to: '#b45309', text: '#fbbf24' }
  if (score >= 40) return { from: '#fb923c', to: '#ea580c', text: '#fb923c' }
  return { from: '#f87171', to: '#dc2626', text: '#f87171' }
}

export function ScoreRing({ score, size = 64, label }: { score: number; size?: number; label?: string }) {
  const gradId = useId()
  const pct = Math.max(0, Math.min(100, score))
  const stroke = Math.max(5, Math.round(size * 0.085))
  const R = (size - stroke) / 2
  const C = 2 * Math.PI * R
  const offset = C - (pct / 100) * C
  const c = ringColor(score)

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={c.from} />
            <stop offset="100%" stopColor={c.to} />
          </linearGradient>
        </defs>
        {/* soft track */}
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(148,163,184,0.16)" strokeWidth={stroke} />
        {/* progress ring with gradient + glow */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={R}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)', filter: `drop-shadow(0 0 ${Math.max(2, size * 0.05)}px ${c.from}66)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className="font-bold leading-none tracking-tight"
          style={{ fontSize: size / 3.1, color: c.text }}
        >
          {Math.round(score)}
        </span>
        {label ? (
          <span className="mt-0.5 font-medium uppercase tracking-wide opacity-60" style={{ fontSize: Math.max(7, size * 0.085) }}>
            {label}
          </span>
        ) : null}
      </div>
    </div>
  )
}
