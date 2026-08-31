'use client'

import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import { cn } from '@/lib/utils'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:bg-white/[0.06]'

function ReportForm() {
  const searchParams = useSearchParams()
  const initialUrl = searchParams.get('url') ?? ''

  const [url, setUrl] = useState(initialUrl)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [reason, setReason] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [retryAfter, setRetryAfter] = useState<number | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) {
      setStatus('error')
      setMessage('Please enter the portfolio URL.')
      return
    }
    setStatus('loading')
    setMessage('')
    try {
      const res = await fetch('/api/v1/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioUrl: url.trim(),
          reporterName: name.trim() || undefined,
          reporterEmail: email.trim() || undefined,
          reason: reason.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.status === 429) {
        setStatus('error')
        setRetryAfter(data.retryAfter ?? 60)
        setMessage(data.error || 'Too many reports. Please try again later.')
        return
      }
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
        return
      }
      setStatus('success')
      setMessage(data.data?.message || 'Report submitted. Thank you!')
      setReason('')
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-indigo-500/10 backdrop-blur-xl">
        <div className="pointer-events-none absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-500/25 blur-3xl" />

        <a href="/" className="text-sm text-indigo-300 transition-colors hover:text-indigo-200">
          ← Back to gallery
        </a>
        <h1 className="mt-4 text-2xl font-bold text-white">Report a broken link</h1>
        <p className="mt-2 text-sm text-slate-400">
          Found a portfolio link that no longer works? Let us know and we&apos;ll take it down or fix it.
        </p>

        {status === 'success' && (
          <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
            {message}
          </div>
        )}

        {status === 'error' && (
          <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {message}
            {retryAfter ? <span> Please wait {retryAfter}s.</span> : null}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="report-url" className="mb-1.5 block text-sm font-medium text-slate-300">
              Portfolio URL <span className="text-red-400">*</span>
            </label>
            <input
              id="report-url"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="example.dev or https://example.dev"
              className={inputClass}
              aria-label="Portfolio URL to report"
            />
          </div>

          <div>
            <label htmlFor="report-name" className="mb-1.5 block text-sm font-medium text-slate-300">
              Your name <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="report-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className={inputClass}
              aria-label="Your name"
            />
          </div>

          <div>
            <label htmlFor="report-email" className="mb-1.5 block text-sm font-medium text-slate-300">
              Email <span className="text-slate-500">(optional)</span>
            </label>
            <input
              id="report-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={inputClass}
              aria-label="Your email"
            />
          </div>

          <div>
            <label htmlFor="report-reason" className="mb-1.5 block text-sm font-medium text-slate-300">
              Reason <span className="text-slate-500">(optional)</span>
            </label>
            <textarea
              id="report-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Link returns 404, site is no longer a portfolio, etc."
              rows={4}
              className={cn(inputClass, 'resize-none')}
              aria-label="Reason for report"
            />
          </div>

          <button
            type="submit"
            disabled={status === 'loading'}
            className="shine w-full rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
          >
            {status === 'loading' ? 'Submitting…' : 'Submit report'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8">
            <p className="text-sm text-slate-400">Loading…</p>
          </div>
        </div>
      }
    >
      <ReportForm />
    </Suspense>
  )
}
