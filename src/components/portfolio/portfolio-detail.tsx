'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  MapPin,
  ExternalLink,
  Share2,
  ChevronRight,
  CheckCircle2,
  Gauge,
  Globe,
  Code2,
  Server,
} from 'lucide-react'
import { cn, getScoreColor, getHealthColor, getHealthLabel } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { PortfolioTabs } from '@/components/portfolio/portfolio-tabs'
import { HealthTimeline } from '@/components/portfolio/health-timeline'
import { WhyItStandsOut } from '@/components/portfolio/why-it-stands-out'

interface PortfolioDetailProps {
  portfolio: {
    id: string
    name: string
    slug: string
    title?: string | null
    avatarUrl?: string | null
    portfolioUrl: string
    githubUrl?: string | null
    socialLinks?: string | null
    description?: string | null
    location?: string | null
    experienceLevel: string
    health: string
    framework?: string | null
    language?: string | null
    hostingProvider?: string | null
    screenshotUrl?: string | null
    featured: boolean
    verified: boolean
    submittedAt: Date
    updatedAt: Date
    lastChecked?: Date | null
    technologies: { id: string; name: string; slug: string; category: string }[]
    categories: { id: string; name: string; slug: string }[]
    tags: { id: string; name: string; slug: string }[]
    score?: {
      id: string
      performanceScore: number
      accessibilityScore: number
      seoScore: number
      bestPracticesScore: number
      designScore: number
      contentScore: number
      overallScore: number
      calculatedAt: Date
      version: string
    } | null
    latestHealthCheck?: {
      id: string
      checkedAt: Date
      statusCode: number
      responseTime: number
      sslValid: boolean
      sslExpiry?: Date | null
      accessible: boolean
      details?: string | null
    } | null
    healthChecks: {
      id: string
      checkedAt: Date
      statusCode: number
      responseTime: number
      sslValid: boolean
      sslExpiry?: Date | null
      accessible: boolean
      details?: string | null
    }[]
  }
}

const experienceLabels: Record<string, string> = {
  junior: 'Junior',
  mid: 'Mid-Level',
  senior: 'Senior',
  lead: 'Lead',
  principal: 'Principal',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function parseSocialLinks(socialLinks?: string | null): Record<string, string> {
  if (!socialLinks) return {}
  try {
    return JSON.parse(socialLinks)
  } catch {
    return {}
  }
}

function ScoreBar({
  label,
  score,
  max = 100,
  automated = true,
}: {
  label: string
  score: number
  max?: number
  automated?: boolean
}) {
  const percentage = Math.round((score / max) * 100)
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-zinc-300">{label}</span>
        <div className="flex items-center gap-2">
          <span className={cn('text-xs font-bold tabular-nums', getScoreColor(score))}>
            {Math.round(score)}
          </span>
          <span className="text-[10px] text-zinc-600">
            {automated ? 'Auto' : 'Editorial'}
          </span>
        </div>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            score >= 90
              ? 'bg-emerald-500'
              : score >= 70
                ? 'bg-yellow-500'
                : score >= 50
                  ? 'bg-orange-500'
                  : 'bg-red-500'
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function ScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 12) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          className="text-zinc-800"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn(
            score >= 90
              ? 'text-emerald-500'
              : score >= 70
                ? 'text-yellow-500'
                : score >= 50
                  ? 'text-orange-500'
                  : 'text-red-500'
          )}
          style={{ transition: 'stroke-dashoffset 0.8s ease-out' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('text-2xl font-bold tabular-nums', getScoreColor(score))}>
          {Math.round(score)}
        </span>
        <span className="text-[10px] text-zinc-500">Overall</span>
      </div>
    </div>
  )
}

const validTabs = ['overview', 'scores', 'preview', 'technical', 'health']

function getInitialTab() {
  if (typeof window === 'undefined') return 'overview'
  const hash = window.location.hash.replace('#', '')
  return validTabs.includes(hash) ? hash : 'overview'
}

