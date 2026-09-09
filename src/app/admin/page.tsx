'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { LinkReport, Paginated, Portfolio, SiteAnalytics, Submission } from '@/lib/types'
import { cn, formatDate, getHealthColor, getHealthLabel, hostnameOf } from '@/lib/utils'

const PAGE_SIZE = 20

type Tab = 'portfolios' | 'submissions' | 'reports' | 'newsletter' | 'analytics' | 'settings'
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
        : status === 'reported'
          ? 'bg-orange-500/10 text-orange-300 ring-1 ring-orange-500/30'
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
      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-emerald-500/30 bg-[#0c111c]/95 px-4 py-2.5 text-sm font-medium text-emerald-300 shadow-xl shadow-emerald-500/10 backdrop-blur-xl">
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
          className="rounded-lg bg-[#3e8bff] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#66a5ff] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>
    </div>
  )
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/[0.05] to-white/[0.01] p-5">
      <div className={cn('pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full blur-3xl', accent ?? 'bg-indigo-500/20')} />
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
    </div>
  )
}

function DistributionBar({
  label,
  count,
  max,
  color,
}: {
  label: string
  count: number
  max: number
  color: string
}) {
  const pct = max > 0 ? Math.max(4, Math.round((count / max) * 100)) : 0
  return (
    <div className="flex items-center gap-3">
      <div className="w-36 shrink-0 truncate text-right text-sm text-slate-400">{label}</div>
      <div className="h-5 flex-1 overflow-hidden rounded-full bg-white/[0.04]">
        <div
          className={cn('h-full rounded-full transition-all', color)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="w-12 shrink-0 text-left text-sm font-semibold text-slate-200">{count}</div>
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

function ReportsTable({
  reports,
  onDismiss,
}: {
  reports: LinkReport[]
  onDismiss: (id: string) => void
}) {
  if (reports.length === 0) {
    return <p className="p-10 text-center text-sm text-slate-500">No broken-link reports.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-max text-left">
        <thead>
          <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">URL</th>
            <th className="px-4 py-3">Reporter</th>
            <th className="px-4 py-3">Reason</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Reported</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reports.map((r) => (
            <tr key={r.id} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]">
              <td className="max-w-[14rem] truncate px-4 py-3 text-sm text-indigo-300">{r.portfolioUrl}</td>
              <td className="px-4 py-3 text-sm text-slate-200">{r.reporterName ?? '—'}</td>
              <td className="max-w-[18rem] truncate px-4 py-3 text-sm text-slate-400">{r.reason ?? '—'}</td>
              <td className="px-4 py-3">
                <StatusPill status={r.status} />
              </td>
              <td className="px-4 py-3 text-sm text-slate-500">{formatDate(r.createdAt)}</td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDismiss(r.id)}
                    className={cn(buttonClass, 'border-red-500/30 text-red-300 hover:border-red-500/70')}
                  >
                    Dismiss
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

function NewsletterTab({ emails, onCopy }: { emails: string[]; onCopy: (email: string) => void }) {
  if (emails.length === 0) {
    return <p className="p-10 text-center text-sm text-slate-500">No newsletter subscribers yet.</p>
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/10 text-xs font-medium uppercase tracking-wide text-slate-500">
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3 text-right">Action</th>
          </tr>
        </thead>
        <tbody>
          {emails.map((email, idx) => (
            <tr key={`${email}-${idx}`} className="border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.02]">
              <td className="px-4 py-3 text-sm text-slate-200">{email}</td>
              <td className="px-4 py-3 text-right">
                <button
                  type="button"
                  onClick={() => onCopy(email)}
                  className={cn(buttonClass, 'border-indigo-500/30 text-indigo-300 hover:border-indigo-500/70')}
                  aria-label={`Copy ${email} to clipboard`}
                >
                  Copy
                </button>
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
  const [reports, setReports] = useState<LinkReport[]>([])
  const [reportMeta, setReportMeta] = useState<PageMeta | null>(null)
  const [reportPage, setReportPage] = useState(1)
  const [emails, setEmails] = useState<string[]>([])
  const [analytics, setAnalytics] = useState<SiteAnalytics | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [totp, setTotp] = useState('')
  const [mfaConfigured, setMfaConfigured] = useState(false)
  const [trying, setTrying] = useState(false)
  const [turnstileToken, setTurnstileToken] = useState('')
  const [turnstileReady, setTurnstileReady] = useState(false)
  const widgetRef = useRef<HTMLDivElement | null>(null)
  const widgetIdRef = useRef<string | null>(null)

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  interface TurnstileWidget {
    render: (el: HTMLElement, opts: Record<string, unknown>) => string
    reset: (id: string) => void
  }

  function turnstileApi(): TurnstileWidget | null {
    return (window as unknown as { turnstile?: TurnstileWidget }).turnstile ?? null
  }

  function loadTurnstileScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') return reject(new Error('no window'))
      if (turnstileApi()) return resolve()
      let script = document.getElementById('df-cf-turnstile') as HTMLScriptElement | null
      if (script) {
        script.addEventListener('load', () => resolve(), { once: true })
        return
      }
      script = document.createElement('script')
      script.id = 'df-cf-turnstile'
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'
      script.async = true
      script.defer = true
      script.onload = () => resolve()
      script.onerror = () => reject(new Error('failed to load'))
      document.head.appendChild(script)
    })
  }

  function resetTurnstile() {
    const api = turnstileApi()
    if (api && widgetIdRef.current) {
      api.reset(widgetIdRef.current)
    }
    setTurnstileToken('')
  }

  function notify(message: string) {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast(message)
  }

  async function apiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(path, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
    })
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) throw new Error('Session expired or unauthorized')
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
    [],
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
    [],
  )

  const loadReports = useCallback(
    async (page: number, silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const qs = new URLSearchParams({ page: String(page), pageSize: String(PAGE_SIZE) })
        const data = await apiFetch<Paginated<LinkReport>>(`/api/v1/admin/reports?${qs.toString()}`)
        setReports(data.data)
        setReportMeta(data.meta)
        setReportPage(page)
      } catch (err) {
        fail(err)
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [],
  )

  const loadNewsletter = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const data = await apiFetch<{ data: string[] }>('/api/v1/admin/newsletter')
        setEmails(data.data)
      } catch (err) {
        fail(err)
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [],
  )

  const loadAnalytics = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true)
      setError(null)
      try {
        const data = await apiFetch<{ data: SiteAnalytics }>('/api/v1/admin/analytics')
        setAnalytics(data.data)
      } catch (err) {
        fail(err)
      } finally {
        if (!silent) setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    let cancelled = false
    fetch('/api/v1/admin/session', { method: 'GET' })
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled) return
        if (j?.authenticated) {
          setUnlocked(true)
          loadPortfolios(1, 'all', '')
        } else if (typeof j?.mfaConfigured === 'boolean') {
          setMfaConfigured(j.mfaConfigured)
        }
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (unlocked || !siteKey || turnstileReady) return
    let cancelled = false
    setTurnstileReady(false)
    loadTurnstileScript()
      .then(() => {
        if (cancelled || !widgetRef.current) return
        const api = turnstileApi()
        if (!api) return
        if (widgetRef.current.dataset.rendered === '1') return
        widgetRef.current.dataset.rendered = '1'
        widgetIdRef.current = api.render(widgetRef.current, {
          sitekey: siteKey,
          action: 'admin-login',
          callback: (token: unknown) => setTurnstileToken(String(token)),
          'expired-callback': () => setTurnstileToken(''),
          'error-callback': () => setTurnstileToken(''),
        })
        setTurnstileReady(true)
      })
      .catch(() => setTurnstileReady(false))
    return () => {
      cancelled = true
    }
  }, [unlocked, siteKey, turnstileReady])

  async function submitLogin() {
    const trimmed = key.trim()
    if (!trimmed || !turnstileToken || trying) return
    setTrying(true)
    setError(null)
    try {
      const res = await fetch('/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey: trimmed,
          turnstileToken,
          totp: mfaConfigured ? totp.trim() : '',
        }),
      })
      if (res.status === 429) {
        resetTurnstile()
        setError('Too many attempts. Wait a moment before trying again.')
        return
      }
      if (!res.ok) {
        resetTurnstile()
        setError('Invalid credentials or request.')
        return
      }
      setKey('')
      setTotp('')
      setUnlocked(true)
      loadPortfolios(1, 'all', '')
    } catch {
      resetTurnstile()
      setError('Invalid credentials or request.')
    } finally {
      setTrying(false)
    }
  }

  async function lock() {
    setUnlocked(false)
    setKey('')
    setTotp('')
    setTurnstileToken('')
    setError(null)
    try {
      await fetch('/api/v1/admin/logout', { method: 'POST' })
    } catch {
      // ignore
    }
  }

  function switchTab(next: Tab) {
    setError(null)
    setTab(next)
    if (next === 'reports' && reports.length === 0) loadReports(1)
    else if (next === 'newsletter' && emails.length === 0) loadNewsletter()
    else if (next === 'analytics' && !analytics) loadAnalytics()
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

  async function dismissReport(id: string) {
    if (!confirm('Dismiss this report? It will be removed from the queue.')) return
    try {
      await apiFetch<{ data: { deleted: boolean } }>(`/api/v1/admin/reports?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      })
      notify('Report dismissed')
      if (reports.length === 1 && reportPage > 1) {
        await loadReports(reportPage - 1, true)
      } else {
        await loadReports(reportPage, true)
      }
    } catch (err) {
      fail(err)
    }
  }

  async function copyEmail(email: string) {
    try {
      await navigator.clipboard.writeText(email)
      notify(`Copied ${email}`)
    } catch {
      notify('Failed to copy email')
    }
  }

  function exportCSV() {
    if (portfolios.length === 0) {
      notify('No data to export — load portfolios first')
      return
    }
    const headers = ['Name', 'URL', 'Status', 'Health', 'Featured', 'Verified', 'Submitted']
    const rows = portfolios.map((p) => [
      p.name,
      p.portfolioUrl,
      p.status,
      p.health,
      p.featured ? 'yes' : 'no',
      p.verified ? 'yes' : 'no',
      formatDate(p.submittedAt),
    ])
    const csv = [headers, ...rows]
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolios-${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
    URL.revokeObjectURL(url)
    notify('CSV exported')
  }

  if (!unlocked) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0c111c]/70 p-8">
          <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-[#3e8bff]/15 blur-3xl" />
          <h1 className="text-2xl font-bold text-[#e8eef9]">Admin</h1>
          <p className="mt-2 text-sm text-slate-400">Enter your admin key to unlock the dashboard.</p>
          <form
            onSubmit={(e) => {
              e.preventDefault()
              submitLogin()
            }}
            className="mt-5 space-y-4"
          >
            <input
              type="password"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Admin key"
              autoComplete="current-password"
              aria-label="Admin key"
              className={cn(inputClass)}
            />
            {mfaConfigured && (
              <input
                type="text"
                inputMode="numeric"
                value={totp}
                onChange={(e) => setTotp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="Authenticator code"
                autoComplete="one-time-code"
                aria-label="Authenticator code"
                className={cn(inputClass)}
              />
            )}
            {siteKey ? (
              <div
                ref={widgetRef}
                aria-label="Human verification"
                className="flex justify-center [&>div]:w-full"
              />
            ) : (
              !mfaConfigured && (
                <p className="rounded-lg border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                  Security layer not configured — the site administrator needs to add Cloudflare Turnstile keys.
                </p>
              )
            )}
            {error && <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              disabled={!key.trim() || !turnstileToken || trying}
              className="shine mt-1 w-full rounded-xl bg-[#3e8bff] px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition-colors hover:bg-[#66a5ff] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {trying ? 'Verifying…' : 'Unlock'}
            </button>
          </form>
        </div>
      </div>
    )
  }

  const maxTech = analytics && analytics.techDistribution.length > 0
    ? Math.max(...analytics.techDistribution.map((t) => t.count))
    : 0
  const maxCat = analytics && analytics.categoryDistribution.length > 0
    ? Math.max(...analytics.categoryDistribution.map((c) => c.count))
    : 0
  const maxHealth = analytics && analytics.healthDistribution.length > 0
    ? Math.max(...analytics.healthDistribution.map((h) => h.count))
    : 0

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
          <p className="mt-2 text-sm text-slate-400">Manage portfolios, submissions, reports and more.</p>
        </div>
        <button
          type="button"
          onClick={lock}
          className={buttonClass}
          aria-label="Lock admin dashboard"
        >
          Lock
        </button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {([
          ['portfolios', 'Portfolios'],
          ['submissions', 'Submissions'],
          ['reports', 'Reports'],
          ['newsletter', 'Newsletter'],
          ['analytics', 'Analytics'],
          ['settings', 'Settings'],
        ] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            type="button"
            onClick={() => switchTab(t)}
            className={cn(
              'rounded-lg px-4 py-2 text-sm font-semibold transition-colors',
              tab === t
                ? 'bg-[#3e8bff] text-white'
                : 'border border-white/10 bg-white/[0.03] text-slate-300 hover:border-[#3e8bff]/50 hover:text-white',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {error && <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">{error}</div>}

      <div className="rounded-2xl border border-white/10 bg-[#0c111c]/70">
        {tab === 'portfolios' && (
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
                  aria-label="Search portfolios"
                  className={cn(inputClass, 'max-w-xs flex-1')}
                />
                <select
                  value={portfolioStatus}
                  onChange={(e) => {
                    setPortfolioStatus(e.target.value)
                    loadPortfolios(1, e.target.value, portfolioQuery)
                  }}
                  aria-label="Filter portfolios by status"
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
                  className="rounded-lg bg-[#3e8bff] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#66a5ff]"
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
        )}

        {tab === 'submissions' && (
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
                  aria-label="Search submissions"
                  className={cn(inputClass, 'max-w-xs flex-1')}
                />
                <select
                  value={submissionStatus}
                  onChange={(e) => {
                    setSubmissionStatus(e.target.value)
                    loadSubmissions(1, e.target.value, submissionQuery)
                  }}
                  aria-label="Filter submissions by status"
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
                  className="rounded-lg bg-[#3e8bff] px-3.5 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#66a5ff]"
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

        {tab === 'reports' && (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Broken Link Reports</h2>
                {reportMeta && (
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-white/10">
                    {reportMeta.total.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">Loading…</p>
            ) : (
              <ReportsTable reports={reports} onDismiss={dismissReport} />
            )}

            {reportMeta && !loading && (
              <AdminPagination
                meta={reportMeta}
                onPrev={() => loadReports(Math.max(1, reportMeta.page - 1), true)}
                onNext={() => loadReports(Math.min(reportMeta.totalPages, reportMeta.page + 1), true)}
              />
            )}
          </>
        )}

        {tab === 'newsletter' && (
          <>
            <div className="flex flex-wrap items-center gap-3 border-b border-white/10 p-4">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-white">Newsletter Subscribers</h2>
                <span className="rounded-full bg-white/[0.06] px-2.5 py-0.5 text-xs font-medium text-indigo-300 ring-1 ring-white/10">
                  {emails.length.toLocaleString()}
                </span>
              </div>
            </div>

            {loading ? (
              <p className="py-10 text-center text-sm text-slate-500">Loading…</p>
            ) : (
              <NewsletterTab emails={emails} onCopy={copyEmail} />
            )}
          </>
        )}

        {tab === 'analytics' && (
          <div className="p-6">
            {loading && !analytics ? (
              <p className="py-10 text-center text-sm text-slate-500">Loading analytics…</p>
            ) : analytics ? (
              <div className="space-y-8">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-7">
                  <StatCard label="Total portfolios" value={analytics.totalPortfolios} accent="bg-indigo-500/20" />
                  <StatCard label="Approved" value={analytics.totalApproved} accent="bg-emerald-500/20" />
                  <StatCard label="Pending" value={analytics.totalPending} accent="bg-amber-500/20" />
                  <StatCard label="Total votes" value={analytics.totalVotes} accent="bg-blue-500/20" />
                  <StatCard label="Avg score" value={analytics.avgScore} accent="bg-blue-500/20" />
                  <StatCard label="Total emails" value={analytics.totalEmails} accent="bg-indigo-500/20" />
                  <StatCard label="Total reports" value={analytics.totalReports} accent="bg-orange-500/20" />
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Tech distribution</h3>
                    <div className="space-y-2.5">
                      {analytics.techDistribution.length === 0 ? (
                        <p className="text-sm text-slate-500">No technology data.</p>
                      ) : (
                        analytics.techDistribution.map((t) => (
                          <DistributionBar key={t.tech} label={t.tech} count={t.count} max={maxTech} color="bg-[#3e8bff]" />
                        ))
                      )}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                    <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Category distribution</h3>
                    <div className="space-y-2.5">
                      {analytics.categoryDistribution.length === 0 ? (
                        <p className="text-sm text-slate-500">No category data.</p>
                      ) : (
                        analytics.categoryDistribution.map((c) => (
                          <DistributionBar key={c.category} label={c.category} count={c.count} max={maxCat} color="bg-[#2dd4bf]" />
                        ))
                      )}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                  <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-400">Health distribution</h3>
                  <div className="space-y-2.5">
                    {analytics.healthDistribution.length === 0 ? (
                      <p className="text-sm text-slate-500">No health data.</p>
                    ) : (
                      analytics.healthDistribution.map((h) => (
                        <DistributionBar
                          key={h.health}
                          label={h.health.replace('_', ' ')}
                          count={h.count}
                          max={maxHealth}
                          color={
                            h.health === 'healthy'
                              ? 'bg-[#35D07F]'
                              : h.health === 'needs_attention'
                                ? 'bg-[#F2B84B]'
                                : h.health === 'down'
                                  ? 'bg-[#FF657A]'
                                  : 'bg-[#8a93a7]'
                          }
                        />
                      ))
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <p className="py-10 text-center text-sm text-slate-500">Failed to load analytics.</p>
            )}
          </div>
        )}

        {tab === 'settings' && (
          <div className="p-6">
            <h2 className="text-lg font-semibold text-white">Settings & Actions</h2>
            <p className="mt-1 text-sm text-slate-400">Manage data and dashboard behavior.</p>

            <div className="mt-6 space-y-3">
              <button
                type="button"
                onClick={exportCSV}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-medium text-slate-200 transition-all hover:border-indigo-500/50 hover:bg-white/[0.06]"
                aria-label="Export portfolios as CSV"
              >
                <span className="block font-semibold text-white">Export CSV</span>
                <span className="mt-0.5 text-xs text-slate-500">Download all loaded portfolios as a CSV file</span>
              </button>

              <button
                type="button"
                onClick={lock}
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-left text-sm font-medium text-slate-200 transition-all hover:border-red-500/50 hover:bg-white/[0.06]"
                aria-label="Lock dashboard"
              >
                <span className="block font-semibold text-white">Lock dashboard</span>
                <span className="mt-0.5 text-xs text-slate-500">End your session and require the admin key again</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
