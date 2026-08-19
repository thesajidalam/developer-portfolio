'use client'

import { useState, useCallback } from 'react'
import { Link2, Check, Code2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface PortfolioShareProps {
  portfolioUrl: string
  portfolioName: string
  slug: string
  score?: number | null
}

export function PortfolioShare({ portfolioUrl, portfolioName, slug, score }: PortfolioShareProps) {
  const [copied, setCopied] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const [showEmbed, setShowEmbed] = useState(false)

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(portfolioUrl)
    } catch {
      const input = document.createElement('input')
      input.value = portfolioUrl
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    setToastVisible(true)
    setTimeout(() => setCopied(false), 2000)
    setTimeout(() => setToastVisible(false), 3000)
  }, [portfolioUrl])

  const shareTwitter = useCallback(() => {
    const text = encodeURIComponent(`Check out ${portfolioName} on Developer Portfolio!${score != null ? ` Score: ${score}` : ''}`)
    const url = encodeURIComponent(portfolioUrl)
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      '_blank',
      'noopener,noreferrer',
    )
  }, [portfolioName, portfolioUrl, score])

  const shareLinkedIn = useCallback(() => {
    const url = encodeURIComponent(portfolioUrl)
    window.open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      '_blank',
      'noopener,noreferrer',
    )
  }, [portfolioUrl])

  const embedCode = `<iframe src="${typeof window !== 'undefined' ? window.location.origin : ''}/api/v1/embed/${slug}?style=minimal" width="300" height="60" frameborder="0" style="border-radius: 8px; border: 1px solid #27272a;"></iframe>`

  const handleCopyEmbed = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(embedCode)
    } catch {
      const input = document.createElement('input')
      input.value = embedCode
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setToastVisible(true)
    setTimeout(() => setToastVisible(false), 3000)
  }, [embedCode])

  return (
    <div className="space-y-3">
      <div className="relative flex items-center gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            'inline-flex h-8 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-all duration-200',
            copied
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
              : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
          )}
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              Copied
            </>
          ) : (
            <>
              <Link2 className="h-3.5 w-3.5" />
              Copy Link
            </>
          )}
        </button>

        <button
          type="button"
          onClick={shareTwitter}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
          aria-label="Share on X (Twitter)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={shareLinkedIn}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
          aria-label="Share on LinkedIn"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        </button>

        <button
          type="button"
          onClick={() => setShowEmbed(!showEmbed)}
          className={cn(
            'inline-flex h-8 w-8 items-center justify-center rounded-lg border transition-colors',
            showEmbed
              ? 'border-amber-500/50 bg-amber-500/10 text-amber-400'
              : 'border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
          )}
          aria-label="Get embed code"
        >
          <Code2 className="h-3.5 w-3.5" />
        </button>

        <a
          href={`/api/v1/social-card/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-2.5 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-200"
        >
          <ExternalLink className="h-3 w-3" />
          Card
        </a>

        {toastVisible && (
          <div className="absolute -bottom-10 left-0 z-50 animate-in fade-in slide-in-from-top-1 rounded-md bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 shadow-lg">
            {copied ? 'Link copied to clipboard' : 'Embed code copied to clipboard'}
          </div>
        )}
      </div>

      {/* Social card preview */}
      <div className="overflow-hidden rounded-lg border border-zinc-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`/api/v1/social-card/${slug}`}
          alt={`${portfolioName} social card`}
          className="w-full"
        />
      </div>

      {/* Embed code section */}
      {showEmbed && (
        <div className="space-y-2 rounded-lg border border-zinc-800 bg-zinc-900 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-400">Embed Code</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyEmbed}
              className="h-6 text-xs text-zinc-500 hover:text-zinc-300"
            >
              Copy
            </Button>
          </div>
          <code className="block overflow-x-auto whitespace-nowrap rounded bg-zinc-950 px-3 py-2 text-[11px] text-zinc-400">
            {embedCode}
          </code>
        </div>
      )}
    </div>
  )
}
