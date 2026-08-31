import { NextRequest, NextResponse } from 'next/server'
import { checkAdminKey } from '@/lib/admin-auth'
import {
  listSubmissions,
  getSubmissionById,
  updateSubmission,
  createPortfolioFromSubmission,
} from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const unauthorized = checkAdminKey(request)
  if (unauthorized) return unauthorized

  try {
    const sp = new URL(request.url).searchParams
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(sp.get('pageSize') || '15', 10)))
    const status = sp.get('status') || undefined
    const q = sp.get('q') || undefined
    const result = await listSubmissions(page, pageSize, status, q)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Admin list submissions failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = checkAdminKey(request)
  if (unauthorized) return unauthorized

  try {
    const body = await request.json().catch(() => null)
    if (!body || !body.id || !body.status) {
      return NextResponse.json({ error: 'id and status are required' }, { status: 400 })
    }

    const submission = await getSubmissionById(String(body.id))
    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
    }

    const updated = await updateSubmission(submission.id, {
      status: String(body.status),
      processed_at: new Date().toISOString(),
    })

    if (body.status === 'completed') {
      const description =
        submission.result && typeof submission.result === 'object' && 'role' in submission.result
          ? String((submission.result as { role?: unknown }).role ?? '') || null
          : null
      await createPortfolioFromSubmission({
        portfolioUrl: submission.portfolioUrl,
        name: submission.submitterName || 'New Portfolio',
        description,
      })
    }

    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Admin update submission failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
