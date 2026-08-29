import { NextRequest, NextResponse } from 'next/server'
import { RateLimiter } from '@/lib/security'
import { recordVote, voteCount } from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const voteLimiter = new RateLimiter(30, 10 * 60 * 1000) // 30 votes per 10 min per IP

function clientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return request.headers.get('x-real-ip') || 'unknown'
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request)
  const limit = voteLimiter.check(`vote:${ip}`)
  if (!limit.allowed) {
    return NextResponse.json({ error: 'Too many votes. Please try again later.' }, { status: 429 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const b = (body ?? {}) as { portfolioId?: string; value?: unknown }
  if (!b.portfolioId || typeof b.portfolioId !== 'string') {
    return NextResponse.json({ error: 'portfolioId is required' }, { status: 400 })
  }

  const value = b.value === 1 || b.value === -1 ? b.value : 1

  try {
    await recordVote(b.portfolioId, `anon:${ip}`, value)
    const total = await voteCount(b.portfolioId)
    return NextResponse.json({ data: { total } })
  } catch (error) {
    console.error('Vote failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
