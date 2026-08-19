'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ScoreDisplayProps {
  score: {
    performanceScore: number
    accessibilityScore: number
    seoScore: number
    bestPracticesScore: number
    designScore: number
    contentScore: number
    overallScore: number
  }
  variant?: 'compact' | 'full' | 'ring'
  showLabels?: boolean
}

function getScoreColor(score: number) {
  if (score >= 90) return '#10b981'
  if (score >= 70) return '#eab308'
  if (score >= 50) return '#f97316'
  return '#ef4444'
}

function getScoreTextClass(score: number) {
  if (score >= 90) return 'text-emerald-400'
  if (score >= 70) return 'text-yellow-400'
  if (score >= 50) return 'text-orange-400'
  return 'text-red-400'
}

const dimensions = [
  { key: 'performanceScore' as const, label: 'Performance' },
  { key: 'accessibilityScore' as const, label: 'Accessibility' },
  { key: 'seoScore' as const, label: 'SEO' },
  { key: 'bestPracticesScore' as const, label: 'Best Practices' },
  { key: 'designScore' as const, label: 'Design' },
  { key: 'contentScore' as const, label: 'Content' },
]

function RingScore({ score }: { score: number }) {
  const [mounted, setMounted] = useState(false)
  const radius = 58
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative flex items-center justify-center">
      <svg width="140" height="140" viewBox="0 0 140 140">
        {/* Track */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-zinc-800"
        />
        {/* Progress */}
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          transform="rotate(-90 70 70)"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span
          className={cn(
            'text-3xl font-bold tabular-nums',
            getScoreTextClass(score)
          )}
        >
          {score}
        </span>
        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
          Overall
        </span>
      </div>
    </div>
  )
}

function CompactRing({ score }: { score: number }) {
  const [mounted, setMounted] = useState(false)
  const radius = 22
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="relative flex items-center justify-center">
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
          className="text-zinc-800"
        />
        <circle
          cx="28"
          cy="28"
          r={radius}
          fill="none"
          stroke={getScoreColor(score)}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={mounted ? offset : circumference}
          transform="rotate(-90 28 28)"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      </svg>
      <span
        className={cn(
          'absolute text-sm font-bold tabular-nums',
          getScoreTextClass(score)
        )}
      >
        {score}
      </span>
    </div>
  )
}

function BarChart({
  score,
  showLabels = true,
}: {
  score: ScoreDisplayProps['score']
  showLabels?: boolean
}) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  return (
    <div className="flex flex-col gap-3">
      {showLabels && (
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">
            Score Breakdown
          </span>
        </div>
      )}
      {dimensions.map(d => {
        const val = score[d.key]
        return (
          <div key={d.key} className="flex items-center gap-3">
            <span className="w-28 flex-shrink-0 text-xs text-zinc-400">
              {d.label}
            </span>
            <div className="relative h-2 flex-1 overflow-hidden rounded-full bg-zinc-800">
              <div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{
                  width: mounted ? `${val}%` : '0%',
                  backgroundColor: getScoreColor(val),
                  transition: 'width 1s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            </div>
            <span
              className={cn(
                'w-8 text-right text-xs font-bold tabular-nums',
                getScoreTextClass(val)
              )}
            >
              {val}
            </span>
          </div>
        )
      })}
    </div>
  )
}

export function ScoreDisplay({
  score,
  variant = 'full',
  showLabels = true,
}: ScoreDisplayProps) {
  if (variant === 'ring') {
    return (
      <div className="flex flex-col items-center gap-2">
        <RingScore score={score.overallScore} />
        <div className="mt-4 w-full">
          <BarChart score={score} showLabels={showLabels} />
        </div>
      </div>
    )
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <CompactRing score={score.overallScore} />
        <div className="flex flex-col gap-1">
          {showLabels && (
            <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-wider">
              Score
            </span>
          )}
        </div>
      </div>
    )
  }

  return <BarChart score={score} showLabels={showLabels} />
}
