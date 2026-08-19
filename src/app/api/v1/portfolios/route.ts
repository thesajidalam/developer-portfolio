import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PortfolioFiltersSchema } from '@/lib/validations'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    const filters = PortfolioFiltersSchema.parse(params)

    const where: Record<string, unknown> = {
      status: 'approved',
    }

    if (filters.search) {
      where.OR = [
        { name: { contains: filters.search } },
        { title: { contains: filters.search } },
        { description: { contains: filters.search } },
      ]
    }

    if (filters.tech) {
      const techSlugs = filters.tech.split(',').map((s) => s.trim())
      where.technologies = {
        some: {
          technology: {
            slug: { in: techSlugs },
          },
        },
      }
    }

    if (filters.category) {
      const catSlugs = filters.category.split(',').map((s) => s.trim())
      where.categories = {
        some: {
          category: {
            slug: { in: catSlugs },
          },
        },
      }
    }

    if (filters.experience) {
      const levels = filters.experience.split(',').map((s) => s.trim())
      where.experienceLevel = { in: levels }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = (() => {
      switch (filters.sort) {
        case 'oldest':
          return { submittedAt: 'asc' }
        case 'score':
          return { score: { overallScore: 'desc' } }
        case 'name':
          return { name: 'asc' }
        case 'newest':
        default:
          return { submittedAt: 'desc' }
      }
    })()

    const [total, portfolios] = await Promise.all([
      db.portfolio.count({ where }),
      db.portfolio.findMany({
        where,
        orderBy,
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize,
        include: {
          technologies: { include: { technology: true } },
          categories: { include: { category: true } },
          tags: { include: { tag: true } },
          score: true,
        },
      }),
    ])

    const totalPages = Math.ceil(total / filters.pageSize)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = portfolios.map((p: any) => ({
      ...p,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      technologies: p.technologies.map((pt: any) => pt.technology),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories: p.categories.map((pc: any) => pc.category),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tags: p.tags.map((pt: any) => pt.tag),
      score: p.score ?? null,
    }))

    return NextResponse.json({
      data,
      meta: {
        total,
        page: filters.page,
        pageSize: filters.pageSize,
        totalPages,
      },
    })
  } catch (error) {
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
    }
    console.error('Failed to fetch portfolios:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