export function PortfolioDetail({ portfolio }: PortfolioDetailProps) {
  const [activeTab, setActiveTab] = useState(getInitialTab)
  const socialLinks = parseSocialLinks(portfolio.socialLinks)

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    window.history.replaceState(null, '', `#${tab}`)
  }, [])

  const handleShare = useCallback(async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({ title: portfolio.name, url })
      } catch {
        await navigator.clipboard.writeText(url)
      }
    } else {
      await navigator.clipboard.writeText(url)
    }
  }, [portfolio.name])

  return (
    <div className="min-h-screen">
      {/* Breadcrumb */}
      <div className="border-b border-zinc-800/60 bg-zinc-950/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="flex h-12 items-center gap-1.5 text-xs text-zinc-500">
            <Link href="/" className="transition-colors hover:text-zinc-300">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/explore" className="transition-colors hover:text-zinc-300">
              Explore
            </Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-zinc-300">{portfolio.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <div className="relative border-b border-zinc-800/60">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {portfolio.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={portfolio.avatarUrl}
                  alt={portfolio.name}
                  className="h-20 w-20 rounded-2xl object-cover ring-2 ring-zinc-800"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/40 ring-2 ring-zinc-800">
                  <span className="text-2xl font-bold text-amber-400">
                    {getInitials(portfolio.name)}
                  </span>
                </div>
              )}
              <span
                className={cn(
                  'absolute -bottom-1 -right-1 h-4 w-4 rounded-full ring-2 ring-zinc-950',
                  getHealthColor(portfolio.health)
                )}
              />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-zinc-50">{portfolio.name}</h1>
                {portfolio.verified && (
                  <Tooltip>
                    <TooltipTrigger>
                      <CheckCircle2 className="h-5 w-5 text-amber-400" />
                    </TooltipTrigger>
                    <TooltipContent>Verified portfolio</TooltipContent>
                  </Tooltip>
                )}
                {portfolio.featured && (
                  <Badge className="bg-amber-500 text-zinc-950 text-[10px] font-bold uppercase tracking-wider">
                    Featured
                  </Badge>
                )}
              </div>

              {portfolio.title && (
                <p className="mt-1 text-sm text-zinc-400">{portfolio.title}</p>
              )}

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-zinc-500">
                {portfolio.location && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {portfolio.location}
                  </span>
                )}
                <Badge variant="secondary" className="text-[10px]">
                  {experienceLabels[portfolio.experienceLevel] ?? portfolio.experienceLevel}
                </Badge>
                <span className="inline-flex items-center gap-1">
                  <span
                    className={cn('h-2 w-2 rounded-full', getHealthColor(portfolio.health))}
                  />
                  {getHealthLabel(portfolio.health)}
                </span>
              </div>

              {/* Social links */}
              <div className="mt-3 flex items-center gap-2">
                {portfolio.githubUrl && (
                  <a
                    href={portfolio.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                    aria-label="GitHub"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                    </svg>
                  </a>
                )}
                {socialLinks.twitter && (
                  <a
                    href={socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                    aria-label="Twitter / X"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a
                    href={socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-800 text-zinc-400 transition-colors hover:border-zinc-700 hover:text-zinc-200"
                    aria-label="LinkedIn"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <a href={portfolio.portfolioUrl} target="_blank" rel="noopener noreferrer">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-zinc-700 text-zinc-300 hover:text-zinc-50"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  Visit Portfolio
                </Button>
              </a>
              <Link href={`/compare?ids=${portfolio.id}`}>
                <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:text-zinc-50">
                  <Globe className="mr-1.5 h-3.5 w-3.5" />
                  Compare
                </Button>
              </Link>
              <Button
                variant="outline"
                size="sm"
                className="border-zinc-700 text-zinc-300 hover:text-zinc-50"
                onClick={handleShare}
              >
                <Share2 className="mr-1.5 h-3.5 w-3.5" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-16 z-30 border-b border-zinc-800/60 bg-zinc-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <PortfolioTabs activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Score + Why It Stands Out side by side */}
            <div className="grid gap-6 lg:grid-cols-3">
              {portfolio.score && (
                <Card className="lg:col-span-1 border-zinc-800 bg-zinc-900/50">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
                      <Gauge className="h-4 w-4 text-amber-500" />
                      Overall Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex justify-center pt-0">
                    <ScoreRing score={portfolio.score.overallScore} />
                  </CardContent>
                </Card>
              )}
              <div className={cn('lg:col-span-2', !portfolio.score && 'lg:col-span-3')}>
                <WhyItStandsOut score={portfolio.score} />
              </div>
            </div>

            {/* Description */}
            {portfolio.description && (
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-zinc-300">About</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm leading-relaxed text-zinc-400">
                    {portfolio.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Technologies & Tags */}
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
                  <Code2 className="h-4 w-4 text-amber-500" />
                  Technologies &amp; Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-0">
                {portfolio.technologies.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Technologies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {portfolio.technologies.map(tech => (
                        <span
                          key={tech.id}
                          className="rounded-md bg-zinc-800/80 px-2.5 py-1 text-xs font-medium text-zinc-300 border border-zinc-700/50"
                        >
                          {tech.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {portfolio.tags.length > 0 && (
                  <div>
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-zinc-500">
                      Tags
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {portfolio.tags.map(tag => (
                        <Badge key={tag.id} variant="secondary" className="text-[11px]">
                          {tag.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {portfolio.technologies.length === 0 && portfolio.tags.length === 0 && (
                  <p className="text-xs text-zinc-600">No technologies or tags added yet.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'scores' && (
          <div className="space-y-6">
            {portfolio.score ? (
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
                    <Gauge className="h-4 w-4 text-amber-500" />
                    Score Breakdown
                  </CardTitle>
                  <p className="text-xs text-zinc-500">
                    Scores are calculated using both automated analysis and editorial review.
                  </p>
                </CardHeader>
                <CardContent className="space-y-5 pt-0">
                  <div className="flex justify-center pb-2">
                    <ScoreRing score={portfolio.score.overallScore} size={140} />
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ScoreBar label="Performance" score={portfolio.score.performanceScore} automated />
                    <ScoreBar label="Accessibility" score={portfolio.score.accessibilityScore} automated />
                    <ScoreBar label="SEO" score={portfolio.score.seoScore} automated />
                    <ScoreBar label="Best Practices" score={portfolio.score.bestPracticesScore} automated />
                    <ScoreBar label="Design" score={portfolio.score.designScore} automated={false} />
                    <ScoreBar label="Content" score={portfolio.score.contentScore} automated={false} />
                  </div>
                  <Separator className="bg-zinc-800" />
                  <div className="rounded-lg bg-zinc-800/40 p-4">
                    <h4 className="mb-2 text-xs font-semibold text-zinc-300">Methodology</h4>
                    <p className="text-xs leading-relaxed text-zinc-500">
                      Automated scores (Performance, Accessibility, SEO, Best Practices) are derived
                      from Lighthouse and similar tooling. Editorial scores (Design, Content) are
                      assessed by the DevBeacon team. The overall score is a weighted average of all
                      dimensions.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Gauge className="h-10 w-10 text-zinc-700" />
                  <p className="mt-3 text-sm text-zinc-500">No scores available yet.</p>
                  <p className="text-xs text-zinc-600">
                    Scores will appear once the portfolio is analyzed.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'preview' && (
          <Card className="border-zinc-800 bg-zinc-900/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
                <Globe className="h-4 w-4 text-amber-500" />
                Portfolio Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {portfolio.screenshotUrl ? (
                <div className="overflow-hidden rounded-lg border border-zinc-800">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={portfolio.screenshotUrl}
                    alt={`Screenshot of ${portfolio.name}`}
                    className="w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-800/30 py-16">
                  <Globe className="h-10 w-10 text-zinc-700" />
                  <p className="mt-3 text-sm text-zinc-500">No screenshot available.</p>
                  <a
                    href={portfolio.portfolioUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 text-xs text-amber-500 hover:text-amber-400 transition-colors"
                  >
                    Visit the live portfolio →
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeTab === 'technical' && (
          <div className="space-y-6">
            <Card className="border-zinc-800 bg-zinc-900/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
                  <Server className="h-4 w-4 text-amber-500" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {portfolio.framework && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Framework
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-200">
                        {portfolio.framework}
                      </p>
                    </div>
                  )}
                  {portfolio.language && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Language
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-200">
                        {portfolio.language}
                      </p>
                    </div>
                  )}
                  {portfolio.hostingProvider && (
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Hosting
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-200">
                        {portfolio.hostingProvider}
                      </p>
                    </div>
                  )}
                </div>
                {!portfolio.framework && !portfolio.language && !portfolio.hostingProvider && (
                  <p className="text-xs text-zinc-600">No technical details available.</p>
                )}
              </CardContent>
            </Card>

            {portfolio.latestHealthCheck && (
              <Card className="border-zinc-800 bg-zinc-900/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-sm text-zinc-300">
                    <CheckCircle2 className="h-4 w-4 text-amber-500" />
                    Latest Health Check
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Status
                      </p>
                      <p className={cn(
                        'mt-1 text-sm font-medium',
                        portfolio.latestHealthCheck.statusCode < 400
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      )}>
                        HTTP {portfolio.latestHealthCheck.statusCode}
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Response Time
                      </p>
                      <p className="mt-1 text-sm font-medium text-zinc-200">
                        {portfolio.latestHealthCheck.responseTime}ms
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        SSL
                      </p>
                      <p className={cn(
                        'mt-1 text-sm font-medium',
                        portfolio.latestHealthCheck.sslValid
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      )}>
                        {portfolio.latestHealthCheck.sslValid ? 'Valid' : 'Invalid'}
                      </p>
                    </div>
                    <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">
                        Accessible
                      </p>
                      <p className={cn(
                        'mt-1 text-sm font-medium',
                        portfolio.latestHealthCheck.accessible
                          ? 'text-emerald-400'
                          : 'text-red-400'
                      )}>
                        {portfolio.latestHealthCheck.accessible ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'health' && (
          <HealthTimeline
            healthChecks={portfolio.healthChecks ?? []}
          />
        )}
      </div>
    </div>
  )
}
