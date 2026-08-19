import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { ExploreHeader } from '@/components/explore/explore-header'
import { ExploreFilters } from '@/components/explore/explore-filters'
import { PortfolioGrid } from '@/components/explore/portfolio-grid'

export const metadata: Metadata = {
  title: 'Explore Portfolios — DevBeacon',
}

const PAGE_SIZE = 12

export default async function ExplorePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const search = typeof params.search === 'string' ? params.search : undefined
  const techFilters = params.tech
    ? Array.isArray(params.tech)
      ? params.tech
      : params.tech.split(',').filter(Boolean)
    : []
  const categoryFilters = params.category
    ? Array.isArray(params.category)
      ? params.category
      : params.category.split(',').filter(Boolean)
    : []
  const experienceFilters = params.experience
    ? Array.isArray(params.experience)
      ? params.experience
      : params.experience.split(',').filter(Boolean)
    : []
  const healthFilters = params.health
    ? Array.isArray(params.health)
      ? params.health
      : params.health.split(',').filter(Boolean)
    : []
  const sort = typeof params.sort === 'string' ? params.sort : 'newest'
  const page = Math.max(1, parseInt(typeof params.page === 'string' ? params.page : '1', 10) || 1)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    status: 'approved',
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { title: { contains: search } },
      { description: { contains: search } },
      { location: { contains: search } },
    ]
  }

  if (techFilters.length > 0) {
    where.technologies = {
      some: {
        technology: {
          slug: { in: techFilters },
        },
      },
    }
  }

  if (categoryFilters.length > 0) {
    where.categories = {
      some: {
        category: {
          slug: { in: categoryFilters },
        },
      },
    }
  }

  if (experienceFilters.length > 0) {
    where.experienceLevel = { in: experienceFilters }
  }

  if (healthFilters.length > 0) {
    where.health = { in: healthFilters }
  }

  const orderBy = (() => {
    switch (sort) {
      case 'oldest':
        return { submittedAt: 'asc' as const }
      case 'name':
        return { name: 'asc' as const }
      case 'featured':
        return { submittedAt: 'desc' as const }
      default:
        return { submittedAt: 'desc' as const }
    }
  })()

  const isScoreSort = sort === 'score'

  const [portfolios, total, technologies, categories] = await Promise.all([
    isScoreSort
      ? db.portfolio.findMany({
          where,
          include: {
            technologies: { include: { technology: true } },
            categories: { include: { category: true } },
            score: true,
          },
          take: 100,
        })
      : db.portfolio.findMany({
          where,
          include: {
            technologies: { include: { technology: true } },
            categories: { include: { category: true } },
            score: true,
          },
          orderBy,
          skip: (page - 1) * PAGE_SIZE,
          take: PAGE_SIZE,
        }),
    db.portfolio.count({ where }),
    db.technology.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { portfolios: true } },
      },
    }),
    db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: {
        _count: { select: { portfolios: true } },
      },
    }),
  ])

  const serializedPortfolios = portfolios.map(p => ({
    ...p,
    technologies: p.technologies.map(pt => pt.technology),
    categories: p.categories.map(pc => pc.category),
    score: p.score || null,
  }))

  let displayedPortfolios = serializedPortfolios

  if (isScoreSort) {
    displayedPortfolios = serializedPortfolios
      .sort((a, b) => {
        const scoreA = a.score?.overallScore ?? 0
        const scoreB = b.score?.overallScore ?? 0
        return scoreB - scoreA
      })
      .slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  }

  const queryStringParts: string[] = []
  if (search) queryStringParts.push(`search=${encodeURIComponent(search)}`)
  if (techFilters.length > 0) queryStringParts.push(`tech=${techFilters.join(',')}`)
  if (categoryFilters.length > 0) queryStringParts.push(`category=${categoryFilters.join(',')}`)
  if (experienceFilters.length > 0) queryStringParts.push(`experience=${experienceFilters.join(',')}`)
  if (healthFilters.length > 0) queryStringParts.push(`health=${healthFilters.join(',')}`)
  if (sort !== 'newest') queryStringParts.push(`sort=${sort}`)
  const queryString = queryStringParts.join('&')

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ExploreHeader total={total} />

        <div className="mt-8 flex flex-col gap-8 lg:flex-row">
          <ExploreFilters
            technologies={technologies.map(t => ({
              slug: t.slug,
              name: t.name,
              count: t._count.portfolios,
            }))}
            categories={categories.map(c => ({
              slug: c.slug,
              name: c.name,
              count: c._count.portfolios,
            }))}
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
            portfolios={isScoreSort ? displayedPortfolios : serializedPortfolios}
            total={total}
            page={page}
            pageSize={PAGE_SIZE}
            queryString={queryString}
          />
        </div>
      </div>
    </div>
  )
}
