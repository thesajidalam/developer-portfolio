import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest, getClientIp, safeEqual } from '@/lib/session'
import { RateLimiter } from '@/lib/security'

const adminApiLimiter = new RateLimiter(200, 60 * 1000)

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true
  let host: string
  try {
    host = new URL(origin).hostname
  } catch {
    return false
  }
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const baseHost = baseUrl ? new URL(baseUrl).hostname : ''
  return (
    host === baseHost ||
    host === 'gitdevfolio.vercel.app' ||
    host === 'sajid.js.org' ||
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host.endsWith('.vercel.app')
  )
}

export function checkAdminKey(request: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_API_KEY
  if (!expected) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 503 })
  }

  const ip = getClientIp(request)
  const rate = adminApiLimiter.check(`admin:${ip}`)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests', retryAfter: Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000)) },
      { status: 429 },
    )
  }

  if (!isAllowedOrigin(request.headers.get('origin'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (token && safeEqual(token, expected)) return null
  if (getAdminSessionFromRequest(request)) return null

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}