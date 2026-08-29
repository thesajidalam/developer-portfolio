'use client'

import Link from 'next/link'
import { useState } from 'react'

type Status = 'idle' | 'loading' | 'success' | 'error'

const inputClass =
  'w-full rounded-lg border border-slate-800 bg-slate-900/60 px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-colors placeholder:text-slate-500 focus:border-indigo-500/60'

export default function SubmitPage() {
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)

  const urlValid = url.trim() === '' || url.startsWith('https://')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!urlValid || !url.trim()) return
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch('/api/v1/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim(), name: name.trim() || undefined, email: email.trim() || undefined }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        throw new Error(data?.error ?? 'Something went wrong while submitting.')
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Something went wrong while submitting.')
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-3xl text-emerald-400">
          ✓
        </div>
        <h1 className="mt-6 text-3xl font-bold text-white">Submitted for review</h1>
        <p className="mt-3 text-slate-400">
          Thanks! Your portfolio (<span className="text-slate-200">{url}</span>) has been queued for review. Once approved,
          it will be scored and appear in the directory.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.03]"
        >
          Back to gallery
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-white">Add your portfolio</h1>
        <p className="mt-2 text-slate-400">Submit your portfolio for review and a six-dimension score.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-6">
        <div>
          <label htmlFor="url" className="mb-1.5 block text-sm font-medium text-slate-300">
            Portfolio URL <span className="text-red-400">*</span>
          </label>
          <input
            id="url"
            type="url"
            required
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://yourportfolio.com"
            className={inputClass}
          />
          {!urlValid && <p className="mt-1.5 text-xs text-amber-400">Only HTTPS URLs are accepted.</p>}
        </div>

        <div>
          <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
            Your name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="note" className="mb-1.5 block text-sm font-medium text-slate-300">
            Short note <span className="text-slate-500">(optional)</span>
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Tell us a bit about your portfolio..."
            className={inputClass}
          />
        </div>

        {status === 'error' && error && (
          <p className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <button
          type="submit"
          disabled={status === 'loading' || !urlValid || !url.trim()}
          className="w-full rounded-lg bg-gradient-to-r from-indigo-500 to-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-transform hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          {status === 'loading' ? 'Submitting...' : 'Submit for review'}
        </button>
        <p className="text-center text-xs text-slate-500">
          The note is informational only — only your URL, name and email are sent for review.
        </p>
      </form>
    </div>
  )
}
