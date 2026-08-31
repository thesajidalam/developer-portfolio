import Link from 'next/link'
import type { Metadata } from 'next'
import { Avatar } from '@/components/PortfolioCard'
import { ScoreRing } from '@/components/ScoreRing'
import { ScoreBadge } from '@/components/ScoreBadge'
import { listPortfolios, topLiked, portfolioLikeCounts } from '@/lib/repository'
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

const MEDAL_STYLES: Record<number, { ring: string; badge: string; label: string; emoji: string; glow: string }> = {
  1: {
    ring: 'border-amber-400/60 bg-gradient-to-br from-amber-500/10 to-transparent',
    badge: 'bg-amber-500/15 text-amber-300',
    label: 'Gold',
    emoji: 'ðŸ¥‡',
    glow: 'shadow-amber-500/20',
  },
  2: {
    ring: 'border-slate-300/50 bg-gradient-to-br from-slate-300/10 to-transparent',
    badge: 'bg-slate-300/15 text-slate-200',
    label: 'Silver',
    emoji: 'ðŸ¥ˆ',
    glow: 'shadow-slate-300/15',
  },
  3: {
    ring: 'border-amber-700/50 bg-gradient-to-br from-amber-700/10 to-transparent',
    badge: 'bg-amber-700/15 text-amber-400',
    label: 'Bronze',
    emoji: 'ðŸ¥‰',
    glow: 'shadow-amber-700/15',
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

  const top3 = result.data.slice(0, 3)
  const rest = result.data.slice(3)

  return (
    <div className="relative overflow-hidden">
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="animate-hero mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white">Rankings</h1>
          <p className="mt-2 text-slate-400">
            {result.meta.total.toLocaleString()} portfolios, ranked and sorted.
          </p>
        </div>

        <div className="animate-hero mb-8 flex gap-2">
          {SORT_TABS.map((tab) => {
            const isActive = sortParam === tab.key
            return (
              <Link
                key={tab.key}
                href={`/rankings?sort=${tab.key}${page > 1 ? `&page=${page}` : ''}`}
                scroll={false}
                className={cn(
                  'rounded-full border px-4 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'border-violet-500/60 bg-violet-500/15 text-violet-300 shadow-lg shadow-violet-500/10'
                    : 'border-white/10 bg-white/[0.03] text-slate-400 hover:border-violet-500/40 hover:bg-white/[0.05] hover:text-white',
                )}
              >
                {tab.label}
              </Link>
            )
          })}
        </div>

        {top3.length > 0 && (
          <div className="animate-hero mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {top3.map((p, i) => {
              const rank = i + 1
              const medal = MEDAL_STYLES[rank]
              return (
                <Link
                  key={p.id}
                  href={`/p/${p.slug}`}
                  className={cn(
                    'group relative flex flex-col items-center rounded-2xl border p-6 text-center backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
                    medal?.ring,
                    medal?.glow,
                  )}
                >
                  <span className="mb-3 text-3xl">{medal?.emoji}</span>
                  <span className={cn('mb-3 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', medal?.badge)}>
                    {medal?.label}
                  </span>
                  <Avatar p={p} size="lg" />
                  <h3 className="mt-3 truncate font-semibold text-white group-hover:text-violet-300">{p.name}</h3>
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
          </div>
        )}

        <div className="animate-hero overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-violet-500/5 backdrop-blur-xl">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">#</th>
                <th className="px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500">Portfolio</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500 sm:table-cell">Stack</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-medium uppercase tracking-wide text-slate-500 md:table-cell">Health</th>
                <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">Score</th>
                <th className="px-5 py-3 text-right text-[11px] font-medium uppercase tracking-wide text-slate-500">Likes</th>
              </tr>
            </thead>
            <tbody>
              {rest.map((p, i) => {
                const rank = i + 4 + (page - 1) * PAGE_SIZE
                return (
                  <tr key={p.id} className="border-t border-white/5 transition-colors hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-sm text-slate-500">{rank}</td>
                    <td className="px-5 py-3">
                      <Link href={`/p/${p.slug}`} className="flex items-center gap-3">
                        <Avatar p={p} size="sm" />
                        <div className="min-w-0">
                          <span className="truncate font-medium text-white hover:text-violet-300">{p.name}</span>
                          <span className="ml-2 hidden text-xs text-slate-500 sm:inline">{hostnameOf(p.portfolioUrl)}</span>
                        </div>
                      </Link>
                    </td>
                    <td className="hidden px-5 py-3 sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {(p.technologies ?? []).slice(0, 3).map((t) => (
                          <span key={t} className="rounded-md border border-white/5 bg-white/[0.04] px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="hidden px-5 py-3 md:table-cell">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <span className={cn('h-2 w-2 rounded-full', getHealthColor(p.health))} />
                        {p.health === 'healthy' ? 'Healthy' : p.health === 'needs_attention' ? 'Attention' : p.health === 'down' ? 'Offline' : 'â€”'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <ScoreBadge score={p.score?.overallScore ?? 0} />
                    </td>
                    <td className="px-5 py-3 text-right text-sm text-slate-400">
                      {likeCounts.get(p.id) ?? 0}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
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
                className="rounded-lg border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-violet-500/50 hover:text-white"
              >
                â† Previous
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-white/5 px-4 py-2 text-sm font-medium text-slate-600">
                â† Previous
              </span>
            )}
            {page < result.meta.totalPages ? (
              <Link
                href={`/rankings?sort=${sortParam}&page=${page + 1}`}
                scroll={false}
                className="shine rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-violet-500/40 active:scale-95"
              >
                Next â†’
              </Link>
            ) : (
              <span className="cursor-not-allowed rounded-lg border border-white/5 px-4 py-2 text-sm font-medium text-slate-600">
                Next â†’
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
