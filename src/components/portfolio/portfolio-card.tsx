import Link from 'next/link'
import { MapPin, Star, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface PortfolioCardProps {
  portfolio: {
    id: string
    name: string
    slug: string
    title?: string | null
    avatarUrl?: string | null
    portfolioUrl: string
    description?: string | null
    location?: string | null
    experienceLevel: string
    health: string
    framework?: string | null
    language?: string | null
    featured: boolean
    verified: boolean
    technologies?: { id: string; name: string; slug: string }[]
    score?: {
      overallScore: number
      performanceScore: number
      accessibilityScore: number
      seoScore: number
    } | null
  }
  compareMode?: boolean
  selected?: boolean
  onToggleCompare?: (id: string) => void
}

function getInitials(name: string) {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getScoreColor(score: number) {
  if (score >= 90) return 'text-emerald-400 bg-emerald-500/10'
  if (score >= 70) return 'text-yellow-400 bg-yellow-500/10'
  if (score >= 50) return 'text-orange-400 bg-orange-500/10'
  return 'text-red-400 bg-red-500/10'
}

function getHealthDot(health: string) {
  switch (health) {
    case 'healthy':
      return 'bg-emerald-500'
    case 'needs_attention':
      return 'bg-yellow-500'
    case 'offline':
      return 'bg-red-500'
    default:
      return 'bg-zinc-500'
  }
}

export function PortfolioCard({
  portfolio,
  compareMode = false,
  selected = false,
  onToggleCompare,
}: PortfolioCardProps) {
  return (
    <Link href={`/p/${portfolio.slug}`} className="group block">
      <div
        className={cn(
          'relative flex h-full flex-col rounded-xl border bg-zinc-900 p-5 transition-all duration-200',
          portfolio.featured
            ? 'border-amber-500/40 shadow-lg shadow-amber-500/5'
            : 'border-zinc-800',
          'hover:border-amber-500/30 hover:-translate-y-0.5',
          selected && 'ring-2 ring-amber-500/50'
        )}
      >
        {/* Top: Featured badge */}
        {portfolio.featured && (
          <div className="absolute -top-px left-6">
            <Badge className="bg-amber-500 text-zinc-950 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-b-md rounded-t-none border-0">
              <Star className="mr-1 h-2.5 w-2.5" />
              Featured
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3.5">
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {portfolio.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={portfolio.avatarUrl}
                alt={portfolio.name}
                className="h-11 w-11 rounded-full object-cover ring-2 ring-zinc-800"
              />
            ) : (
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-amber-500/20 to-amber-600/40 ring-2 ring-zinc-800">
                <span className="text-sm font-bold text-amber-400">
                  {getInitials(portfolio.name)}
                </span>
              </div>
            )}
            {/* Health dot */}
            <span
              className={cn(
                'absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-zinc-900',
                getHealthDot(portfolio.health)
              )}
            />
          </div>

          {/* Name + title */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-zinc-100 group-hover:text-amber-400 transition-colors">
                {portfolio.name}
              </h3>
              {portfolio.verified && (
                <span title="Verified portfolio">
                  <CheckCircle2 className="h-3.5 w-3.5 flex-shrink-0 text-amber-400" />
                </span>
              )}
            </div>
            {portfolio.title && (
              <p className="truncate text-xs text-zinc-500 mt-0.5">
                {portfolio.title}
              </p>
            )}
          </div>

          {/* Compare checkbox */}
          {compareMode && (
            <button
              type="button"
              onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                onToggleCompare?.(portfolio.id)
              }}
              className={cn(
                'flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-colors',
                selected
                  ? 'border-amber-500 bg-amber-500'
                  : 'border-zinc-600 bg-zinc-800 hover:border-zinc-500'
              )}
            >
              {selected && (
                <svg className="h-3 w-3 text-zinc-950" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </button>
          )}
        </div>

        {/* Description */}
        {portfolio.description && (
          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-zinc-400">
            {portfolio.description}
          </p>
        )}

        {/* Location + experience */}
        <div className="mt-3 flex items-center gap-2 text-[11px] text-zinc-500">
          {portfolio.location && (
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {portfolio.location}
            </span>
          )}
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
            {portfolio.experienceLevel}
          </Badge>
        </div>

        {/* Spacer to push bottom content down */}
        <div className="flex-1" />

        {/* Technologies */}
        {portfolio.technologies && portfolio.technologies.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {portfolio.technologies.slice(0, 5).map(tech => (
              <span
                key={tech.id}
                className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-400 border border-zinc-700/50"
              >
                {tech.name}
              </span>
            ))}
            {portfolio.technologies.length > 5 && (
              <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-medium text-zinc-500">
                +{portfolio.technologies.length - 5}
              </span>
            )}
          </div>
        )}

        {/* Bottom: Score */}
        {portfolio.score && (
          <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
            <div className="flex items-center gap-3 text-[10px] text-zinc-500">
              <span>
                Perf {portfolio.score.performanceScore}
              </span>
              <span>
                A11y {portfolio.score.accessibilityScore}
              </span>
              <span>
                SEO {portfolio.score.seoScore}
              </span>
            </div>
            <div
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-xs font-bold tabular-nums',
                getScoreColor(portfolio.score.overallScore)
              )}
            >
              {portfolio.score.overallScore}
            </div>
          </div>
        )}
      </div>
    </Link>
  )
}
