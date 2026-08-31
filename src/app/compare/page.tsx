'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import type { PortfolioWithScore } from '@/lib/types'
import { Avatar } from '@/components/PortfolioCard'
import { ScoreBadge } from '@/components/ScoreBadge'
import { cn, hostnameOf } from '@/lib/utils'

const MIN = 2
const MAX = 5
const DEBOUNCE_MS = 300

export default function ComparePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PortfolioWithScore[]>([])
  const [selected, setSelected] = useState<PortfolioWithScore[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [quickPicks, setQuickPicks] = useState<PortfolioWithScore[]>([])

  useEffect(() => {
    fetch('/api/v1/portfolios?sort=score&pageSize=5')
      .then((r) => r.json())
      .then((d: { data?: PortfolioWithScore[] }) => { if (d.data) setQuickPicks(d.data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const q = query.trim()
    if (!q) {
      setResults([])
      setSearched(false)
      setSearching(false)
      return
    }
    setSearching(true)
    setSearched(false)
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`)
        if (!res.ok) throw new Error('Search failed')
        const data = (await res.json()) as { data: PortfolioWithScore[] }
        setResults(data.data)
      } catch {
        setResults([])
      } finally {
        setSearching(false)
        setSearched(true)
      }
    }, DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  function toggleSelect(p: PortfolioWithScore) {
    setError(null)
    setSelected((curr) => {
      const exists = curr.some((c) => c.id === p.id)
      if (exists) return curr.filter((c) => c.id !== p.id)
      if (curr.length >= MAX) return curr
      return [...curr, p]
    })
  }

  function removeSelected(id: string) {
    setSelected((curr) => curr.filter((c) => c.id !== id))
  }

  async function createLink() {
    if (selected.length < MIN || selected.length > MAX) return
    setCreating(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selected.map((s) => s.id) }),
      })
      if (!res.ok) throw new Error('Failed to create comparison link')
      const data = (await res.json()) as { data: { id: string } }
      router.push(`/compare/${data.data.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create comparison link')
    } finally {
      setCreating(false)
    }
  }

  const canCreate = selected.length >= MIN && selected.length <= MAX

  return (
    <div className="relative overflow-hidden">
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <div className="animate-hero mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Compare portfolios</h1>
          <p className="mt-2 text-slate-400">
            Pick {MIN} to {MAX} portfolios to build a shareable side-by-side comparison.
          </p>
        </div>

        {quickPicks.length > 0 && selected.length === 0 && (
          <div className="animate-hero delay-1 mb-8">
            <p className="mb-3 text-sm font-medium text-slate-400">Quick picks â€” top 5 by score</p>
            <div className="flex flex-wrap gap-2">
              {quickPicks.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleSelect(p)}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                    selected.some((s) => s.id === p.id)
                      ? 'border-violet-500/60 bg-violet-500/15 text-violet-300'
                      : 'border-white/10 bg-white/[0.04] text-slate-300 hover:border-violet-500/40 hover:bg-white/[0.06] hover:text-white',
                  )}
                >
                  <Avatar p={p} size="sm" />
                  <span>{p.name}</span>
                  {p.score ? <ScoreBadge score={p.score.overallScore} /> : null}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="animate-hero delay-2 relative mb-6">
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
            </svg>
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search portfolios by name, technology, or domain..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.04] py-3.5 pl-12 pr-4 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-violet-500/60 focus:bg-white/[0.06]"
          />
          {searching && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">Searchingâ€¦</span>
          )}
        </div>

        {results.length > 0 && (
          <div className="mb-6 space-y-2">
            {results.map((p) => {
              const isSelected = selected.some((s) => s.id === p.id)
              const atMax = selected.length >= MAX && !isSelected
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => toggleSelect(p)}
                  disabled={atMax}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-3 text-left backdrop-blur-sm transition-all',
                    isSelected
                      ? 'border-violet-500/60 bg-violet-500/10'
                      : 'border-white/10 bg-white/[0.03] hover:border-violet-500/40 hover:bg-white/[0.05]',
                    atMax && 'cursor-not-allowed opacity-50',
                  )}
                >
                  <Avatar p={p} size="sm" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-white">{p.name}</div>
                    <div className="truncate text-xs text-slate-500">{hostnameOf(p.portfolioUrl)}</div>
                  </div>
                  <ScoreBadge score={p.score?.overallScore ?? 0} />
                  <span className={cn('text-sm font-bold', isSelected ? 'text-emerald-400' : 'text-violet-400')}>
                    {isSelected ? 'âœ“' : '+'}
                  </span>
                </button>
              )
            })}
          </div>
        )}

        {searched && !searching && results.length === 0 && query.trim() && (
          <div className="mb-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-sm font-medium text-white">No portfolios found</p>
            <p className="mt-1 text-sm text-slate-500">Try a different search term.</p>
          </div>
        )}

        {!searched && !searching && !query.trim() && selected.length === 0 && quickPicks.length === 0 && (
          <div className="mb-6 rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-sm text-slate-500">Start typing to search the directory, or use a quick pick above.</p>
          </div>
        )}

        {selected.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-400">Selected</h2>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                {selected.length}/{MAX}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {selected.map((p) => (
                <span
                  key={p.id}
                  className="inline-flex items-center gap-2 rounded-full border border-violet-500/40 bg-violet-500/10 pl-1 pr-2 text-sm font-medium text-violet-300"
                >
                  <Avatar p={p} size="sm" />
                  {p.name}
                  <button
                    type="button"
                    onClick={() => removeSelected(p.id)}
                    aria-label={`Remove ${p.name}`}
                    className="ml-0.5 rounded-full px-1 text-xs text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    âœ•
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={createLink}
            disabled={!canCreate || creating}
            className="shine w-full max-w-md rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
          >
            {creating ? 'Creatingâ€¦' : `Compare Now â†’`}
          </button>
          {selected.length > 0 && selected.length < MIN && (
            <p className="text-xs text-slate-500">Select at least {MIN} portfolios to compare.</p>
          )}
        </div>
      </div>
    </div>
  )
}
