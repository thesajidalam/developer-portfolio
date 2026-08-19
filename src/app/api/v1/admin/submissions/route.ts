import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(searchParams.get('pageSize') || '15', 10)))
    const status = searchParams.get('status') || undefined

    const where: Record<string, unknown> = {}

    if (status && status !== 'all') {
      where.status = status
    }

    const [total, submissions] = await Promise.all([
      db.submission.count({ where }),
      db.submission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ])

    return NextResponse.json({
      data: submissions,
      meta: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    })
  } catch (error) {
    console.error('Failed to fetch submissions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, status } = body

    if (!id || !status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }

    const submission = await db.submission.findUnique({ where: { id } })
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const updated = await db.submission.update({
      where: { id },
      data: { status, processedAt: new Date() },
    })

    if (status === 'completed') {
      const slug = submission.portfolioUrl
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .replace(/\/+$/, '')
        .split('/')
        .slice(0, 2)
        .join('-')
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')

      let result: Record<string, unknown> = {}
      if (submission.result) {
        try {
          result = JSON.parse(submission.result)
        } catch {
          result = {}
        }
      }

      const now = new Date()
      await db.portfolio.create({
        data: {
          name: submission.submitterName || slug,
          slug: `${slug}-${Date.now()}`,
          portfolioUrl: submission.portfolioUrl,
          description: (result.description as string) || null,
          experienceLevel: 'mid',
          status: 'pending',
          health: 'unknown',
          submittedAt: now,
          updatedAt: now,
        },
      })
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Failed to update submission:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
