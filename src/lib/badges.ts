export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  criteria: (portfolio: any) => boolean
}

export const BADGES: Badge[] = [
  {
    id: 'featured',
    name: 'Featured Portfolio',
    description: 'Hand-picked by the Developer Portfolio team for outstanding quality.',
    icon: 'Star',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    criteria: (p) => p.featured === true,
  },
  {
    id: 'performance',
    name: 'Performance Excellence',
    description: 'Blazing fast load times and optimized Core Web Vitals.',
    icon: 'Zap',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    criteria: (p) => (p.score?.performanceScore ?? 0) >= 90,
  },
  {
    id: 'accessibility',
    name: 'Accessibility Excellence',
    description: 'Fully accessible to all users, including assistive technologies.',
    icon: 'Eye',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    criteria: (p) => (p.score?.accessibilityScore ?? 0) >= 90,
  },
  {
    id: 'seo',
    name: 'SEO Excellence',
    description: 'Optimized for search engines with strong discoverability.',
    icon: 'Search',
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/20',
    criteria: (p) => (p.score?.seoScore ?? 0) >= 90,
  },
  {
    id: 'rising-star',
    name: 'Rising Star',
    description: 'Outstanding portfolio submitted within the last 30 days.',
    icon: 'Rocket',
    color: 'text-pink-400',
    bgColor: 'bg-pink-500/10',
    borderColor: 'border-pink-500/20',
    criteria: (p) => {
      if ((p.score?.overallScore ?? 0) < 80) return false
      const submitted = new Date(p.submittedAt)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return submitted >= thirtyDaysAgo
    },
  },
  {
    id: 'community-pick',
    name: 'Community Pick',
    description: 'Beloved by the community for exceptional content quality.',
    icon: 'Heart',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    criteria: (p) => (p.score?.contentScore ?? 0) >= 90,
  },
  {
    id: 'hidden-gem',
    name: 'Hidden Gem',
    description: 'High quality portfolio with consistently fast response times.',
    icon: 'Gem',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    criteria: (p) => {
      if ((p.score?.overallScore ?? 0) < 85) return false
      const healthCheck = p.latestHealthCheck ?? p.healthChecks?.[0]
      return healthCheck != null && healthCheck.responseTime < 500
    },
  },
  {
    id: 'well-maintained',
    name: 'Well Maintained',
    description: 'Actively monitored and consistently online.',
    icon: 'ShieldCheck',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    criteria: (p) => p.health === 'healthy',
  },
]

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function getPortfolioBadges(portfolio: any): Badge[] {
  return BADGES.filter((badge) => badge.criteria(portfolio))
}
