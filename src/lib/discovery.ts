import { db } from '@/lib/db'

function serializePortfolio(p: {
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
  submittedAt: Date
  updatedAt: Date
  technologies?: { technology: { id: string; name: string; slug: string } }[]
  score?: { overallScore: number; performanceScore: number; accessibilityScore: number; seoScore: number } | null
}) {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    title: p.title,
    avatarUrl: p.avatarUrl,
    portfolioUrl: p.portfolioUrl,
    description: p.description,
    location: p.location,
    experienceLevel: p.experienceLevel,
    health: p.health,
    framework: p.framework,
    language: p.language,
    featured: p.featured,
    verified: p.verified,
    technologies: p.technologies?.map(pt => pt.technology) ?? [],
    score: p.score ?? null,
  }
}

function recencyBonus(submittedAt: Date): number {
  const daysSince = (Date.now() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24)
  if (daysSince < 7) return 100
  if (daysSince < 14) return 80
  if (daysSince < 30) return 60
  if (daysSince < 90) return 40
  if (daysSince < 180) return 20
  return 10
}

function healthBonus(health: string): number {
  if (health === 'healthy') return 100
  if (health === 'needs_attention') return 50
  return 0
}

const PORTFOLIO_INCLUDE = {
  technologies: { include: { technology: true } },
  score: true,
}

export async function getTrendingPortfolios(limit = 10) {
  const portfolios = await db.portfolio.findMany({
    where: { status: 'approved' },
    include: PORTFOLIO_INCLUDE,
    take: 200,
  })

  const scored = portfolios
    .map(p => {
      const score = p.score?.overallScore ?? 0
      const recency = recencyBonus(p.submittedAt)
      const health = healthBonus(p.health)
      return {
        raw: p,
        trendingScore: score * 0.6 + recency * 0.2 + health * 0.2,
      }
    })
    .sort((a, b) => b.trendingScore - a.trendingScore)
    .slice(0, limit)

  return scored.map(s => serializePortfolio(s.raw))
}

export async function getRisingPortfolios(limit = 10) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const portfolios = await db.portfolio.findMany({
    where: {
      status: 'approved',
      submittedAt: { gte: thirtyDaysAgo },
      score: { overallScore: { gte: 80 } },
    },
    include: PORTFOLIO_INCLUDE,
    orderBy: { submittedAt: 'desc' },
    take: limit,
  })

  return portfolios.map(serializePortfolio)
}

export async function getHiddenGems(limit = 10) {
  const portfolios = await db.portfolio.findMany({
    where: {
      status: 'approved',
      featured: false,
      health: 'healthy',
      score: { overallScore: { gte: 85 } },
    },
    include: PORTFOLIO_INCLUDE,
    orderBy: { submittedAt: 'desc' },
    take: 100,
  })

  return portfolios
    .sort((a, b) => (b.score?.overallScore ?? 0) - (a.score?.overallScore ?? 0))
    .slice(0, limit)
    .map(serializePortfolio)
}

export async function getRandomPortfolio() {
  const total = await db.portfolio.count({ where: { status: 'approved' } })
  if (total === 0) return null

  const offset = Math.floor(Math.random() * total)
  const portfolio = await db.portfolio.findFirst({
    where: { status: 'approved' },
    include: PORTFOLIO_INCLUDE,
    skip: offset,
    take: 1,
  })

  return portfolio ? serializePortfolio(portfolio) : null
}

export async function getSimilarPortfolios(portfolioId: string, limit = 6) {
  const portfolio = await db.portfolio.findUnique({
    where: { id: portfolioId },
    include: {
      technologies: { include: { technology: true } },
      categories: { include: { category: true } },
    },
  })

  if (!portfolio) return []

  const techSlugs = portfolio.technologies.map(pt => pt.technology.slug)
  const catSlugs = portfolio.categories.map(pc => pc.category.slug)

  if (techSlugs.length === 0 && catSlugs.length === 0) {
    const fallback = await db.portfolio.findMany({
      where: { status: 'approved', id: { not: portfolioId } },
      include: PORTFOLIO_INCLUDE,
      take: limit,
      orderBy: { submittedAt: 'desc' },
    })
    return fallback.map(serializePortfolio)
  }

  const candidates = await db.portfolio.findMany({
    where: {
      status: 'approved',
      id: { not: portfolioId },
      OR: [
        { technologies: { some: { technology: { slug: { in: techSlugs } } } } },
        { categories: { some: { category: { slug: { in: catSlugs } } } } },
      ],
    },
    include: {
      ...PORTFOLIO_INCLUDE,
      technologies: { include: { technology: true } },
      categories: { include: { category: true } },
    },
    take: 200,
  })

  const scored = candidates.map(c => {
    const cTechSlugs = c.technologies.map(pt => pt.technology.slug)
    const cCatSlugs = c.categories.map(pc => pc.category.slug)

    const techOverlap = cTechSlugs.filter(s => techSlugs.includes(s)).length
    const catOverlap = cCatSlugs.filter(s => catSlugs.includes(s)).length
    const overlap = techOverlap + catOverlap

    return {
      raw: c,
      overlapScore: overlap * 10 + (c.score?.overallScore ?? 0) * 0.1,
    }
  })

  return scored
    .sort((a, b) => b.overlapScore - a.overlapScore)
    .slice(0, limit)
    .map(s => serializePortfolio(s.raw))
}
