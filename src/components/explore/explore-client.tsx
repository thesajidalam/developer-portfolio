'use client'

import { useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import { TrendingUp, Sparkles, Gem, Dices } from 'lucide-react'
import Link from 'next/link'
import { ExploreFilters } from './explore-filters'
import { PortfolioGrid } from './portfolio-grid'
import { DiscoverySection } from './discovery-section'
import { Button } from '@/components/ui/button'

const PAGE_SIZE = 12

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
  hostingProvider?: string | null
  featured: boolean
  verified: boolean
  submittedAt?: string | Date
  updatedAt?: string | Date
  technologies?: { id: string; name: string; slug: string }[]
  categories?: { id: string; name: string; slug: string }[]
  score?: {
    overallScore: number
    performanceScore?: number
    accessibilityScore?: number
    seoScore?: number
    bestPracticesScore?: number
    designScore?: number
    contentScore?: number
  } | null
}

interface FilterOption {
  slug: string
  name: string
  count: number
}

interface ExploreClientProps {
  portfolios: Portfolio[]
  technologies: FilterOption[]
  categories: FilterOption[]
  trendingPortfolios: Portfolio[]
  risingPortfolios: Portfolio[]
  hiddenGems: Portfolio[]
}

export function ExploreClient({
  portfolios,
  technologies,
  categories,
  trendingPortfolios,
  risingPortfolios,
  hiddenGems,
}: ExploreClientProps) {
  const searchParams = useSearchParams()

  const search = searchParams.get('search') ?? undefined
  const techFilters = searchParams.get('tech')?.split(',').filter(Boolean) ?? []
  const categoryFilters = searchParams.get('category')?.split(',').filter(Boolean) ?? []
  const experienceFilters = searchParams.get('experience')?.split(',').filter(Boolean) ?? []
  const healthFilters = searchParams.get('health')?.split(',').filter(Boolean) ?? []
  const sort = searchParams.get('sort') ?? 'newest'
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10) || 1)

  const showDiscovery =
    !search &&
    techFilters.length === 0 &&
    categoryFilters.length === 0 &&
    experienceFilters.length === 0 &&
    healthFilters.length === 0 &&
    sort === 'newest'

  const filtered = useMemo(() => {
    return portfolios.filter(p => {
      if (search) {
        const q = search.toLowerCase()
        if (
          !p.name.toLowerCase().includes(q) &&
          !p.title?.toLowerCase().includes(q) &&
          !p.description?.toLowerCase().includes(q) &&
          !p.location?.toLowerCase().includes(q)
        ) {
          return false
        }
      }
      if (techFilters.length > 0 && !p.technologies?.some(t => techFilters.includes(t.slug))) {
        return false
      }
      if (categoryFilters.length > 0 && !p.categories?.some(c => categoryFilters.includes(c.slug))) {
        return false
      }
      if (experienceFilters.length > 0 && !experienceFilters.includes(p.experienceLevel)) {
        return false
      }
      if (healthFilters.length > 0 && !healthFilters.includes(p.health)) {
        return false
      }
      return true
    })
  }, [portfolios, search, techFilters, categoryFilters, experienceFilters, healthFilters])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    switch (sort) {
      case 'score':
        arr.sort((a, b) => (b.score?.overallScore ?? 0) - (a.score?.overallScore ?? 0))
        break
      case 'oldest':
        arr.sort((a, b) => new Date(a.submittedAt ?? 0).getTime() - new Date(b.submittedAt ?? 0).getTime())
        break
      case 'name':
        arr.sort((a, b) => a.name.localeCompare(b.name))
        break
      default:
        arr.sort((a, b) => new Date(b.submittedAt ?? 0).getTime() - new Date(a.submittedAt ?? 0).getTime())
    }
    return arr
  }, [filtered, sort])

  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const queryString = useMemo(() => {
    const parts: string[] = []
    if (search) parts.push(`search=${encodeURIComponent(search)}`)
    if (techFilters.length > 0) parts.push(`tech=${techFilters.join(',')}`)
    if (categoryFilters.length > 0) parts.push(`category=${categoryFilters.join(',')}`)
    if (experienceFilters.length > 0) parts.push(`experience=${experienceFilters.join(',')}`)
    if (healthFilters.length > 0) parts.push(`health=${healthFilters.join(',')}`)
    if (sort !== 'newest') parts.push(`sort=${sort}`)
    return parts.join('&')
  }, [search, techFilters, categoryFilters, experienceFilters, healthFilters, sort])

  return (
    <>
      {showDiscovery && (
        <div className="space-y-8">
          {trendingPortfolios.length > 0 && (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <DiscoverySection
              title="Trending Now"
              icon={<TrendingUp className="h-5 w-5 text-amber-500" />}
              portfolios={trendingPortfolios as any}
              seeAllHref="/explore/?sort=trending"
            />
          )}
          {risingPortfolios.length > 0 && (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <DiscoverySection
              title="Rising Stars"
              icon={<Sparkles className="h-5 w-5 text-amber-500" />}
              portfolios={risingPortfolios as any}
              seeAllHref="/explore/?sort=newest"
            />
          )}
          {hiddenGems.length > 0 && (
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            <DiscoverySection
              title="Hidden Gems"
              icon={<Gem className="h-5 w-5 text-amber-500" />}
              portfolios={hiddenGems as any}
            />
          )}
          <div className="flex justify-center pt-2">
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-100"
            >
              <Link href="/explore/?sort=score">
                <Dices className="mr-1.5 h-3.5 w-3.5" />
                Random Portfolio
              </Link>
            </Button>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-8 lg:flex-row">
        <ExploreFilters
          technologies={technologies}
          categories={categories}
          activeFilters={{
            search,
            tech: techFilters,
            category: categoryFilters,
            experience: experienceFilters,
            health: healthFilters,
            sort,
          }}
        />
        <PortfolioGrid
          portfolios={paginated}
          total={sorted.length}
          page={page}
          pageSize={PAGE_SIZE}
          queryString={queryString}
        />
      </div>
    </>
  )
}
