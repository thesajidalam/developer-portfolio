import Link from 'next/link'
import type { PortfolioWithScore } from '@/lib/types'
import { ScoreBadge } from '@/components/ScoreBadge'
import { cn, getHealthColor, hostnameOf, initials } from '@/lib/utils'

export function Avatar({ p, size = 'md' }: { p: PortfolioWithScore; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'h-16 w-16 text-xl' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-11 w-11 text-sm'
  if (p.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.avatarUrl} alt={p.name} className={cn(cls, 'rounded-full object-cover ring-1 ring-slate-800')} referrerPolicy="no-referrer" />
  }
  return (
    <div className={cn(cls, 'flex items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-sky-500 font-bold text-white ring-1 ring-slate-800')}>
      {initials(p.name)}
    </div>
  )
}

export function PortfolioCard({ p, className }: { p: PortfolioWithScore; className?: string }) {
  return (
    <Link
      href={`/p/${p.slug}`}
      className={cn(
        'group flex flex-col rounded-2xl border border-slate-800 bg-slate-900/60 p-4 transition-all hover:-translate-y-1 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/10',
        className,
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar p={p} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-semibold text-white group-hover:text-indigo-300">{p.name}</h3>
              {p.verified && (
                <span aria-label="verified" className="text-indigo-400" title="Verified">
                  ✓
                </span>
              )}
              {p.featured && (
                <span aria-label="featured" className="text-amber-400" title="Featured">
                  ★
                </span>
              )}
            </div>
            <p className="truncate text-xs text-slate-500">{hostnameOf(p.portfolioUrl)}</p>
          </div>
        </div>
        {p.score ? <ScoreBadge score={p.score.overallScore} /> : <ScoreBadge score={0} />}
      </div>

      {p.description ? (
        <p className="mt-3 line-clamp-2 text-sm text-slate-400">{p.description}</p>
      ) : (
        p.title && <p className="mt-3 line-clamp-2 text-sm text-slate-400">{p.title}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(p.technologies ?? []).slice(0, 4).map((t) => (
          <span key={t} className="rounded-md bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {t}
          </span>
        ))}
        {(p.categories ?? []).slice(0, 2).map((c) => (
          <span key={c} className="rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
            {c}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-800/60 pt-3">
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
          <span className={cn('h-2 w-2 rounded-full', getHealthColor(p.health))} />
          {p.health === 'healthy' ? 'Healthy' : p.health === 'needs_attention' ? 'Attention' : p.health === 'down' ? 'Offline' : '—'}
        </span>
        <span className="text-xs font-medium text-indigo-300 opacity-0 transition-opacity group-hover:opacity-100">{p.experienceLevel}</span>
      </div>
    </Link>
  )
}
