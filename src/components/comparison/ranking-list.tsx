'use client'

import Link from 'next/link'
import { Trophy, Medal, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RankingEntry {
  rank: number
  id: string
  name: string
  slug: string
  title?: string | null
  avatarUrl?: string | null
  health: string
  featured: boolean
  verified: boolean
  experienceLevel: string
  technologies: string[]
  score: {
    overallScore: number
    performanceScore: number
    accessibilityScore: number
    seoScore: number
    bestPracticesScore: number
    designScore: number
    contentScore: number
  } | null
}

type ScoreKey = 'overallScore' | 'performanceScore' | 'accessibilityScore' | 'seoScore' | 'designScore'

function getScoreTextClass(score: number) {
  if (score >= 90) return 'text-emerald-400'
  if (score >= 70) return 'text-yellow-400'
  if (score >= 50) return 'text-orange-400'
  return 'text-red-400'
}

function getScoreBgClass(score: number) {
  if (score >= 90) return 'bg-emerald-500/10 border-emerald-500/20'
  if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/20'
  if (score >= 50) return 'bg-orange-500/10 border-orange-500/20'
  return 'bg-red-500/10 border-red-500/20'
}

function getHealthDot(health: string) {
  switch (health) {
    case 'healthy': return 'bg-emerald-500'
    case 'needs_attention': return 'bg-yellow-500'
    case 'offline': return 'bg-red-500'
    default: return 'bg-zinc-500'
  }
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

function getRankStyle(rank: number) {
  if (rank === 1) return {
    border: 'border-amber-500/30',
    bg: 'bg-gradient-to-r from-amber-500/10 to-transparent',
    badge: 'bg-amber-500 text-zinc-950',
    glow: 'shadow-amber-500/10',
  }
  if (rank === 2) return {
    border: 'border-zinc-400/20',
    bg: 'bg-gradient-to-r from-zinc-400/5 to-transparent',
    badge: 'bg-zinc-300 text-zinc-950',
    glow: 'shadow-zinc-400/5',
  }
  if (rank === 3) return {
    border: 'border-orange-600/20',
    bg: 'bg-gradient-to-r from-orange-600/5 to-transparent',
    badge: 'bg-orange-600 text-zinc-950',
    glow: 'shadow-orange-600/5',
  }
  return {
    border: 'border-zinc-800',
    bg: '',
    badge: 'bg-zinc-800 text-zinc-400',
    glow: '',
  }
}

export function RankingList({
  rankings,
  scoreKey = 'overallScore',
}: {
  rankings: RankingEntry[]
  scoreKey?: ScoreKey
}) {
  if (rankings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 py-20 text-center">
        <p className="text-sm text-zinc-500">No ranked portfolios yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {rankings.map(entry => {
        const style = getRankStyle(entry.rank)
        const score = entry.score?.[scoreKey] ?? 0

        return (
          <Link
            key={entry.id}
            href={`/p/${entry.slug}`}
            className={cn(
              'group flex items-center gap-4 rounded-xl border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg',
              style.border,
              style.bg,
              style.glow,
              entry.rank <= 3 ? 'bg-zinc-900' : 'bg-zinc-900/50 hover:bg-zinc-900'
            )}
          >
            {/* Rank */}
            <div className="flex w-10 flex-shrink-0 items-center justify-center">
              {entry.rank <= 3 ? (
                <div className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm',
                  style.badge
                )}>
                  {entry.rank === 1 && <Trophy className="h-4 w-4" />}
                  {entry.rank === 2 && <Medal className="h-4 w-4" />}
                  {entry.rank === 3 && <Medal className="h-4 w-4" />}
                </div>
              ) : (
                <span className="text-sm font-bold text-zinc-500 tabular-nums">
                  #{entry.rank}
                </span>
              )}
            </div>

            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {entry.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={entry.avatarUrl}
                  alt={entry.name}
                  className="h-10 w-10 rounded-full object-cover ring-2 ring-zinc-800"
                />
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/40 ring-2 ring-zinc-800">
                  <span className="text-xs font-bold text-amber-400">{getInitials(entry.name)}</span>
                </div>
              )}
              <span
                className={cn(
                  'absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-zinc-900',
                  getHealthDot(entry.health)
                )}
              />
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="truncate text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">
                  {entry.name}
                </p>
                {entry.verified && (
                  <svg className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )}
              </div>
              {entry.title && (
                <p className="truncate text-xs text-zinc-500 mt-0.5">{entry.title}</p>
              )}
              {/* Tech pills - compact */}
              <div className="mt-1.5 flex flex-wrap gap-1">
                {entry.technologies.slice(0, 4).map(t => (
                  <span
                    key={t}
                    className="rounded bg-zinc-800/60 px-1.5 py-px text-[10px] font-medium text-zinc-500"
                  >
                    {t}
                  </span>
                ))}
                {entry.technologies.length > 4 && (
                  <span className="rounded bg-zinc-800/60 px-1.5 py-px text-[10px] font-medium text-zinc-600">
                    +{entry.technologies.length - 4}
                  </span>
                )}
              </div>
            </div>

            {/* Score badge */}
            {entry.score && (
              <div className={cn(
                'flex-shrink-0 rounded-lg border px-3 py-1.5 text-right',
                getScoreBgClass(score)
              )}>
                <span className={cn('block text-lg font-bold tabular-nums', getScoreTextClass(score))}>
                  {score}
                </span>
                <span className="block text-[9px] font-medium text-zinc-500 uppercase tracking-wider">
                  {scoreKey === 'overallScore' ? 'Overall' :
                   scoreKey === 'performanceScore' ? 'Perf' :
                   scoreKey === 'accessibilityScore' ? 'A11y' :
                   scoreKey === 'seoScore' ? 'SEO' : 'Design'}
                </span>
              </div>
            )}

            {/* Arrow */}
            <ExternalLink className="h-4 w-4 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-amber-400" />
          </Link>
        )
      })}
    </div>
  )
}
