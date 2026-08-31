'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Paginated, Portfolio, Submission } from '@/lib/types'
import { cn, formatDate, getHealthColor, getHealthLabel, hostnameOf } from '@/lib/utils'

const PAGE_SIZE = 20

type Tab = 'portfolios' | 'submissions'
type PageMeta = Paginated<Portfolio>['meta']
type PortfolioStatus = Portfolio['status']

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:bg-white/[0.06]'
const selectClass =
  'rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-slate-300 outline-none transition-all focus:border-indigo-500/60'
const buttonClass =
  'rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-xs font-medium text-slate-300 transition-all hover:border-white/25 hover:bg-white/[0.06] hover:text-white'

function StatusPill({ status }: { status: string }) {
  const cls =
    status === 'approved' || status === 'completed'
      ? 'bg-emerald-500/10 text-emerald-300 ring-1 ring-emerald-500/30'
      : status === 'rejected'
        ? 'bg-red-500/10 text-red-300 ring-1 ring-red-500/30'
        : 'bg-amber-500/10 text-amber-300 ring-1 ring-amber-500/30'
  return <span className={cn('inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize', cls)}>{status}</span>
}

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 300)
    }, 2600)
    return () => clearTimeout(t)
  }, [onClose])
  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 transition-all duration-300',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0',
      )}
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0a1120]/95 px-4 py-2.5 text-sm font-medium text-emerald-300 shadow-xl shadow-emerald-500/10 backdrop-blur-xl">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
        {message}
      </div>
    </div>
  )
}

