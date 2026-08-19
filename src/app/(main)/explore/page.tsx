import type { Metadata } from 'next'
import { Suspense } from 'react'
import { db } from '@/lib/db'
import { getTrendingPortfolios, getRisingPortfolios, getHiddenGems } from '@/lib/discovery'
import { ExploreHeader } from '@/components/explore/explore-header'
import { ExploreClient } from '@/components/explore/explore-client'

export const metadata: Metadata = {
  title: 'Explore Portfolios — Developer Portfolio',
}

export default async function ExplorePage() {
  const [
    portfolios,
    technologies,
    categories,
    trendingPortfolios,
    risingPortfolios,
    hiddenGems,
  ] = await Promise.all([
    db.portfolio.findMany({
      where: { status: 'approved' },
      include: {
        technologies: { include: { technology: true } },
        categories: { include: { category: true } },
        score: true,
      },
      orderBy: { submittedAt: 'desc' },
    }),
    db.technology.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { portfolios: true } } },
    }),
    db.category.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { portfolios: true } } },
    }),
    getTrendingPortfolios(8),
    getRisingPortfolios(8),
    getHiddenGems(8),
  ])

  const serializedPortfolios = portfolios.map(p => ({
    ...p,
    submittedAt: p.submittedAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    lastChecked: p.lastChecked?.toISOString() ?? null,
    technologies: p.technologies.map(pt => pt.technology),
    categories: p.categories.map(pc => pc.category),
    score: p.score
      ? {
          ...p.score,
          calculatedAt: p.score.calculatedAt.toISOString(),
        }
      : null,
  }))

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <ExploreHeader total={portfolios.length} />

        <div className="mt-8">
          <Suspense fallback={<div className="text-zinc-400">Loading...</div>}>
            <ExploreClient
            portfolios={serializedPortfolios}
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
            trendingPortfolios={trendingPortfolios}
            risingPortfolios={risingPortfolios}
            hiddenGems={hiddenGems}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
