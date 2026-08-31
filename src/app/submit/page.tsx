'use client'

import Link from 'next/link'
import { useState } from 'react'
import { cn } from '@/lib/utils'

type Status = 'idle' | 'loading' | 'success' | 'error'

const inputClass =
  'w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2.5 text-sm text-slate-200 outline-none transition-all placeholder:text-slate-500 focus:border-indigo-500/60 focus:bg-white/[0.06]'

export default function SubmitPage() {
  const [step, setStep] = useState(1)
  const [url, setUrl] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  const urlValid = url.trim() === '' || /^https?:\/\/.+\..+/.test(url.trim())
  const urlRequired = url.trim().length > 0

  function validateStep(s: number): boolean {
    const errs: Record<string, string> = {}
    if (s === 1) {
      if (!url.trim()) errs.url = 'Portfolio URL is required.'
      else if (!urlValid) errs.url = 'Please enter a valid URL (https://...).'
    }
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  function nextStep() {
    if (validateStep(step)) setStep(step + 1)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!validateStep(1)) return
    setStatus('loading')
    setError(null)
    try {
      const res = await fetch('/api/v1/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: url.trim(),
          name: name.trim() || undefined,
          email: email.trim() || undefined,
          role: role.trim() || undefined,
        }),
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
    const embedSnippet = `<iframe src="https://gitdevfolio.vercel.app/api/v1/embeds/${encodeURIComponent(url.trim())}" width="140" height="60" frameborder="0" title="DevFolio score badge"></iframe>`
    return (
      <div className="relative overflow-hidden">
        <div className="bg-aurora pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-xl px-4 py-16 text-center sm:px-6">
          <div className="relative">
            <div className="confetti-wrapper">
              {Array.from({ length: 24 }).map((_, i) => (
                <span
                  key={i}
                  className="confetti-piece"
                  style={{
                    left: `${Math.random() * 100}%`,
                    animationDelay: `${Math.random() * 0.6}s`,
                    backgroundColor: ['#6366f1', '#38bdf8', '#34d399', '#facc15', '#f472b6'][i % 5],
                  }}
                />
              ))}
            </div>
            <div className="animate-hero mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 text-3xl text-emerald-400 ring-1 ring-emerald-500/30">
              ✓
            </div>
          </div>
          <h1 className="animate-hero delay-1 mt-6 text-3xl font-bold text-white">Thanks for submitting!</h1>
          <p className="animate-hero delay-2 mx-auto mt-3 max-w-md text-slate-400">
            Your portfolio (<span className="text-slate-200">{url}</span>) has been queued for review. Once approved,
            it will be scored and appear in the directory.
          </p>

          <div className="animate-hero delay-3 mt-8 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left backdrop-blur-xl">
            <h2 className="text-sm font-semibold text-white">Grab your DevFolio badge</h2>
            <p className="mt-1 text-xs text-slate-500">
              Once approved, embed your score on your site. Copy this snippet any time:
            </p>
            <div className="mt-3 flex items-stretch gap-2">
              <code className="min-w-0 flex-1 truncate rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-[11px] text-slate-300">
                {embedSnippet}
              </code>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(embedSnippet)
                    alert('Badge snippet copied to clipboard!')
                  } catch {
                    alert('Could not copy automatically. Select the code above.')
                  }
                }}
                className="shrink-0 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:scale-105 active:scale-95"
              >
                Copy
              </button>
            </div>
          </div>

          <Link
            href="/"
            className="shine animate-hero delay-3 mt-6 inline-block rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-105 hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
          >
            Back to gallery
          </Link>
          <style>{`
            .confetti-wrapper { position: absolute; inset: 0; overflow: hidden; pointer-events: none; }
            .confetti-piece {
              position: absolute; top: -10px; width: 8px; height: 8px; border-radius: 2px;
              animation: confetti-fall 2.5s ease-out forwards;
            }
            @keyframes confetti-fall {
              0% { transform: translateY(0) rotate(0deg); opacity: 1; }
              100% { transform: translateY(200px) rotate(720deg); opacity: 0; }
            }
          `}</style>
        </div>
      </div>
    )
  }

  const steps = [
    { num: 1, title: 'Portfolio URL' },
    { num: 2, title: 'About You' },
    { num: 3, title: 'Review & Submit' },
  ]

  return (
    <div className="relative overflow-hidden">
      <div className="bg-aurora pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-xl px-4 py-16 sm:px-6">
        <div className="animate-hero mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white">Add your portfolio</h1>
          <p className="mt-2 text-slate-400">Submit your portfolio for review and a six-dimension score.</p>
        </div>

        <div className="animate-hero delay-1 mb-8 flex items-center justify-center gap-2">
          {steps.map((s, i) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                  step > s.num
                    ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30'
                    : step === s.num
                      ? 'bg-gradient-to-r from-indigo-500 to-blue-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-white/[0.04] text-slate-500 ring-1 ring-white/10'
                }`}
              >
                {step > s.num ? '✓' : s.num}
              </div>
              <span className={`hidden text-xs font-medium sm:inline ${step === s.num ? 'text-white' : 'text-slate-500'}`}>
                {s.title}
              </span>
              {i < steps.length - 1 && (
                <div className={`mx-1 h-px w-8 ${step > s.num ? 'bg-emerald-500/40' : 'bg-white/10'}`} />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="animate-hero delay-2 space-y-5 rounded-2xl border border-white/10 bg-white/[0.03] p-6 shadow-2xl shadow-indigo-500/5 backdrop-blur-xl">
          {step === 1 && (
            <div>
              <label htmlFor="url" className="mb-1.5 block text-sm font-medium text-slate-300">
                Portfolio URL <span className="text-red-400">*</span>
              </label>
              <input
                id="url"
                type="url"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setFieldErrors((prev) => { const n = { ...prev }; delete n.url; return n }) }}
                placeholder="https://yourportfolio.com"
                className={cn(inputClass, fieldErrors.url && 'border-red-500/60')}
                autoFocus
              />
              {fieldErrors.url && <p className="mt-1.5 text-xs text-red-400">{fieldErrors.url}</p>}
            </div>
          )}

          {step === 2 && (
            <>
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Your name <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Doe"
                  className={inputClass}
                  autoFocus
                />
              </div>
              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Email <span className="text-slate-500">(optional)</span>
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
                <label htmlFor="role" className="mb-1.5 block text-sm font-medium text-slate-300">
                  Role <span className="text-slate-500">(optional)</span>
                </label>
                <input
                  id="role"
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="Frontend Developer"
                  className={inputClass}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-300">Review your submission</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">URL</span>
                    <span className="font-medium text-white">{url}</span>
                  </div>
                  {name && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Name</span>
                      <span className="font-medium text-white">{name}</span>
                    </div>
                  )}
                  {email && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Email</span>
                      <span className="font-medium text-white">{email}</span>
                    </div>
                  )}
                  {role && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Role</span>
                      <span className="font-medium text-white">{role}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {status === 'error' && error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
          )}

          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-indigo-500/50 hover:text-white"
              >
                Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="shine flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/40 active:scale-95"
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                disabled={status === 'loading'}
                className="shine flex-1 rounded-xl bg-gradient-to-r from-indigo-500 to-blue-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100 active:scale-95"
              >
                {status === 'loading' ? 'Submitting...' : 'Submit for review'}
              </button>
            )}
          </div>
        </form>

        <div className="animate-hero delay-3 mt-12">
          <h2 className="mb-6 text-center text-lg font-semibold text-white">How it works</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[
              { step: '1', title: 'Submit', desc: 'Send us your portfolio URL and details.' },
              { step: '2', title: 'We review', desc: 'Our team evaluates your site on six dimensions.' },
              { step: '3', title: 'You appear', desc: 'Get scored and listed in the directory.' },
            ].map((s) => (
              <div key={s.step} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-center backdrop-blur-sm">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/10 text-sm font-bold text-indigo-300 ring-1 ring-indigo-500/20">
                  {s.step}
                </div>
                <h3 className="text-sm font-semibold text-white">{s.title}</h3>
                <p className="mt-1 text-xs text-slate-500">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
