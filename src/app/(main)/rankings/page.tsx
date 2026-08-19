import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { RankingTabs } from '@/components/comparison/ranking-tabs'

export const metadata: Metadata = {
  title: 'Rankings — Developer Portfolio',
}

export default async function RankingsPage() {
  const topPortfolios = await db.portfolio.findMany({
    where: { status: 'approved' },
    include: {
      score: true,
      technologies: { include: { technology: true } },
    },
    orderBy: { score: { overallScore: 'desc' } },
    take: 50,
  })

  const serialized = topPortfolios.map((p, i) => ({
    rank: i + 1,
    id: p.id,
    name: p.name,
    slug: p.slug,
    title: p.title,
    avatarUrl: p.avatarUrl,
    health: p.health,
    featured: p.featured,
    verified: p.verified,
    experienceLevel: p.experienceLevel,
    technologies: p.technologies.map(pt => pt.technology.name),
    score: p.score
      ? {
          overallScore: p.score.overallScore,
          performanceScore: p.score.performanceScore,
          accessibilityScore: p.score.accessibilityScore,
          seoScore: p.score.seoScore,
          bestPracticesScore: p.score.bestPracticesScore,
          designScore: p.score.designScore,
          contentScore: p.score.contentScore,
        }
      : null,
  }))

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-50">
            Rankings
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Portfolios ranked by overall score
          </p>
        </div>

        <RankingTabs rankings={serialized} />
      </div>
    </div>
  )
}
