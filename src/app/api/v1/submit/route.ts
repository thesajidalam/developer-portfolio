import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { SubmissionSchema } from '@/lib/validations'
import { validateUrlSafety } from '@/lib/ssrf-protection'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = SubmissionSchema.safeParse(body)

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]
      return NextResponse.json(
        { error: firstError?.message ?? 'Validation failed' },
        { status: 400 }
      )
    }

    const { url, name, email, description, role } = parsed.data

    const safety = validateUrlSafety(url)
    if (!safety.safe) {
      return NextResponse.json({ error: safety.reason }, { status: 400 })
    }

    const existing = await db.submission.findFirst({
      where: { portfolioUrl: url, status: { in: ['pending', 'processing'] } },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'This URL has already been submitted and is being processed' },
        { status: 409 }
      )
    }

    const submission = await db.submission.create({
      data: {
        portfolioUrl: url,
        submitterName: name || null,
        submitterEmail: email || null,
        status: 'pending',
        result: description || role ? JSON.stringify({ description, role }) : null,
        createdAt: new Date(),
      },
    })

    return NextResponse.json(
      { id: submission.id, status: submission.status },
      { status: 201 }
    )
  } catch (error) {
    console.error('Submission failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