function AdminPagination({ meta, onPrev, onNext }: { meta: PageMeta; onPrev: () => void; onNext: () => void }) {
  const totalPages = Math.max(1, meta.totalPages)
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4">
      <span className="text-sm text-slate-500">
        Page {meta.page} of {totalPages} · {meta.total.toLocaleString()} results
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={meta.page <= 1}
          className={cn(buttonClass, 'px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40')}
        >
          ← Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={meta.page >= totalPages}
          className="rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

function PortfolioTable({
  portfolios,
  onStatus,
  onDelete,
}: {
  portfolios: Portfolio[]
  onStatus: (body: { id: string; status?: PortfolioStatus; featured?: boolean }) => void
  onDelete: (id: string) => void
}) {
  if (portfolios.length === 0) {
    return <p className="p-10 text-center text-sm text-slate-500">No portfolios match this filter.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left">
        <thead>
          <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Hostname</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Health</th>
            <th className="px-4 py-3">Featured</th>
            <th className="px-4 py-3">Verified</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {portfolios.map((p) => (
            <tr key={p.id} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]">
              <td className="px-4 py-3 text-sm font-medium text-white">{p.name}</td>
              <td className="max-w-[14rem] truncate px-4 py-3 text-sm text-slate-500">{hostnameOf(p.portfolioUrl)}</td>
              <td className="px-4 py-3">
                <StatusPill status={p.status} />
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-400">
                  <span className={cn('h-2 w-2 rounded-full', getHealthColor(p.health))} />
                  {getHealthLabel(p.health)}
                </span>
              </td>
              <td className="px-4 py-3 text-sm">
                {p.featured ? <span className="text-amber-400">★ Featured</span> : <span className="text-slate-600">—</span>}
              </td>
              <td className="px-4 py-3 text-sm">
                {p.verified ? <span className="text-indigo-400">✓ Verified</span> : <span className="text-slate-600">—</span>}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {p.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => onStatus({ id: p.id, status: 'approved' })}
                      className={cn(buttonClass, 'border-emerald-500/30 text-emerald-300 hover:border-emerald-500/70')}
                    >
                      Approve
                    </button>
                  )}
                  {p.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => onStatus({ id: p.id, status: 'rejected' })}
                      className={cn(buttonClass, 'border-red-500/30 text-red-300 hover:border-red-500/70')}
                    >
                      Reject
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onStatus({ id: p.id, featured: !p.featured })}
                    className={cn(buttonClass, p.featured && 'border-amber-500/40 text-amber-300 hover:border-amber-500/70')}
                  >
                    {p.featured ? 'Unfeature' : 'Feature'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(p.id)}
                    className={cn(buttonClass, 'border-red-500/30 text-red-300 hover:border-red-500/70')}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function SubmissionTable({
  submissions,
  onStatus,
}: {
  submissions: Submission[]
  onStatus: (id: string, status: 'completed' | 'rejected') => void
}) {
  if (submissions.length === 0) {
    return <p className="p-10 text-center text-sm text-slate-500">No submissions yet.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left">
        <thead>
          <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Portfolio URL</th>
            <th className="px-4 py-3">Submitter</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Submitted</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]">
              <td className="max-w-[16rem] truncate px-4 py-3 text-sm text-indigo-300">{s.portfolioUrl}</td>
              <td className="px-4 py-3 text-sm text-slate-200">{s.submitterName ?? '—'}</td>
              <td className="px-4 py-3 text-sm text-slate-500">{s.submitterEmail ?? '—'}</td>
              <td className="px-4 py-3">
                <StatusPill status={s.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{formatDate(s.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap items-center justify-end gap-1.5">
                  {s.status !== 'completed' && (
                    <button
                      type="button"
                      onClick={() => onStatus(s.id, 'completed')}
                      className={cn(buttonClass, 'border-emerald-500/30 text-emerald-300 hover:border-emerald-500/70')}
                    >
                      Complete
                    </button>
                  )}
                  {s.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => onStatus(s.id, 'rejected')}
                      className={cn(buttonClass, 'border-red-500/30 text-red-300 hover:border-red-500/70')}
                    >
                      Reject
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function AdminPage() {
  const [key, setKey] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [tab, setTab] = useState<Tab>('portfolios')
  const [portfolios, setPortfolios] = useState<Portfolio[]>([])
  const [portfolioMeta, setPortfolioMeta] = useState<PageMeta | null>(null)
  const [portfolioStatus, setPortfolioStatus] = useState('all')
  const [portfolioPage, setPortfolioPage] = useState(1)
  const [portfolioQuery, setPortfolioQuery] = useState('')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [submissionMeta, setSubmissionMeta] = useState<PageMeta | null>(null)
  const [submissionPage, setSubmissionPage] = useState(1)
  const [submissionStatus, setSubmissionStatus] = useState('all')
  const [submissionQuery, setSubmissionQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function notify(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
  }

  async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
        ...init.headers,
      },
    })
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('Unauthorized — check your admin key')
      throw new Error(`Request failed (${res.status})`)
    }
    return (await res.json()) as T
  }

  function fail(err: unknown) {
    setError(err instanceof Error ? err.message : 'Something went wrong')
  }

  const loadPortfolios = useCallback(
    async (page: number, status: string, q: string, silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
        if (status !== 'all') qs.set('status', status)
        if (q.trim()) qs.set('q', q.trim())
        const data = await apiFetch<Paginated<Portfolio>>(`/api/v1/admin/portfolios?${qs.toString()}`)
        setPortfolios(data.data)
        setPortfolioMeta(data.meta)
        setPortfolioPage(page)
      } catch (err) {
        fail(err)
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [key],
  )

  const loadSubmissions = useCallback(
    async (page: number, status: string, q: string, silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
        if (status !== 'all') qs.set('status', status)
        if (q.trim()) qs.set('q', q.trim())
        const data = await apiFetch<Paginated<Submission>>(`/api/v1/admin/submissions?${qs.toString()}`)
        setSubmissions(data.data)
        setSubmissionMeta(data.meta)
        setSubmissionPage(page)
      } catch (err) {
        fail(err)
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [key],
  )

  function unlock() {
    const trimmed = key.trim()
    if (!trimmed) return
    setKey(trimmed)
    setUnlocked(true)
    loadPortfolios(1, 'all', '')
  }

  function switchTab(next: Tab) {
    setError(null)
    setTab(next)
  }

  async function patchPortfolio(body: { id: string; status?: PortfolioStatus; featured?: boolean }) {
    try {
      await apiFetch<{ data: Portfolio }>('/api/v1/admin/portfolios', {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      if (body.status === 'approved') notify('Portfolio approved and published')
      else if (body.status === 'rejected') notify('Portfolio rejected')
      else if (typeof body.featured === 'boolean') notify(body.featured ? 'Portfolio featured' : 'Portfolio unfeatured')
      await loadPortfolios(portfolioPage, portfolioStatus, portfolioQuery, true)
    } catch (err) {
      fail(err)
    }
  }

  async function deletePortfolio(id: string) {
    if (!confirm('Delete this portfolio? This cannot be undone.')) return
    try {
      await apiFetch<{ data: { deleted: boolean } }>(`/api/v1/admin/portfolios?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      notify('Portfolio deleted')
      if (portfolios.length === 1 && portfolioPage > 1) {
        await loadPortfolios(portfolioPage - 1, portfolioStatus, portfolioQuery, true)
      } else {
        await loadPortfolios(portfolioPage, portfolioStatus, portfolioQuery, true)
      }
    } catch (err) {
      fail(err)
    }
  }

  async function patchSubmission(id: string, status: 'completed' | 'rejected') {
    try {
      await apiFetch<{ data: Submission }>('/api/v1/admin/submissions', {
        method: 'PATCH',
        body: JSON.stringify({ id, status }),
      })
      notify(status === 'completed' ? 'Submission completed — portfolio published' : 'Submission rejected')
      await loadSubmissions(submissionPage, submissionStatus, submissionQuery, true)
    } catch (err) {
      fail(err)
    }
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />
          <h1 className="text-2xl font-bold text-white">Admin</h1>
          <p className="mt-2 text-sm text-slate-400">Enter your admin key to unlock the dashboard.</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') unlock()
            }}
            placeholder="Admin key"
            autoComplete="current-password"
            className={cn(inputClass, 'mt-5')}
          />
          {error && <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
          <button
            type="button"
            onClick={unlock}
            disabled={!key.trim()}
            className="shine mt-5 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            Unlock
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      {toast && (
        <Toast
          message={toast}
          onClose={() => {
            setToast(null)
            if (toastTimer.current) clearTimeout(toastTimer.current)
          }}
        />
      )}

      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white">Admin</h1>
          <p className="mt-2 text-sm text-slate-400">Manage portfolios and review submissions.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setUnlocked(false)
            setKey('')
            setError(null)
          }}
          className={buttonClass}
        >
          Lock
        </button>
      </div>

      <div className="mb-6 flex items-center gap-2">
        {(['portfolios', 'submissions'] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-all',
              tab === t
                ? 'bg-gradient-to-r from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25'
                : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:border-indigo-500/50 hover:text-white',
            )}
          >
            {t === 'portfolios' ? 'Portfolios' : 'Submissions'}
          </button>
        ))}
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] backdrop-blur-xl">
        {tab === 'portfolios' ? (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Portfolios</h2>
                {portfolioMeta && (
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-white/10">
                    {portfolioMeta.total.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="ml-auto flex flex-1 flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
                <input
                  type="search"
                  value={portfolioQuery}
                  onChange={(e) => setPortfolioQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') loadPortfolios(1, portfolioStatus, portfolioQuery)
                  }}
                  placeholder="Search portfolios, URL, tech…"
                  className={cn(inputClass, 'max-w-xs flex-1')}
                />
                <select
                  value={portfolioStatus}
                  onChange={(e) => {
                    setPortfolioStatus(e.target.value)
                    loadPortfolios(1, e.target.value, portfolioQuery)
                  }}
                  className={selectClass}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  type="button"
                  onClick={() => loadPortfolios(1, portfolioStatus, portfolioQuery)}
                  className="rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03]"
                >
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">Loading…</p>
            ) : (
              <PortfolioTable portfolios={portfolios} onStatus={patchPortfolio} onDelete={deletePortfolio} />
            )}

            {portfolioMeta && !loading && (
              <AdminPagination
                meta={portfolioMeta}
                onPrev={() => loadPortfolios(Math.max(1, portfolioMeta.page - 1), portfolioStatus, portfolioQuery, true)}
                onNext={() => loadPortfolios(Math.min(portfolioMeta.totalPages, portfolioMeta.page + 1), portfolioStatus, portfolioQuery, true)}
              />
            )}
          </>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Submissions</h2>
                {submissionMeta && (
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-white/10">
                    {submissionMeta.total.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="ml-auto flex flex-1 flex-wrap items-center justify-end gap-2 sm:flex-nowrap">
                <input
                  type="search"
                  value={submissionQuery}
                  onChange={(e) => setSubmissionQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') loadSubmissions(1, submissionStatus, submissionQuery)
                  }}
                  placeholder="Search URL, submitter, email…"
                  className={cn(inputClass, 'max-w-xs flex-1')}
                />
                <select
                  value={submissionStatus}
                  onChange={(e) => {
                    setSubmissionStatus(e.target.value)
                    loadSubmissions(1, e.target.value, submissionQuery)
                  }}
                  className={selectClass}
                >
                  <option value="all">All statuses</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="rejected">Rejected</option>
                </select>
                <button
                  type="button"
                  onClick={() => loadSubmissions(1, submissionStatus, submissionQuery)}
                  className="rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-3.5 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03]"
                >
                  Search
                </button>
              </div>
            </div>

            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">Loading…</p>
            ) : (
              <SubmissionTable submissions={submissions} onStatus={patchSubmission} />
            )}

            {submissionMeta && !loading && (
              <AdminPagination
                meta={submissionMeta}
                onPrev={() => loadSubmissions(Math.max(1, submissionMeta.page - 1), submissionStatus, submissionQuery, true)}
                onNext={() => loadSubmissions(Math.min(submissionMeta.totalPages, submissionMeta.page + 1), submissionStatus, submissionQuery, true)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
