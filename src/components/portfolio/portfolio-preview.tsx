'use client'

import { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ExternalLink, Monitor, Tablet, Smartphone } from 'lucide-react'

interface PortfolioPreviewProps {
  url: string
  title: string
  className?: string
}

type DeviceSize = 'desktop' | 'tablet' | 'mobile'

const deviceWidths: Record<DeviceSize, string> = {
  desktop: 'w-full',
  tablet: 'w-[768px]',
  mobile: 'w-[375px]',
}

const deviceIcons: Record<DeviceSize, typeof Monitor> = {
  desktop: Monitor,
  tablet: Tablet,
  mobile: Smartphone,
}

export function PortfolioPreview({ url, title, className }: PortfolioPreviewProps) {
  const [device, setDevice] = useState<DeviceSize>('desktop')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  function handleLoad() {
    setLoading(false)
  }

  function handleError() {
    setLoading(false)
    setError(true)
  }

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      {/* Device switcher */}
      <div className="flex items-center gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1 self-center">
        {(Object.keys(deviceWidths) as DeviceSize[]).map(d => {
          const Icon = deviceIcons[d]
          return (
            <button
              key={d}
              type="button"
              onClick={() => {
                setDevice(d)
                setLoading(true)
                setError(false)
              }}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                device === d
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-500 hover:text-zinc-300'
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="capitalize">{d}</span>
            </button>
          )
        })}
      </div>

      {/* Preview frame */}
      <div className="mx-auto w-full overflow-hidden">
        <div
          className={cn(
            'mx-auto overflow-hidden rounded-xl border border-zinc-700 bg-zinc-800 shadow-2xl transition-all duration-300',
            deviceWidths[device],
            device === 'mobile' && 'rounded-[2rem] border-[3px] border-zinc-700',
            device === 'tablet' && 'rounded-2xl border-2 border-zinc-700'
          )}
        >
          {/* Frame top bar */}
          <div className="flex h-8 items-center gap-1.5 border-b border-zinc-700 bg-zinc-800 px-3">
            <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/60" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
            <span className="ml-2 flex-1 truncate rounded bg-zinc-700/50 px-2 py-0.5 text-[10px] text-zinc-400">
              {url}
            </span>
          </div>

          {/* Iframe area */}
          <div className="relative bg-white" style={{ aspectRatio: device === 'mobile' ? '9/16' : '16/9' }}>
            {/* Loading skeleton */}
            {loading && !error && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-100">
                <div className="flex flex-col items-center gap-3">
                  <Skeleton className="h-8 w-32 rounded bg-zinc-200" />
                  <Skeleton className="h-4 w-48 rounded bg-zinc-200" />
                  <Skeleton className="h-4 w-40 rounded bg-zinc-200" />
                </div>
              </div>
            )}

            {/* Error state */}
            {error && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-50">
                <div className="flex flex-col items-center gap-3 px-6 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-200">
                    <ExternalLink className="h-5 w-5 text-zinc-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-700">
                      Preview unavailable
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      This site may restrict being embedded in iframes.
                    </p>
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-zinc-800"
                  >
                    Open in new tab
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={url}
              title={title}
              onLoad={handleLoad}
              onError={handleError}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              className={cn(
                'h-full w-full border-0',
                (loading || error) && 'pointer-events-none invisible'
              )}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
