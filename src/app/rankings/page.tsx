import Link from 'next/link'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { ArrowRight, Award, Medal, Trophy } from 'lucide-react'
import { Avatar } from '@/components/PortfolioCard'
import { ScoreRing } from '@/components/ScoreRing'
import { ScoreBadge } from '@/components/ScoreBadge'
import { listPortfolios, portfolioLikeCounts, portfolioOfDay, topLiked } from '@/lib/repository'
import { cn, getHealthColor, hostnameOf } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Rankings',
  description: 'The top-scoring developer portfolios in the DevFolio directory, ranked by a transparent six-dimension model.',
}

const PAGE_SIZE = 50

const SORT_TABS = [
  { key: 'score', label: 'By Score' },
  { key: 'likes', label: 'By Likes' },
  { key: 'newest', label: 'Newest' },
] as const

const MEDAL_STYLES: Record<number, { ring: string; badge: string; label: string; icon: ReactNode; glow: string }> = {
  1: {
    ring: 'border-[#f59e0b]/50 bg-[#f59e0b]/5',
    badge: 'bg-[#f59e0b]/15 text-[#f59e0b]',
    label: 'Gold',
    icon: <Trophy className="h-8 w-8 text-[#f59e0b]" aria-hidden />,
    glow: 'shadow-[#f59e0b]/20',
  },
  2: {
    ring: 'border-slate-300/40 bg-slate-300/5',
    badge: 'bg-slate-300/15 text-slate-200',
    label: 'Silver',
    icon: <Medal className="h-8 w-8 text-slate-300" aria-hidden />,
    glow: 'shadow-slate-300/15',
  },
  3: {
    ring: 'border-[#f97316]/50 bg-[#f97316]/5',
    badge: 'bg-[#f97316]/15 text-[#f97316]',
    label: 'Bronze',
    icon: <Award className="h-8 w-8 text-[#f97316]" aria-hidden />,
    glow: 'shadow-[#f97316]/15',
  },
}

