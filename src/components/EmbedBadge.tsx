'use client'

import { useState } from 'react'

interface EmbedBadgeProps {
  slug: string
}

export function EmbedBadge({ slug }: EmbedBadgeProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://gitdevfolio.vercel.app'
  const snippet = `<iframe src="${origin}/api/v1/embeds/${encodeURIComponent(slug)}" width="140" height="60" frameborder="0" title="My DevFolio score" style="border-radius:10px"></iframe>`

  async function copy() {
    try {
      await navigator.clipboard.writeText(snippet)
    } catch {
      const el = document.createElement('textarea')
      el.value = snippet
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="relative inline-flex">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-violet-500/50 hover:text-white"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
        Embed badge
      </button>

      {open && (
        <>
          <button type="button" aria-hidden className="fixed inset-0 z-20 cursor-default" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-30 mt-2 w-80 rounded-xl border border-white/10 bg-[#0b1020] p-4 shadow-2xl shadow-black/50">
            <h3 className="text-sm font-semibold text-white">Embed your score badge</h3>
            <p className="mt-1 text-xs text-slate-500">Copy this snippet into your site&apos;s HTML.</p>
            <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-2">
              <code className="block break-all font-mono text-[11px] leading-relaxed text-slate-300">{snippet}</code>
            </div>
            <button
              type="button"
              onClick={copy}
              className="mt-3 w-full rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-3 py-2 text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-95"
            >
              {copied ? 'Copied!' : 'Copy snippet'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}
