'use client'

import { useState } from 'react'
import type { PortfolioFilters, PortfolioWithScore } from '@/lib/types'
import { PortfolioCard } from '@/components/PortfolioCard'

interface LoadMoreProps {
  initial: PortfolioWithScore[]
  total: number
  initialPage: number
  pageSize: number
  filters: PortfolioFilters
}

export function LoadMore({ initial, total, initialPage, pageSize, filters }: LoadMoreProps) {
  const [items, setItems] = useState<PortfolioWithScore[]>(initial)
  const [page, setPage] = useState(initialPage)
  const [loading, setLoading] = useState(false)

  const hasMore = items.length < total

  async function loadMore() {
    if (loading || !hasMore) return
    setLoading(true)
    try {
      const nextPage = page + 1
      const params = new URLSearchParams()
      if (filters.search) params.set('search', filters.search)
      if (filters.tech) params.set('tech', filters.tech)
      if (filters.category) params.set('category', filters.category)
      if (filters.experience) params.set('experience', filters.experience)
      if (filters.sort) params.set('sort', filters.sort)
      params.set('page', String(nextPage))
      params.set('pageSize', String(pageSize))

      const res = await fetch(`/api/v1/portfolios?${params.toString()}`)
      if (!res.ok) return
      const j = (await res.json()) as { data: PortfolioWithScore[] }
      setItems((prev) => [...prev, ...j.data])
      setPage(nextPage)
    } catch {
      // ignore network errors
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {items.length > 0 ? (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((p) => (
            <PortfolioCard key={p.id} p={p} />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-16 text-center">
          <p className="text-lg font-medium text-white">No portfolios found</p>
          <p className="mt-2 text-sm text-slate-500">Try adjusting your filters or clearing your search.</p>
          <a
            href="/"
            className="shine mt-6 inline-block rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-105 active:scale-95"
          >
            Clear filters
          </a>
        </div>
      )}

      {hasMore && (
        <div className="mt-10 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={loadMore}
            disabled={loading}
            className="shine rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.03] hover:shadow-xl hover:shadow-violet-500/40 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? 'Loadingâ€¦' : 'Load more'}
          </button>
          <span className="text-xs text-slate-500">
            Showing {items.length.toLocaleString()} of {total.toLocaleString()} portfolios
          </span>
        </div>
      )}
    </div>
  )
}
