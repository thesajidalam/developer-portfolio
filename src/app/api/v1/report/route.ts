import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { RateLimiter, sanitizeInput } from '@/lib/security'
import { validateUrlSafety } from '@/lib/ssrf-protection'
import { createLinkReport } from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ReportSchema = z.object({
  portfolioUrl: z
    .string()
    .min(1, 'Portfolio URL is required')
    .max(1000),
  portfolioName: z.string().max(200).optional(),
  reporterName: z.string().max(100).optional(),
  reporterEmail: z.string().max(200).optional().or(z.literal('')),
  reason: z.string().max(1000).optional(),
})

const reportLimiter = new RateLimiter(5, 10 * 60 * 1000)

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const limit = reportLimiter.check(`report:${ip}`)
  if (!limit.allowed) {
    return NextResponse.json(
      { error: 'Too many reports. Please try again later.', retryAfter: Math.ceil((limit.resetAt - Date.now()) / 1000) },
      { status: 429 },
    )
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const parsed = ReportSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 400 },
    )
  }

  const rawUrl = parsed.data.portfolioUrl.trim()
  const withScheme = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(rawUrl) ? rawUrl : `https://${rawUrl}`
  const safety = validateUrlSafety(withScheme)
  if (!safety.safe) {
    return NextResponse.json({ error: safety.reason || 'URL not accepted' }, { status: 400 })
  }

  try {
    const report = await createLinkReport({
      portfolioUrl: sanitizeInput(rawUrl),
      portfolioName: parsed.data.portfolioName ? sanitizeInput(parsed.data.portfolioName) : undefined,
      reporterName: parsed.data.reporterName ? sanitizeInput(parsed.data.reporterName) : undefined,
      reporterEmail: parsed.data.reporterEmail ? sanitizeInput(parsed.data.reporterEmail) : undefined,
      reason: parsed.data.reason ? sanitizeInput(parsed.data.reason) : undefined,
    })
    return NextResponse.json(
      { data: { id: report.id, message: 'Report received. Thank you for helping keep the directory accurate.' } },
      { status: 201 },
    )
  } catch (error) {
    console.error('Report failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
