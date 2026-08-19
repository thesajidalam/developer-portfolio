import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const portfolio = await db.portfolio.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        technologies: { include: { technology: true } },
        categories: { include: { category: true } },
        tags: { include: { tag: true } },
        score: true,
        healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 },
      },
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {
      ...portfolio,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      technologies: portfolio.technologies.map((pt: any) => pt.technology),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      categories: portfolio.categories.map((pc: any) => pc.category),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tags: portfolio.tags.map((pt: any) => pt.tag),
      score: portfolio.score ?? null,
      latestHealthCheck: portfolio.healthChecks[0] ?? null,
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Failed to fetch portfolio:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
