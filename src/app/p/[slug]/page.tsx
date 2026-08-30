import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Avatar, PortfolioCard } from '@/components/PortfolioCard'
import { ScoreRing } from '@/components/ScoreRing'
import { ScoreBar } from '@/components/ScoreBadge'
import { getPortfolioBySlug, getSimilar } from '@/lib/repository'
import { getScoreBreakdown, scoreLabel } from '@/lib/scoring'
import { cn, getHealthColor, getHealthLabel, hostnameOf } from '@/lib/utils'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const p = await getPortfolioBySlug(slug)
  if (!p) return {}
  const title = `${p.name} — ${hostnameOf(p.portfolioUrl)}`
  const score = p.score?.overallScore != null ? ` — scored ${Math.round(p.score.overallScore)}/100` : ''
  const description = p.description
    ? `${p.description}${score}.`
    : `View ${p.name}\u2019s developer portfolio${score}.`
  return {
    title,
    description: description.slice(0, 200),
    openGraph: {
      title: `${title}${score}`,
      description: description.slice(0, 180),
      url: `/p/${slug}`,
    },
  }
}

export default async function PortfolioDetailPage({ params }: Props) {
  const { slug } = await params
  const p = await getPortfolioBySlug(slug)
  if (!p) notFound()

  const similar = await getSimilar(p, 6)
  const overall = p.score?.overallScore ?? 0
  const breakdown = p.score ? getScoreBreakdown(p.score) : []
  const label = scoreLabel(overall)

  return (
    <div className="relative overflow-hidden">
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="animate-hero mb-8">
          <Link
            href="/"
            className="text-sm font-medium text-slate-400 transition-colors hover:text-white"
          >
            ← Back to gallery
          </Link>
        </div>

        <header className="animate-hero delay-1 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-5">
            <Avatar p={p} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">{p.name}</h1>
                {p.verified && (
                  <span title="Verified" className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-xs font-medium text-indigo-300">
                    ✓ Verified
                  </span>
                )}
                {p.featured && (
                  <span title="Featured" className="rounded-md bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-300">
                    ★ Featured
                  </span>
                )}
              </div>
              {p.title && <p className="mt-1 text-lg text-slate-300">{p.title}</p>}
              <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
                <span>{hostnameOf(p.portfolioUrl)}</span>
                <span className={cn('h-2 w-2 rounded-full', getHealthColor(p.health))} />
                <span>{getHealthLabel(p.health)}</span>
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-6">
            <ScoreRing score={overall} size={140} label="Overall" />
            <div className="space-y-2">
              <span className={cn('block text-2xl font-bold', label.color)}>{label.label}</span>
              <div className="flex flex-col gap-2">
                <a
                  href={p.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shine inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
                >
                  Visit site ↗
                </a>
                {p.githubUrl && (
                  <a
                    href={p.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-indigo-500/50 hover:bg-white/[0.06] hover:text-white"
                  >
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {p.description && <p className="mt-6 text-base text-slate-300">{p.description}</p>}

        <div className="mt-6 flex flex-wrap gap-1.5">
          {p.technologies.map((t) => (
            <span key={t} className="rounded-md bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-300">
              {t}
            </span>
          ))}
          {p.categories.map((c) => (
            <span key={c} className="rounded-md bg-indigo-500/10 px-2.5 py-1 text-xs font-medium text-indigo-300">
              {c}
            </span>
          ))}
        </div>

        {p.location && <p className="mt-4 text-sm text-slate-500">📍 {p.location}</p>}
      </header>

      <section className="animate-hero delay-3 mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl sm:p-8">
        <h2 className="text-xl font-bold text-white">Score breakdown</h2>
        <p className="mt-1 text-sm text-slate-500">Six dimensions, weighted to produce the overall score.</p>
        <div className="mt-6 grid grid-cols-1 gap-x-10 gap-y-5 md:grid-cols-2">
          {breakdown.map((dim) => (
            <div key={dim.key}>
              <div className="mb-1 flex items-center justify-between">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  {dim.name}
                  {!dim.automated && <span className="ml-2 text-[10px] text-slate-600">manual</span>}
                </span>
              </div>
              <ScoreBar label="" value={dim.score} color={cn(dim.score >= 90 ? 'text-emerald-500' : dim.score >= 70 ? 'text-yellow-500' : dim.score >= 50 ? 'text-orange-500' : 'text-red-500')} />
              <p className="mt-1 text-xs text-slate-600">{dim.description}</p>
            </div>
          ))}
        </div>
      </section>

      {similar.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-white">Similar portfolios</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((s) => (
              <PortfolioCard key={s.id} p={s} />
            ))}
          </div>
        </section>
      )}
      </div>
    </div>
  )
}
