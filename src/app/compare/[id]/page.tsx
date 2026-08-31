import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Avatar } from '@/components/PortfolioCard'
import { ScoreRing } from '@/components/ScoreRing'
import { ScoreBar } from '@/components/ScoreBadge'
import { getComparison, getPortfolioById } from '@/lib/repository'
import type { PortfolioWithScore } from '@/lib/types'
import { cn, hostnameOf } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type DimensionRow = { key: string; label: string; value: (p: PortfolioWithScore) => number }

const DIMENSIONS: DimensionRow[] = [
  { key: 'performance', label: 'Performance', value: (p) => p.score?.performanceScore ?? 0 },
  { key: 'accessibility', label: 'Accessibility', value: (p) => p.score?.accessibilityScore ?? 0 },
  { key: 'seo', label: 'SEO', value: (p) => p.score?.seoScore ?? 0 },
  { key: 'best-practices', label: 'Best Practices', value: (p) => p.score?.bestPracticesScore ?? 0 },
  { key: 'design', label: 'Design', value: (p) => p.score?.designScore ?? 0 },
  { key: 'content', label: 'Content', value: (p) => p.score?.contentScore ?? 0 },
]

const OVERALL: DimensionRow = { key: 'overall', label: 'Overall', value: (p) => p.score?.overallScore ?? 0 }

export default async function CompareDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const ids = await getComparison(id)
  if (!ids) notFound()

  const portfolios = (
    await Promise.all(ids.map((pid) => getPortfolioById(pid).catch(() => null)))
  ).filter((p): p is PortfolioWithScore => p !== null)

  if (portfolios.length < 2) {
    return (
      <div className="relative overflow-hidden">
        <div className="bg-aurora pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
          <h1 className="animate-hero text-3xl font-bold text-white">Not enough portfolios</h1>
          <p className="animate-hero delay-1 mt-3 text-slate-400">This comparison needs at least two portfolios to render a table.</p>
          <Link
            href="/compare"
            className="shine animate-hero delay-2 mt-8 inline-block rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-violet-500/50 hover:text-white"
          >
            Back to compare
          </Link>
        </div>
      </div>
    )
  }

  const rows: DimensionRow[] = [...DIMENSIONS, OVERALL]

  const overallValues = portfolios.map((p) => OVERALL.value(p))
  const maxOverall = Math.max(...overallValues)
  const overallWinnerIdx = overallValues.indexOf(maxOverall)
  const overallWinner = portfolios[overallWinnerIdx]

  return (
    <div className="relative overflow-hidden">
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="animate-hero mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Comparison</h1>
            <p className="mt-2 text-slate-400">
              Side-by-side scores for {portfolios.length} portfolios.
            </p>
          </div>
          <Link
            href="/compare"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-violet-500/50 hover:text-white"
          >
            Back to compare
          </Link>
        </div>

        <div className="animate-hero delay-1 mb-8 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center shadow-xl shadow-emerald-500/10 backdrop-blur-xl">
          <span className="text-3xl">🏆</span>
          <h2 className="mt-2 text-xl font-bold text-white">
            Winner: <span className="text-emerald-400">{overallWinner.name}</span> with{' '}
            <span className="text-emerald-400">{Math.round(maxOverall)}</span>/100
          </h2>
          <p className="mt-1 text-sm text-slate-400">{hostnameOf(overallWinner.portfolioUrl)}</p>
        </div>

        <div className="animate-hero delay-2 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {portfolios.map((p, pi) => {
            const isOverallWinner = pi === overallWinnerIdx
            return (
              <div
                key={p.id}
                className={cn(
                  'rounded-2xl border bg-white/[0.03] p-5 backdrop-blur-xl transition-all',
                  isOverallWinner
                    ? 'border-emerald-500/40 shadow-xl shadow-emerald-500/10'
                    : 'border-white/10 shadow-2xl shadow-violet-500/5',
                )}
              >
                <div className="mb-4 flex items-center gap-3">
                  <Avatar p={p} size="lg" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="truncate font-semibold text-white">{p.name}</h3>
                      {isOverallWinner && (
                        <span className="rounded-md bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-300">
                          Winner
                        </span>
                      )}
                    </div>
                    <p className="truncate text-xs text-slate-500">{hostnameOf(p.portfolioUrl)}</p>
                  </div>
                </div>

                <div className="mb-4 flex justify-center">
                  <ScoreRing score={p.score?.overallScore ?? 0} size={80} label="overall" />
                </div>

                <div className="space-y-3">
                  {rows.filter((r) => r.key !== 'overall').map((row) => {
                    const values = portfolios.map((pp) => row.value(pp))
                    const max = Math.max(...values)
                    const v = row.value(p)
                    const isBest = v === max && values.filter((x) => x === max).length === 1
                    return (
                      <div key={row.key}>
                        <ScoreBar
                          label={isBest ? `★ ${row.label}` : row.label}
                          value={v}
                          color={isBest ? 'text-emerald-400' : undefined}
                        />
                      </div>
                    )
                  })}
                </div>

                {(p.technologies ?? []).length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/5 pt-4">
                    {p.technologies.slice(0, 5).map((t) => (
                      <span key={t} className="rounded-md border border-white/5 bg-white/[0.04] px-2 py-0.5 text-[10px] font-medium text-slate-400">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
