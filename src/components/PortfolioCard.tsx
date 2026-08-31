'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PortfolioWithScore } from '@/lib/types'
import { ScoreBadge } from '@/components/ScoreBadge'
import { absoluteUrl, cn, getHealthColor, hostnameOf, initials } from '@/lib/utils'

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

function LikeButton({ p }: { p: PortfolioWithScore }) {
  const [votes, setVotes] = useState(0)
  const [liked, setLiked] = useState(false)
  const [busy, setBusy] = useState(false)

  async function like() {
    if (busy || liked) return
    setBusy(true)
    try {
      const res = await fetch('/api/v1/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ portfolioId: p.id, value: 1 }),
      })
      if (!res.ok) return
      const j = (await res.json()) as { data?: { total?: number } }
      setVotes(j.data?.total ?? votes + 1)
      setLiked(true)
    } catch {
      // ignore network errors
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={like}
      aria-label={liked ? 'Liked' : 'Like this portfolio'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
        liked
          ? 'border-indigo-500/50 bg-indigo-500/15 text-indigo-300'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-indigo-500/50 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      <span aria-hidden className={cn('text-sm leading-none transition-transform duration-200', liked && 'animate-bounce')}>{liked ? '♥' : '♡'}</span>
      <span>Like{votes > 0 ? ` · ${votes}` : ''}</span>
    </button>
  )
}

export function PortfolioCard({ p, className }: { p: PortfolioWithScore; className?: string }) {
  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/70 p-4 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-indigo-500/40 hover:shadow-2xl hover:shadow-indigo-500/15',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 -top-16 h-24 rounded-full bg-indigo-500/0 blur-2xl transition-all duration-500 group-hover:bg-indigo-500/15" />
      <Link href={`/p/${p.slug}`} className="flex min-w-0 items-start justify-between gap-3">
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
      </Link>

      {p.description ? (
        <p className="mt-3 line-clamp-2 text-sm text-slate-400">{p.description}</p>
      ) : (
        p.title && <p className="mt-3 line-clamp-2 text-sm text-slate-400">{p.title}</p>
      )}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {(p.technologies ?? []).slice(0, 4).map((t) => (
          <span key={t} className="rounded-md border border-white/5 bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {t}
          </span>
        ))}
        {(p.categories ?? []).slice(0, 2).map((c) => (
          <span key={c} className="rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-300">
            {c}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <span className={cn('h-2 w-2 rounded-full', getHealthColor(p.health))} />
            {p.health === 'healthy' ? 'Healthy' : p.health === 'needs_attention' ? 'Attention' : p.health === 'down' ? 'Offline' : '—'}
          </span>
          <span className="text-xs font-medium text-indigo-300">{p.experienceLevel}</span>
        </div>
        <div className="flex items-center gap-2">
          <LikeButton p={p} />
          <a
            href={absoluteUrl(p.portfolioUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-indigo-300 transition-all duration-200 hover:border-indigo-500/50 hover:bg-white/[0.06] hover:text-white"
          >
            Visit site <span aria-hidden>↗</span>
          </a>
        </div>
      </div>
    </div>
  )
}
