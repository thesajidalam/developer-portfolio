'use client'

import { useEffect, useState } from 'react'

interface EmbedBadgeProps {
  slug: string
}

const ORIGIN = 'https://gitdevfolio.vercel.app'

export function EmbedBadge({ slug }: EmbedBadgeProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const origin = typeof window !== 'undefined' ? window.location.origin : ORIGIN
  const src = `${origin}/api/v1/embeds/${encodeURIComponent(slug)}`
  const snippet = `<iframe src="${src}" width="300" height="64" frameborder="0" title="My DevFolio score" loading="lazy" style="border-radius:16px;max-width:100%"></iframe>`

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

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
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-300 transition-all hover:border-[#3e8bff]/60 hover:text-white"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
        Embed badge
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Embed your score badge"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <button
            type="button"
            aria-hidden
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#03050a]/80 backdrop-blur-sm"
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0c111c] shadow-2xl shadow-black/70">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3e8bff]/60 to-transparent" />

            <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
              <div>
                <h3 className="text-sm font-semibold text-white">Embed your score badge</h3>
                <p className="mt-0.5 text-xs text-slate-500">Show your score anywhere with one line of HTML.</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-white/[0.06] hover:text-white"
                aria-label="Close"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4">
              <div className="rounded-xl border border-white/[0.06] bg-[#05070c] p-2.5">
                <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                  Live preview
                </p>
                <div className="flex justify-center overflow-hidden rounded-lg">
                  <iframe src={src} width="300" height="64" frameBorder="0" title="DevFolio badge preview" style={{ borderRadius: 16, maxWidth: '100%' }} />
                </div>
              </div>

              <p className="mt-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Copy this snippet into your site&apos;s HTML
              </p>
              <div className="mt-2 rounded-lg border border-white/[0.08] bg-[#05070c] p-3 ring-offset-0 transition-colors focus-within:border-[#3e8bff]/50">
                <code
                  className="block max-h-28 overflow-auto whitespace-pre-wrap break-all font-mono text-[11px] leading-relaxed text-slate-300 no-scrollbar"
                  onClick={(e) => {
                    const sel = window.getSelection()
                    const range = document.createRange()
                    range.selectNodeContents(e.currentTarget)
                    sel?.removeAllRanges()
                    sel?.addRange(range)
                  }}
                >
                  {snippet}
                </code>
              </div>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={copy}
                  className="shine inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#3e8bff] px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-[#66a5ff] active:scale-[0.98]"
                >
                  {copied ? (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      Copied!
                    </>
                  ) : (
                    <>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Copy code
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}