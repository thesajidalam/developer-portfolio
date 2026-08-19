import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { PortfolioCard } from '@/components/portfolio/portfolio-card'
import { Skeleton } from '@/components/ui/skeleton'

interface Portfolio {
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

interface DiscoverySectionProps {
  title: string
  icon: React.ReactNode
  portfolios: Portfolio[]
  seeAllHref?: string
  loading?: boolean
}

function CardSkeleton() {
  return (
    <div className="w-[320px] min-w-[320px] flex-shrink-0 sm:w-[340px] sm:min-w-[340px]">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
        <div className="flex items-start gap-3.5">
          <Skeleton className="h-11 w-11 rounded-full bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-28 bg-zinc-800" />
            <Skeleton className="h-3 w-20 bg-zinc-800" />
          </div>
        </div>
        <Skeleton className="mt-3 h-8 w-full bg-zinc-800" />
        <div className="mt-4 flex gap-1.5">
          <Skeleton className="h-5 w-14 rounded-md bg-zinc-800" />
          <Skeleton className="h-5 w-16 rounded-md bg-zinc-800" />
          <Skeleton className="h-5 w-12 rounded-md bg-zinc-800" />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
          <Skeleton className="h-3 w-24 bg-zinc-800" />
          <Skeleton className="h-6 w-8 rounded-md bg-zinc-800" />
        </div>
      </div>
    </div>
  )
}

export function DiscoverySection({
  title,
  icon,
  portfolios,
  seeAllHref,
  loading = false,
}: DiscoverySectionProps) {
  if (loading) {
    return (
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded bg-zinc-800" />
          <Skeleton className="h-5 w-32 bg-zinc-800" />
        </div>
        <div className="scrollbar-thin -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {Array.from({ length: 5 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </section>
    )
  }

  if (portfolios.length === 0) return null

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-zinc-100">
          {icon}
          {title}
        </h2>
        {seeAllHref && (
          <Link
            href={seeAllHref}
            className="flex items-center gap-1 text-xs font-medium text-amber-500 hover:text-amber-400 transition-colors"
          >
            See all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>

      <div className="scrollbar-thin -mx-4 flex gap-4 overflow-x-auto px-4 pb-4 snap-x snap-mandatory sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
        {portfolios.map(portfolio => (
          <div
            key={portfolio.id}
            className="w-[320px] min-w-[320px] snap-start flex-shrink-0 sm:w-[340px] sm:min-w-[340px]"
          >
            <PortfolioCard portfolio={portfolio} />
          </div>
        ))}
      </div>
    </section>
  )
}
