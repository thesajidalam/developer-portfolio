import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '15', 10)))
    const status = searchParams.get('status') || undefined
    const q = searchParams.get('q') || undefined

    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { title: { contains: q } },
        { description: { contains: q } },
        { portfolioUrl: { contains: q } },
      ]
    }

    const [total, portfolios] = await Promise.all([
      db.portfolio.count({ where }),
      db.portfolio.findMany({
        where,
        orderBy: { submittedAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          score: true,
        },
      }),
    ])

    return NextResponse.json({
      data: portfolios,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Failed to fetch admin portfolios:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status, featured, verified } = body

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    const data: Record<string, unknown> = { updatedAt: new Date() }
    if (status) data.status = status
    if (typeof featured === 'boolean') data.featured = featured
    if (typeof verified === 'boolean') data.verified = verified

    const updated = await db.portfolio.update({
      where: { id },
      data,
    })

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Failed to update portfolio:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }

    await db.portfolio.delete({ where: { id } })

    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    console.error('Failed to delete portfolio:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
