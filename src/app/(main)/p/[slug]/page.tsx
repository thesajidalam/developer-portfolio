import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { notFound } from 'next/navigation'
import { PortfolioDetail } from '@/components/portfolio/portfolio-detail'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const portfolios = await db.portfolio.findMany({
    where: { status: 'approved' },
    select: { slug: true },
  })
  return portfolios.map(p => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const portfolio = await db.portfolio.findUnique({
    where: { slug },
    select: { name: true, title: true, description: true },
  })
  if (!portfolio) return { title: 'Portfolio — Developer Portfolio' }
  return {
    title: `${portfolio.name} — Developer Portfolio`,
    description: portfolio.description ?? `${portfolio.name}'s developer portfolio.`,
    openGraph: {
      title: `${portfolio.name} — Developer Portfolio`,
      description: portfolio.description ?? `${portfolio.name}'s developer portfolio.`,
      type: 'profile',
    },
  }
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
