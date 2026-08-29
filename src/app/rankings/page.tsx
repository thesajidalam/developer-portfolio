import Link from 'next/link'
import type { Metadata } from 'next'
import { Avatar } from '@/components/PortfolioCard'
import { ScoreRing } from '@/components/ScoreRing'
import { ScoreBadge } from '@/components/ScoreBadge'
import { listPortfolios } from '@/lib/repository'
import { cn, getHealthColor, hostnameOf } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Rankings',
  description: 'The top-scoring developer portfolios in the DevFolio directory, ranked by a transparent six-dimension model.',
}

const PAGE_SIZE = 50

const MEDAL_STYLES: Record<number, { ring: string; badge: string; label: string }> = {
  1: {
    ring: 'border-amber-400/60 bg-gradient-to-br from-amber-500/10 to-transparent',
    badge: 'bg-amber-500/15 text-amber-300',
    label: 'Gold',
  },
  2: {
    ring: 'border-slate-300/50 bg-gradient-to-br from-slate-300/10 to-transparent',
    badge: 'bg-slate-300/15 text-slate-200',
    label: 'Silver',
  },
  3: {
    ring: 'border-amber-700/50 bg-gradient-to-br from-amber-700/10 to-transparent',
    badge: 'bg-amber-700/15 text-amber-400',
    label: 'Bronze',
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

  const result = await listPortfolios({ sort: 'score', page, pageSize: PAGE_SIZE })

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">Rankings</h1>
        <p className="mt-2 text-slate-400">
          {result.meta.total.toLocaleString()} portfolios, ranked by overall score.
        </p>
      </div>

      <ol className="space-y-2">
        {result.data.map((p, i) => {
          const rank = i + 1 + (page - 1) * PAGE_SIZE
          const medal = MEDAL_STYLES[rank]
          return (
            <li key={p.id}>
              <Link
                href={`/p/${p.slug}`}
                className={cn(
                  'flex items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:-translate-y-0.5 hover:border-indigo-500/50',
                  medal?.ring,
                )}
              >
                <div
                  className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold',
                    medal ? medal.badge : 'bg-slate-800 text-slate-400',
                  )}
                >
                  {rank}
                </div>
                <Avatar p={p} size="sm" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-semibold text-white">{p.name}</span>
                    {medal && (
                      <span className={cn('rounded-md px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide', medal.badge)}>
                        {medal.label}
                      </span>
                    )}
                  </div>
                  <span className="block truncate text-xs text-slate-500">{hostnameOf(p.portfolioUrl)}</span>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <span className={cn('h-2 w-2 rounded-full', getHealthColor(p.health))} />
                  {p.health === 'healthy' ? 'Healthy' : p.health === 'needs_attention' ? 'Attention' : p.health === 'down' ? 'Offline' : '—'}
                </span>
                <div className="flex shrink-0 items-center gap-3">
                  <ScoreRing score={p.score?.overallScore ?? 0} size={48} />
                  <span className="hidden md:block">
                    <ScoreBadge score={p.score?.overallScore ?? 0} />
                  </span>
                </div>
              </Link>
            </li>
          )
        })}
      </ol>

      <div className="mt-10 flex items-center justify-between gap-4">
        <span className="text-sm text-slate-500">
          Page {result.meta.page} of {Math.max(1, result.meta.totalPages)}
        </span>
        <div className="flex items-center gap-2">
          {page > 1 ? (
            <Link
              href={`/rankings?page=${page - 1}`}
              className="rounded-lg border border-slate-800 bg-slate-900/60 px-4 py-2 text-sm font-medium text-slate-300 transition-colors hover:border-indigo-500/50 hover:text-white"
            >
              Previous
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-lg border border-slate-800/60 px-4 py-2 text-sm font-medium text-slate-600">
              Previous
            </span>
          )}
          {page < result.meta.totalPages ? (
            <Link
              href={`/rankings?page=${page + 1}`}
              className="rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03]"
            >
              Next
            </Link>
          ) : (
            <span className="cursor-not-allowed rounded-lg border border-slate-800/60 px-4 py-2 text-sm font-medium text-slate-600">
              Next
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
