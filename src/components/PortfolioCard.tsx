'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowUpRight, BadgeCheck, Bookmark, Heart, Link2, Star } from 'lucide-react'
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

const ghostBtn =
  'inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-colors hover:border-[#3b82f6]/40 hover:bg-white/[0.06] hover:text-white'

export function Avatar({ p, size = 'md' }: { p: PortfolioWithScore; size?: 'sm' | 'md' | 'lg' }) {
  const cls = size === 'lg' ? 'h-16 w-16 text-xl' : size === 'sm' ? 'h-8 w-8 text-xs' : 'h-11 w-11 text-sm'
  if (p.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={p.avatarUrl} alt={p.name} className={cn(cls, 'rounded-full object-cover ring-1 ring-slate-800')} referrerPolicy="no-referrer" />
  }
  return (
    <div className={cn(cls, 'flex items-center justify-center rounded-full bg-[#3b82f6]/20 font-semibold text-[#d9e4f7] ring-1 ring-[#3b82f6]/30')}>
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
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
        liked
          ? 'border-[#3b82f6]/50 bg-[#3b82f6]/15 text-[#d9e4f7]'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-[#3b82f6]/40 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      <Heart
        aria-hidden
        className={cn('h-3.5 w-3.5 transition-transform duration-200', liked && 'scale-110 fill-current')}
      />
      <span>Like{votes > 0 ? ` · ${votes}` : ''}</span>
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
      <button type="button" onClick={share} aria-label="Copy link to this portfolio" title="Copy link" className={ghostBtn}>
        <Link2 className="h-3.5 w-3.5" aria-hidden />
      </button>
      {copied && (
        <span className="absolute left-1/2 top-full z-20 mt-1.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-[#10b981]/90 px-2 py-1 text-[10px] font-semibold text-white shadow-lg">
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
        'inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-colors',
        saved
          ? 'border-rose-500/50 bg-rose-500/15 text-rose-300'
          : 'border-white/10 bg-white/[0.03] text-slate-300 hover:border-rose-500/40 hover:bg-white/[0.06] hover:text-white',
      )}
    >
      <Bookmark aria-hidden className={cn('h-3.5 w-3.5 transition-transform duration-200', saved && 'fill-current')} />
    </button>
  )
}

export function PortfolioCard({ p, likeCount = 0, className }: { p: PortfolioWithScore; likeCount?: number; className?: string }) {
  return (
    <div
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#101c2d] p-4 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-[#3b82f6]/40 hover:bg-[#18283d]',
        className,
      )}
    >
      <Link href={`/p/${p.slug}`} className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Avatar p={p} />
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate font-semibold text-[#f8fafc] group-hover:text-[#d9e4f7]">{p.name}</h3>
              {p.verified && (
                <BadgeCheck aria-label="Verified" className="h-4 w-4 shrink-0 text-[#38bdf8]" />
              )}
              {p.featured && (
                <Star aria-label="Featured" className="h-3.5 w-3.5 fill-current text-amber-400" />
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
          <span key={t} className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-0.5 text-[11px] font-medium text-slate-300">
            {t}
          </span>
        ))}
        {(p.categories ?? []).slice(0, 2).map((c) => (
          <span key={c} className="rounded-md border border-[#3b82f6]/25 bg-[#3b82f6]/10 px-2 py-0.5 text-[11px] font-medium text-[#d9e4f7]">
            {c}
          </span>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-2 border-t border-white/[0.06] pt-3">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
            <span className={cn('h-2 w-2 rounded-full', getHealthColor(p.health))} />
            {p.health === 'healthy' ? 'Healthy' : p.health === 'needs_attention' ? 'Attention' : p.health === 'down' ? 'Offline' : '—'}
          </span>
          <span className="text-xs font-medium text-[#7dd3fc]">{p.experienceLevel}</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <LikeButton p={p} likeCount={likeCount} />
          <BookmarkButton p={p} />
          <ShareButton p={p} />
          <a
            href={absoluteUrl(p.portfolioUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              ghostBtn,
              'inline-flex shrink-0 items-center gap-1 border-[#3b82f6]/30 bg-[#3b82f6]/10 text-[#d9e4f7] hover:border-[#3b82f6]/50 hover:bg-[#3b82f6]/20 hover:text-white',
            )}
          >
            Visit site <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
          </a>
        </div>
      </div>
    </div>
  )
}