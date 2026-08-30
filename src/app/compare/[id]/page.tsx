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
            className="shine animate-hero delay-2 mt-8 inline-block rounded-xl border border-white/10 bg-white/[0.03] px-5 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-indigo-500/50 hover:text-white"
          >
            Back to compare
          </Link>
        </div>
      </div>
    )
  }

  const rows: DimensionRow[] = [...DIMENSIONS, OVERALL]

  return (
    <div className="relative overflow-hidden">
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="animate-hero mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Comparison</h1>
            <p className="mt-2 text-slate-400">
              Side-by-side scores for {portfolios.length} portfolios. The highest value per row is highlighted.
            </p>
          </div>
          <Link
            href="/compare"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-indigo-500/50 hover:text-white"
          >
            Back to compare
          </Link>
        </div>

        <div className="animate-hero delay-1 overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.03] shadow-2xl shadow-indigo-500/5 backdrop-blur-xl">
          <table className="w-full min-w-max">
            <thead>
              <tr>
                <th className="p-5 text-left text-xs font-medium uppercase tracking-wide text-slate-500">Dimension</th>
                {portfolios.map((p) => (
                  <th key={p.id} className="px-5 py-6 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Avatar p={p} size="lg" />
                      <div className="text-sm font-semibold text-white">{p.name}</div>
                      <div className="text-xs text-slate-500">{hostnameOf(p.portfolioUrl)}</div>
                      <ScoreRing score={p.score?.overallScore ?? 0} size={64} label="overall" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const values = portfolios.map((p) => row.value(p))
                const max = Math.max(...values)
                const bestIndex = values.indexOf(max)
                return (
                  <tr key={row.key} className="border-t border-white/5">
                    <th
                      scope="row"
                      className={cn(
                        'w-44 p-5 text-left text-sm font-semibold',
                        row.key === 'overall' ? 'text-indigo-300' : 'text-slate-300',
                      )}
                    >
                      {row.label}
                    </th>
                    {portfolios.map((p, i) => {
                      const v = row.value(p)
                      const isBest = i === bestIndex
                      return (
                        <td key={p.id} className="px-5 py-4">
                          <div className="mx-auto w-36">
                            <ScoreBar label={isBest ? '★ Best' : ''} value={v} color={isBest ? 'text-emerald-400' : undefined} />
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}