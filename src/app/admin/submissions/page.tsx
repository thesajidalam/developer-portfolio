'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DataTable,
  type Column,
} from '@/components/admin/data-table'
import { Badge } from '@/components/ui/badge'
import { formatDate } from '@/lib/utils'
import type { Submission } from '@/types'

const statusFilters = ['all', 'pending', 'processing', 'completed', 'failed'] as const

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [status, setStatus] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const pageSize = 15

  const fetchSubmissions = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    })
    if (status !== 'all') params.set('status', status)

    const res = await fetch(`/api/v1/admin/submissions?${params}`)
    if (res.ok) {
      const json = await res.json()
      setSubmissions(json.data)
      setTotal(json.meta.total)
    }
    setLoading(false)
  }, [page, status])

  useEffect(() => {
    fetchSubmissions()
  }, [fetchSubmissions])

  async function updateStatus(id: string, newStatus: string) {
    await fetch(`/api/v1/admin/submissions`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: newStatus }),
    })
    fetchSubmissions()
  }

  const statusVariant = (s: string) => {
    switch (s) {
      case 'completed':
        return 'success' as const
      case 'failed':
        return 'destructive' as const
      case 'processing':
        return 'secondary' as const
      default:
        return 'warning' as const
    }
  }

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: 'portfolioUrl',
      label: 'URL',
      render: (row) => (
        <span className="max-w-[220px] truncate text-zinc-100 block">
          {String(row.portfolioUrl)}
        </span>
      ),
    },
    {
      key: 'submitterName',
      label: 'Submitter',
      render: (row) => (
        <span className="text-zinc-300">
          {String(row.submitterName ?? 'Anonymous')}
        </span>
      ),
    },
    {
      key: 'createdAt',
      label: 'Date',
      sortable: true,
      render: (row) => (
        <span className="text-zinc-400">{formatDate(String(row.createdAt))}</span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <Badge variant={statusVariant(String(row.status))}>
          {String(row.status)}
        </Badge>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-50">Submissions</h1>
        <p className="mt-1 text-sm text-zinc-400">Review and manage portfolio submissions</p>
      </div>

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

      {loading ? (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-12 text-center text-sm text-zinc-500">
          Loading submissions...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={submissions.map((s) => s as unknown as Record<string, unknown>)}
          total={total}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          actions={(row) => {
            const id = String(row.id)
            const currentStatus = String(row.status)
            return (
              <div className="flex items-center justify-end gap-1">
                {currentStatus === 'pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(id, 'completed')}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => updateStatus(id, 'failed')}
                      className="rounded-md px-2.5 py-1 text-xs font-medium text-red-400 hover:bg-red-500/10"
                    >
                      Reject
                    </button>
                  </>
                )}
                {currentStatus === 'pending' && (
                  <button
                    onClick={() => updateStatus(id, 'processing')}
                    className="rounded-md px-2.5 py-1 text-xs font-medium text-blue-400 hover:bg-blue-500/10"
                  >
                    Review
                  </button>
                )}
              </div>
            )
          }}
          emptyMessage="No submissions found."
        />
      )}
    </div>
  )
}
