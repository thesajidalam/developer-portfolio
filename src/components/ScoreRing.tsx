'use client'

import { useId } from 'react'

function ringColor(score: number): { from: string; to: string; text: string } {
  if (score >= 90) return { from: '#bef264', to: '#65a30d', text: '#bef264' }
  if (score >= 75) return { from: '#6ee7b7', to: '#059669', text: '#6ee7b7' }
  if (score >= 60) return { from: '#fde047', to: '#ca8a04', text: '#fde047' }
  if (score >= 40) return { from: '#fdba74', to: '#ea580c', text: '#fdba74' }
  return { from: '#fca5a5', to: '#dc2626', text: '#fca5a5' }
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
        <circle cx={size / 2} cy={size / 2} r={R} fill="none" stroke="rgba(148,148,160,0.14)" strokeWidth={stroke} />
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
