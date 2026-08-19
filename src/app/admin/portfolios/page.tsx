'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DataTable,
  type Column,
} from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDate, getScoreColor } from '@/lib/utils'
import { Star, Shield, Trash2 } from 'lucide-react'

const statusFilters = ['all', 'pending', 'approved', 'rejected', 'offline'] as const

interface AdminPortfolio {
  id: string
  name: string
  portfolioUrl: string
  status: string
  health: string
  featured: boolean
  verified: boolean
  submittedAt: string
  score?: { overallScore: number } | null
}

export default function PortfoliosPage() {
  const [portfolios, setPortfolios] = useState<AdminPortfolio[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('all')
  const [sortKey, setSortKey] = useState<string>('submittedAt')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const pageSize = 15

  const fetchPortfolios = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })
    if (status !== 'all') params.set('status', status)
    if (sortKey) params.set('sort', sortKey === 'submittedAt' ? (sortDir === 'desc' ? 'newest' : 'oldest') : sortKey)

    const res = await fetch(`/api/v1/admin/portfolios?${params}`)
    if (res.ok) {
      const json = await res.json()
      setPortfolios(json.data)
      setTotal(json.meta.total)
    }
    setLoading(false)
  }, [page, status, sortKey, sortDir])

  useEffect(() => {
    fetchPortfolios()
  }, [fetchPortfolios])

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(1)
  }

  async function patchPortfolio(id: string, body: Record<string, unknown>) {
    await fetch(`/api/v1/admin/portfolios`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...body }),
    })
    fetchPortfolios()
  }

  async function deletePortfolio(id: string) {
    await fetch(`/api/v1/admin/portfolios?id=${id}`, { method: 'DELETE' })
    fetchPortfolios()
  }

  async function bulkAction(action: string) {
    for (const id of selected) {
      if (action === 'delete') {
        await deletePortfolio(id)
      } else if (action === 'feature') {
        await patchPortfolio(id, { featured: true })
      } else if (action === 'unfeature') {
        await patchPortfolio(id, { featured: false })
      } else if (action === 'approve') {
        await patchPortfolio(id, { status: 'approved' })
      }
    }
    setSelected(new Set())
    fetchPortfolios()
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selected.size === portfolios.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(portfolios.map((p) => p.id)))
    }
  }

  const statusVariant = (s: string) => {
    switch (s) {
      case 'approved':
        return 'success' as const
      case 'rejected':
        return 'destructive' as const
      case 'offline':
        return 'destructive' as const
      default:
        return 'warning' as const
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'select',
      label: '',
      className: 'w-10',
      render: (row) => (
        <input
          type="checkbox"
          checked={selected.has(String(row.id))}
          onChange={() => toggleSelect(String(row.id))}
          className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 accent-amber-500"
        />
      ),
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <span className="font-medium text-zinc-100">{String(row.name)}</span>
      ),
    },
    {
      key: 'portfolioUrl',
      label: 'URL',
      render: (row) => (
        <span className="max-w-[180px] truncate text-zinc-400 block text-xs">
          {String(row.portfolioUrl)}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <Badge variant={statusVariant(String(row.status))}>
          {String(row.status)}
        </Badge>
      ),
    },
    {
      key: 'health',
      label: 'Health',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              row.health === 'healthy'
                ? 'bg-emerald-500'
                : row.health === 'needs_attention'
                  ? 'bg-yellow-500'
                  : row.health === 'offline'
                    ? 'bg-red-500'
                    : 'bg-zinc-400'
            }`}
          />
          <span className="text-zinc-400 text-xs">{String(row.health)}</span>
        </div>
      ),
    },
    {
      key: 'score',
      label: 'Score',
      sortable: true,
      render: (row) => {
        const score = row.score as { overallScore: number } | null | undefined
        if (!score) return <span className="text-zinc-600">—</span>
        return (
          <span className={`font-medium ${getScoreColor(score.overallScore)}`}>
            {score.overallScore}
          </span>
        )
      },
    },
    {
      key: 'featured',
      label: 'Featured',
      render: (row) =>
        row.featured ? (
          <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
        ) : (
          <span className="text-zinc-600">—</span>
        ),
    },
    {
      key: 'verified',
      label: 'Verified',
      render: (row) =>
        row.verified ? (
          <Shield className="h-4 w-4 fill-blue-500 text-blue-500" />
        ) : (
          <span className="text-zinc-600">—</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">Portfolios</h1>
        <p className="mt-1 text-sm text-zinc-400">Manage all portfolios on the platform</p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-2">
          {statusFilters.map((s) => (
            <button
              key={s}
              onClick={() => { setStatus(s); setPage(1) }}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                status === s
                  ? 'bg-zinc-700 text-zinc-50'
                  : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200'
              }`}
            >
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>

        {selected.size > 0 && (
          <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs text-zinc-300">
            <span>{selected.size} selected</span>
            <button onClick={() => bulkAction('approve')} className="font-medium text-emerald-400 hover:text-emerald-300">
              Approve
            </button>
            <button onClick={() => bulkAction('feature')} className="font-medium text-amber-400 hover:text-amber-300">
              Feature
            </button>
            <button onClick={() => bulkAction('unfeature')} className="font-medium text-zinc-400 hover:text-zinc-200">
              Unfeature
            </button>
            <button onClick={() => bulkAction('delete')} className="font-medium text-red-400 hover:text-red-300">
              Delete
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center text-sm text-zinc-500">
          Loading portfolios...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={portfolios.map((p) => p as unknown as Record<string, unknown>)}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={handleSort}
          actions={(row) => {
            const id = String(row.id)
            return (
              <div className="flex items-center justify-end gap-1">
                <button
                  onClick={() => patchPortfolio(id, { featured: !row.featured })}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-amber-400"
                  title={row.featured ? 'Unfeature' : 'Feature'}
                >
                  <Star className={`h-4 w-4 ${row.featured ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>
                <button
                  onClick={() => patchPortfolio(id, { verified: !row.verified })}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-blue-400"
                  title={row.verified ? 'Unverify' : 'Verify'}
                >
                  <Shield className={`h-4 w-4 ${row.verified ? 'fill-blue-500 text-blue-500' : ''}`} />
                </button>
                <button
                  onClick={() => {
                    if (confirm('Delete this portfolio?')) deletePortfolio(id)
                  }}
                  className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-red-400"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )
          }}
          emptyMessage="No portfolios found."
        />
      )}
    </div>
  )
}
