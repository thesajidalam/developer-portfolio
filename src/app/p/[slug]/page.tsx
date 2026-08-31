import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Avatar, PortfolioCard } from '@/components/PortfolioCard'
import { ScoreRing } from '@/components/ScoreRing'
import { ScoreBar } from '@/components/ScoreBadge'
import { getPortfolioBySlug, getSimilar } from '@/lib/repository'
import { getScoreBreakdown, scoreLabel } from '@/lib/scoring'
import { ShareScore } from '@/components/ShareScore'
import { EmbedBadge } from '@/components/EmbedBadge'
import { absoluteUrl, cn, getHealthColor, getHealthLabel, hostnameOf } from '@/lib/utils'

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

  // The owner of DevFolio: a subtle premium/golden treatment so the person who
  // built the site stands out from the crowd.
  const isOwner = p.githubUrl === 'https://github.com/thesajidalam'
  const ownerGitHub = p.githubUrl?.replace(/^https:\/\/github\.com\//, '@')

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

        <header
          className={cn(
            'animate-hero delay-1 relative overflow-hidden rounded-2xl border p-6 backdrop-blur-xl sm:p-8',
            isOwner
              ? 'border-amber-400/30 bg-gradient-to-br from-[#151021] to-[#0c0e18] shadow-2xl shadow-amber-500/10'
              : 'border-white/10 bg-white/[0.03] shadow-2xl shadow-indigo-500/5',
          )}
        >
        {isOwner && (
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl" />
        )}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex min-w-0 items-start gap-5">
            <Avatar p={p} size="lg" />
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-3xl font-bold tracking-tight text-white">{p.name}</h1>
                {isOwner && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/15 px-2 py-0.5 text-xs font-semibold text-amber-200 ring-1 ring-amber-400/40">
                    <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 01.894.553l1.8 3.647 4.02.584a1 1 0 01.553 1.706l-2.91 2.837.687 4.004a1 1 0 01-1.45 1.054L10 14.71l-3.594 1.89a1 1 0 01-1.45-1.054l.687-4.004-2.91-2.837a1 1 0 01.553-1.706l4.02-.584 1.8-3.647A1 1 0 0110 2z" clipRule="evenodd" />
                    </svg>
                    Admin · Site creator
                  </span>
                )}
                {p.verified && (
                  <span
                    className={cn(
                      'rounded-md px-2 py-0.5 text-xs font-medium',
                      isOwner ? 'bg-amber-400/15 text-amber-200' : 'bg-indigo-500/10 text-indigo-300',
                    )}
                  >
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
            <div className={cn('relative inline-flex rounded-2xl p-[1.5px]', isOwner && 'bg-gradient-to-br from-amber-300/60 to-amber-600/40')}>
              <ScoreRing score={overall} size={140} label="Overall" />
            </div>
            <div className="space-y-2">
              <span className={cn('block text-2xl font-bold', label.color, isOwner && 'text-amber-200')}>{label.label}</span>
              <div className="flex flex-col gap-2">
                <a
                  href={absoluteUrl(p.portfolioUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    'shine inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-lg transition-all hover:scale-[1.03] hover:shadow-xl active:scale-95',
                    isOwner
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600 shadow-amber-500/30 hover:shadow-amber-500/50'
                      : 'bg-gradient-to-r from-indigo-500 to-sky-500 shadow-indigo-500/30 hover:shadow-indigo-500/40',
                  )}
                >
                  Visit site ↗
                </a>
                {p.githubUrl && (
                  <a
                    href={absoluteUrl(p.githubUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'inline-flex items-center justify-center gap-1.5 rounded-xl border px-4 py-2 text-sm font-medium transition-all hover:bg-white/[0.06]',
                      isOwner
                        ? 'border-amber-400/40 bg-amber-400/10 text-amber-200 hover:border-amber-400/70'
                        : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-indigo-500/50 hover:text-white',
                    )}
                  >
                    GitHub {ownerGitHub && <span className={cn(isOwner ? 'text-amber-100' : 'text-slate-500')}>{ownerGitHub}</span>}
                  </a>
                )}
                <ShareScore
                  score={overall}
                  portfolioName={p.name}
                  portfolioUrl={p.portfolioUrl}
                  pageUrl={`https://gitdevfolio.vercel.app/p/${p.slug}`}
                  compact
                />
                <EmbedBadge slug={p.slug} />
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
