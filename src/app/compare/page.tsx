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

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:bg-white/[0.06]'

export default function ComparePage() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<PortfolioWithScore[]>([])
  const [selected, setSelected] = useState<PortfolioWithScore[]>([])
  const [searching, setSearching] = useState(false)
  const [searched, setSearched] = useState(false)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="animate-hero mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white">Compare portfolios</h1>
          <p className="mt-2 text-slate-400">
            Pick {MIN} to {MAX} portfolios to build a shareable side-by-side comparison link.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <div className="relative animate-hero delay-1">
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search portfolios by name, title or technology..."
                className={inputClass}
              />
              {searching && (
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-500">Searching…</span>
              )}
            </div>

            <div className="mt-4 space-y-2">
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
                        ? 'border-indigo-500/60 bg-indigo-500/10'
                        : 'border-white/10 bg-white/[0.03] hover:border-indigo-500/40 hover:bg-white/[0.05]',
                      atMax && 'cursor-not-allowed opacity-50',
                    )}
                  >
                    <Avatar p={p} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-medium text-white">{p.name}</div>
                      <div className="truncate text-xs text-slate-500">{hostnameOf(p.portfolioUrl)}</div>
                    </div>
                    <ScoreBadge score={p.score?.overallScore ?? 0} />
                    <span className={cn('text-sm font-bold', isSelected ? 'text-emerald-400' : 'text-indigo-400')}>
                      {isSelected ? '✓' : '+'}
                    </span>
                  </button>
                )
              })}

              {searched && !searching && results.length === 0 && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                  <p className="text-sm font-medium text-white">No portfolios found</p>
                  <p className="mt-1 text-sm text-slate-500">Try a different search term.</p>
                </div>
              )}
              {!searched && !searching && query.trim() === '' && (
                <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center">
                  <p className="text-sm text-slate-500">Start typing to search the directory.</p>
                </div>
              )}
            </div>
          </div>

          <aside className="glass h-fit rounded-2xl p-5 lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Selected</h2>
              <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                {selected.length}/{MAX}
              </span>
            </div>

            {selected.length === 0 ? (
              <p className="text-sm text-slate-500">
                Search above and click portfolios to add them here. {MIN}–{MAX} required.
              </p>
            ) : (
              <ul className="space-y-2">
                {selected.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-2.5">
                    <Avatar p={p} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-white">{p.name}</div>
                      <div className="truncate text-xs text-slate-500">{hostnameOf(p.portfolioUrl)}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleSelect(p)}
                      aria-label={`Remove ${p.name}`}
                      className="rounded-md px-1.5 py-0.5 text-sm text-slate-400 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {error && (
              <p className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
            )}

            <button
              type="button"
              onClick={createLink}
              disabled={!canCreate || creating}
              className="shine mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
            >
              {creating ? 'Creating…' : 'Create comparison link'}
            </button>

            {selected.length > 0 && selected.length < MIN && (
              <p className="mt-2 text-center text-xs text-slate-500">Select at least {MIN} portfolios to create a link.</p>
            )}
          </aside>
        </div>
        </div>
      </div>
  )
}