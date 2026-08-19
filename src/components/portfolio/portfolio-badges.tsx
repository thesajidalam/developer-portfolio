import {
  Star,
  Zap,
  Eye,
  Search,
  Rocket,
  Heart,
  Gem,
  ShieldCheck,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getPortfolioBadges, type Badge } from '@/lib/badges'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Star,
  Zap,
  Eye,
  Search,
  Rocket,
  Heart,
  Gem,
  ShieldCheck,
}

interface PortfolioBadgesProps {
  portfolio: {
    featured: boolean
    health: string
    submittedAt: Date | string
    score?: {
      performanceScore: number
      accessibilityScore: number
      seoScore: number
      contentScore: number
      overallScore: number
    } | null
    latestHealthCheck?: {
      responseTime: number
    } | null
    healthChecks?: {
      responseTime: number
    }[]
  } | null
  className?: string
}

function BadgeChip({ badge }: { badge: Badge }) {
  const Icon = iconMap[badge.icon]

  return (
    <Tooltip>
      <TooltipTrigger>
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors',
            badge.bgColor,
            badge.borderColor,
            badge.color,
          )}
        >
          {Icon && <Icon className="h-3 w-3" />}
          {badge.name}
        </span>
      </TooltipTrigger>
      <TooltipContent side="bottom" className="max-w-[220px] text-xs">
        {badge.description}
      </TooltipContent>
    </Tooltip>
  )
}

export function PortfolioBadges({ portfolio, className }: PortfolioBadgesProps) {
  if (!portfolio) return null

  const badges = getPortfolioBadges(portfolio)

  if (badges.length === 0) return null

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {badges.map((badge) => (
        <BadgeChip key={badge.id} badge={badge} />
      ))}
    </div>
  )
}
