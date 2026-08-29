import { NextRequest, NextResponse } from 'next/server'
import { SubmissionSchema } from '@/lib/validations'
import { RateLimiter, sanitizeInput, validateCSRFToken } from '@/lib/security'
import { validateUrlSafety } from '@/lib/ssrf-protection'
import { createSubmission } from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const submitLimiter = new RateLimiter(5, 10 * 60 * 1000) // 5 per 10 min per IP

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const limit = submitLimiter.check(`submit:${ip}`)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many submissions. Please try again later.', retryAfter: Math.ceil((limit.resetAt - Date.now()) / 1000) },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = SubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const { url } = parsed.data
  const safety = validateUrlSafety(url)
  if (!safety.safe) {
    return NextResponse.json({ error: safety.reason || 'URL not accepted' }, { status: 400 })
  }

  const csrf = request.headers.get('x-csrf-token')
  if (csrf && !validateCSRFToken(csrf)) {
    return NextResponse.json({ error: 'Invalid or expired CSRF token' }, { status: 403 })
  }

  try {
    const name = parsed.data.name ? sanitizeInput(parsed.data.name) : undefined
    const email = parsed.data.email ? sanitizeInput(parsed.data.email) : undefined
    const submission = await createSubmission({
      portfolioUrl: url,
      submitterName: name,
      submitterEmail: email,
      result: { role: parsed.data.role ? sanitizeInput(parsed.data.role) : null },
    })
    return NextResponse.json(
      { data: { id: submission.id, message: 'Submission received. It will be reviewed shortly.' } },
      { status: 201 },
    )
  } catch (error) {
    console.error('Submit failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
