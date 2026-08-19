import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { PortfolioDetail } from '@/components/portfolio/portfolio-detail'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function PortfolioPage({ params }: PageProps) {
  const { slug } = await params

  const portfolio = await db.portfolio.findUnique({
    where: { slug },
    include: {
      technologies: { include: { technology: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      score: true,
      healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 },
    },
  })

  if (!portfolio) {
    notFound()
  }

  const latestHealthCheck = portfolio.healthChecks[0] ?? null
  const latestScore = portfolio.score ?? null

  return (
    <PortfolioDetail
      portfolio={{
        ...portfolio,
        score: latestScore,
        latestHealthCheck,
        technologies: portfolio.technologies.map((pt: { technology: { id: string; name: string; slug: string; category?: string } }) => ({
          ...pt.technology,
          category: pt.technology.category ?? 'tool',
        })),
        categories: portfolio.categories.map((pc: { category: { id: string; name: string; slug: string } }) => pc.category),
        tags: portfolio.tags.map((pt: { tag: { id: string; name: string; slug: string } }) => pt.tag),
      }}
    />
  )
}