export default async function RankingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const sp = await searchParams
  const rawPage = typeof sp.page === 'string' ? Number(sp.page) : 1
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? Math.floor(rawPage) : 1
  const sortParam = typeof sp.sort === 'string' && ['score', 'likes', 'newest'].includes(sp.sort) ? sp.sort as 'score' | 'likes' | 'newest' : 'score'

  let result: Awaited<ReturnType<typeof listPortfolios>>

  if (sortParam === 'likes') {
    result = await topLiked(500, page, PAGE_SIZE)
  } else {
    result = await listPortfolios({ sort: sortParam === 'newest' ? 'newest' : 'score', page, pageSize: PAGE_SIZE })
  }

  const displayedIds = result.data.map((p) => p.id)
  const likeCounts = await portfolioLikeCounts(displayedIds)
  const potd = await portfolioOfDay().catch(() => null)

  const top3 = result.data.slice(0, 3)
  const rest = result.data.slice(3)

  return (
    <div className="relative overflow-hidden">
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="animate-hero mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#f8fafc]">Rankings</h1>
          <p className="mt-2 text-slate-400">
            {result.meta.total.toLocaleString()} portfolios, ranked and sorted.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {SORT_TABS.map((tab) => {
              const isActive = sortParam === tab.key
              return (
                <Link
                  key={tab.key}
                  href={`/rankings?sort=${tab.key}${page > 1 ? `&page=${page}` : ''}`}
                  scroll={false}
                  className={cn(
                    'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'border-[#3b82f6]/60 bg-[#3b82f6]/15 text-[#d9e4f7]'
                      : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-[#3b82f6]/40 hover:bg-white/[0.05] hover:text-white',
                  )}
                >
                  {tab.label}
                </Link>
              )
            })}
          </div>
        </div>

        <div className="animate-hero mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {top3.map((p, i) => {
            const rank = i + 1
            const medal = MEDAL_STYLES[rank]
            return (
              <Link
                key={p.id}
                href={`/p/${p.slug}`}
                className={cn(
                  'group relative flex flex-col items-center rounded-2xl border p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                  medal?.ring,
                  medal?.glow,
                )}
              >
                <span className="mb-3">{medal?.icon}</span>
                <span className={cn('mb-3 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', medal?.badge)}>
                  {medal?.label}
                </span>
                <Avatar p={p} size="lg" />
                <h3 className="mt-3 truncate font-semibold text-white group-hover:text-[#7dd3fc]">{p.name}</h3>
                <span className="mt-0.5 block truncate text-xs text-slate-500">{hostnameOf(p.portfolioUrl)}</span>
                <div className="mt-3">
                  <ScoreRing score={p.score?.overallScore ?? 0} size={72} label="overall" />
                </div>
                <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                  <span className={cn('h-2 w-2 rounded-full', getHealthColor(p.health))} />
                  <span>{likeCounts.get(p.id) ?? 0} likes</span>
                </div>
              </Link>
            )
          })}

          {potd && (
            <div className="rounded-2xl bg-gradient-to-br from-[#38bdf8]/45 via-white/10 to-[#3b82f6]/45 p-[1.5px]">
              <div className="relative flex h-full flex-col items-center overflow-hidden rounded-2xl bg-[#050a14]/95 p-6 text-center transition-all duration-300 hover:-translate-y-1">
                <div className="pointer-events-none absolute -right-12 -top-12 h-36 w-36 rounded-full bg-[#38bdf8]/15 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-[#3b82f6]/20 blur-3xl" />

                <span className="relative inline-flex items-center gap-1.5 rounded-full border border-[#38bdf8]/40 bg-[#38bdf8]/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-[#7dd3fc]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#38bdf8] animate-pulse-glow" />
                  Of the Day
                </span>

                <div className="relative mt-3">
                  <Avatar p={potd} size="lg" />
                </div>
                <h3 className="relative mt-3 w-full truncate font-semibold text-white group-hover:text-[#7dd3fc]">{potd.name}</h3>
                <span className="relative mt-0.5 block w-full truncate text-xs text-slate-500">{hostnameOf(potd.portfolioUrl)}</span>

                <div className="relative mt-3">
                  <ScoreRing score={potd.score?.overallScore ?? 0} size={72} label="score" />
                </div>

                <div className="relative mt-3 flex max-w-full flex-wrap justify-center gap-1.5">
                  {(potd.technologies ?? []).slice(0, 3).map((t) => (
                    <span key={t} className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/p/${potd.slug}`}
                  className="shine relative mt-4 inline-flex items-center gap-1.5 rounded-lg bg-[#3b82f6] px-3.5 py-2 text-xs font-semibold text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-[#60a5fa]"
                >
                  View the report
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="animate-hero rounded-2xl border border-white/[0.08] bg-[#101c2d]/70">
          <div className="w-full overflow-x-auto">
            <table className="w-full table-fixed">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="w-10 px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">#</th>
                  <th className="w-[34%] px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">Portfolio</th>
                  <th className="hidden w-[24%] px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500 lg:table-cell">Stack</th>
                  <th className="hidden w-[16%] px-3 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:table-cell">Health</th>
                  <th className="w-20 px-3 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">Score</th>
                  <th className="w-16 px-3 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">Likes</th>
                </tr>
              </thead>
              <tbody>
                {rest.map((p, i) => {
                  const rank = i + 4 + (page - 1) * PAGE_SIZE
                  return (
                    <tr key={p.id} className="border-t border-white/5 transition-colors hover:bg-white/[0.02]">
                      <td className="px-3 py-3 text-sm text-slate-500">{rank}</td>
                      <td className="px-3 py-3">
                        <Link href={`/p/${p.slug}`} className="flex items-center gap-3">
                          <Avatar p={p} size="sm" />
                          <div className="min-w-0 max-w-full">
                            <span className="block truncate font-medium text-white hover:text-[#7dd3fc]">{p.name}</span>
                            <span className="block truncate text-xs text-slate-500">{hostnameOf(p.portfolioUrl)}</span>
                          </div>
                        </Link>
                      </td>
                      <td className="hidden px-3 py-3 lg:table-cell">
                        <div className="flex flex-wrap gap-1">
                          {(p.technologies ?? []).slice(0, 3).map((t) => (
                            <span key={t} className="truncate rounded-md border border-white/5 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                              {t}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="hidden px-3 py-3 sm:table-cell">
                        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                          <span className={cn('h-2 w-2 flex-none rounded-full', getHealthColor(p.health))} />
                          {p.health === 'healthy' ? 'Healthy' : p.health === 'needs_attention' ? 'Attention' : p.health === 'down' ? 'Offline' : <>&mdash;</>}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-right">
                        <ScoreBadge score={p.score?.overallScore ?? 0} />
                      </td>
                      <td className="px-3 py-3 text-right text-sm text-slate-400">
                        {likeCounts.get(p.id) ?? 0}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-between gap-4">
          <span className="text-sm text-slate-500">
            Page {result.meta.page} of {Math.max(1, result.meta.totalPages)}
          </span>
          <div className="flex items-center gap-2">
            {page > 1 ? (
              <Link
                href={`/rankings?sort=${sortParam}&page=${page - 1}`}
                scroll={false}
                className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-[#3b82f6]/50 hover:text-white"
              >
                ← Previous
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-white/5 px-4 py-2 text-sm font-medium text-slate-600">
                ← Previous
              </span>
            )}
            {page < result.meta.totalPages ? (
              <Link
                href={`/rankings?sort=${sortParam}&page=${page + 1}`}
                scroll={false}
                className="shine rounded-lg bg-[#3b82f6] px-4 py-2 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-[#60a5fa]"
              >
                Next →
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-white/5 px-4 py-2 text-sm font-medium text-slate-600">
                Next →
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
