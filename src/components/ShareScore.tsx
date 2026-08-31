'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

function XIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452z" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

interface ShareScoreProps {
  score: number
  label?: string
  portfolioName: string
  portfolioUrl: string
  pageUrl: string
  compact?: boolean
}

export function ShareScore({ score, label = 'Overall', portfolioName, portfolioUrl, pageUrl, compact }: ShareScoreProps) {
  const [copied, setCopied] = useState(false)

  const text = `I scored ${Math.round(score)}/100 on DevFolio${portfolioName ? ` for "${portfolioName}"` : ''} — see how your portfolio ranks!`
  const url = pageUrl

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
  const liHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&summary=${encodeURIComponent(text)}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const el = document.createElement('textarea')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const btnBase =
    'inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all hover:scale-[1.03] active:scale-95'

  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={xHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(btnBase, 'bg-white text-black hover:bg-slate-200')}
        aria-label="Share my score on X (Twitter)"
      >
        <XIcon /> Share score
      </a>
      <a
        href={liHref}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(btnBase, 'bg-[#0a66c2] text-white hover:brightness-110')}
        aria-label="Share my score on LinkedIn"
      >
        <LinkedInIcon /> Share
      </a>
      <button
        type="button"
        onClick={copyLink}
        className={cn(btnBase, 'border border-white/10 bg-white/[0.04] text-slate-200 hover:bg-white/[0.08]')}
        aria-label="Copy link to this portfolio"
      >
        <CopyIcon /> {copied ? 'Copied!' : 'Copy link'}
      </button>
    </div>
  )
}
