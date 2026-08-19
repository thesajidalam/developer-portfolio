import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SearchQuerySchema } from '@/lib/validations'

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q') ?? ''

    const parsed = SearchQuerySchema.safeParse({ q })
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    const query = parsed.data.q

    const portfolios = await db.portfolio.findMany({
      where: {
        status: 'approved',
        OR: [
          { name: { contains: query } },
          { title: { contains: query } },
          { description: { contains: query } },
          {
            technologies: {
              some: {
                technology: { name: { contains: query } },
              },
            },
          },
        ],
      },
      include: {
        technologies: { include: { technology: true } },
        categories: { include: { category: true } },
        score: true,
      },
      orderBy: { submittedAt: 'desc' },
      take: 20,
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = portfolios.map((p: any) => ({
      ...p,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      technologies: p.technologies.map((pt: any) => pt.technology),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories: p.categories.map((pc: any) => pc.category),
      score: p.score ?? null,
    }))

    return NextResponse.json({
      portfolios: data,
      total: data.length,
      query,
    })
  } catch (error) {
    console.error('Search failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
