import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { ComparisonView } from '@/components/comparison/comparison-view'

export const metadata: Metadata = {
  title: 'Compare Portfolios — Developer Portfolio',
}

export default async function ComparePage() {
  const portfolios = await db.portfolio.findMany({
    where: { status: 'approved' },
    include: {
      score: true,
      technologies: { include: { technology: true } },
    },
    orderBy: { name: 'asc' },
  })

  const serialized = portfolios.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    title: p.title,
    avatarUrl: p.avatarUrl,
    health: p.health,
    framework: p.framework,
    hostingProvider: p.hostingProvider,
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
            Compare Portfolios
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Select 2–4 portfolios to compare side by side
          </p>
        </div>

        <ComparisonView portfolios={serialized} />
      </div>
    </div>
  )
}
