'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { PortfolioWithScore } from '@/lib/types'
import { ScoreBadge } from '@/components/ScoreBadge'
import { absoluteUrl, cn, getHealthColor, hostnameOf, initials } from '@/lib/utils'

const BOOKMARKS_KEY = 'devfolio_bookmarks'

function loadBookmarks(): Set<string> {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY)
    if (!raw) return new Set()
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) return new Set(parsed.map(String))
    if (parsed && typeof parsed === 'object' && typeof (parsed as { values?: unknown }).values === 'object') {
      const vals = (parsed as { values?: ArrayLike<unknown> }).values
      if (vals && typeof vals === 'object') return new Set(Array.from(vals as ArrayLike<unknown>, String))
    }
    return new Set()
  } catch {
    return new Set()
  }
}

function saveBookmarks(set: Set<string>): void {
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify([...set]))
  } catch {
    // ignore storage errors
  }
}

export function Avatar({ p, size = 'md' }: { p: PortfolioWithScore; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'h-16 w-16 text-xl' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-11 w-11 text-sm'
  if (p.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.avatarUrl} alt={p.name} className={cn(cls, 'rounded-full object-cover ring-1 ring-slate-800')} referrerPolicy="no-referrer" />
  }
  return (
    <div className={cn(cls, 'flex items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white ring-1 ring-slate-800')}>
      {initials(p.name)}
    </div>
  )
}

function LikeButton({ p, likeCount = 0 }: { p: PortfolioWithScore; likeCount?: number }) {
  const [votes, setVotes] = useState(likeCount)
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
          ? 'border-violet-500/50 bg-violet-500/15 text-violet-300'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-violet-500/50 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      <span aria-hidden className={cn('text-sm leading-none transition-transform duration-200', liked && 'animate-bounce')}>{liked ? 'â™¥' : 'â™¡'}</span>
      <span>Like{votes > 0 ? ` Â· ${votes}` : ''}</span>
    </button>
  )
}

function ShareButton({ p }: { p: PortfolioWithScore }) {
  const [copied, setCopied] = useState(false)

  async function share() {
    try {
      const url = `${window.location.origin}/p/${p.slug}`
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // ignore clipboard errors
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={share}
        aria-label="Copy link to this portfolio"
        title="Copy link"
        className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all duration-200 hover:hover:border-violet-500/50 hover:bg-white/[0.06] hover:text-white"
      >
        <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5zM5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 100-2H5z" />
        </svg>
      </button>
      {copied && (
        <span className="absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-emerald-500/90 px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
          Copied!
        </span>
      )}
    </div>
  )
}

function BookmarkButton({ p }: { p: PortfolioWithScore }) {
  const [saved, setSaved] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false
    return loadBookmarks().has(p.id)
  })

  function toggle() {
    setSaved((prev) => {
      const next = !prev
      const set = loadBookmarks()
      if (next) set.add(p.id)
      else set.delete(p.id)
      saveBookmarks(set)
      return next
    })
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={saved ? 'Remove from saved' : 'Save portfolio'}
      title={saved ? 'Remove from saved' : 'Save portfolio'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200',
        saved
          ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-rose-500/50 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      <svg aria-hidden viewBox="0 0 20 20" fill="currentColor" className={cn('h-3.5 w-3.5 transition-transform', saved && 'animate-bounce')}>
        <path
          fillRule="evenodd"
          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          clipRule="evenodd"
        />
      </svg>
    </button>
  )
}

export function PortfolioCard({ p, likeCount = 0, className }: { p: PortfolioWithScore; likeCount?: number; className?: string }) {
  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0b1020]/70 p-4 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:border-violet-500/40 hover:shadow-2xl hover:shadow-violet-500/15',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-8 -top-16 h-24 rounded-full bg-violet-500/0 blur-2xl transition-all duration-500 group-hover:bg-violet-500/15" />
      <Link href={`/p/${p.slug}`} className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar p={p} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-semibold text-white group-hover:text-violet-300">{p.name}</h3>
              {p.verified && (
                <span aria-label="verified" className="text-violet-400" title="Verified">
                  âœ“
                </span>
              )}
              {p.featured && (
                <span aria-label="featured" className="text-amber-400" title="Featured">
                  â˜…
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
          <span key={c} className="rounded-md border border-violet-500/20 bg-violet-500/10 px-2 py-0.5 text-[11px] font-medium text-violet-300">
            {c}
          </span>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <span className={cn('h-2 w-2 rounded-full', getHealthColor(p.health))} />
            {p.health === 'healthy' ? 'Healthy' : p.health === 'needs_attention' ? 'Attention' : p.health === 'down' ? 'Offline' : 'â€”'}
          </span>
          <span className="text-xs font-medium text-violet-300">{p.experienceLevel}</span>
        </div>
        <div className="flex items-center gap-2">
          <LikeButton p={p} likeCount={likeCount} />
          <BookmarkButton p={p} />
          <ShareButton p={p} />
          <a
            href={absoluteUrl(p.portfolioUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-violet-300 transition-all duration-200 hover:border-violet-500/50 hover:bg-white/[0.06] hover:text-white"
          >
            Visit site <span aria-hidden>â†—</span>
          </a>
        </div>
      </div>
    </div>
  )
}
