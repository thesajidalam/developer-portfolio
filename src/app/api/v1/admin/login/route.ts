import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_SESSION_COOKIE,
  SESSION_MAX_AGE,
  checkLoginBackoff,
  clearLoginFailures,
  createAdminSession,
  getClientIp,
  loginRateLimiter,
  recordLoginFailure,
  safeEqual,
} from '@/lib/session'
import { isTotpConfigured, verifyTotp } from '@/lib/totp'
import { isTurnstileConfigured, verifyTurnstileToken } from '@/lib/turnstile'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function readBody(request: NextRequest): Promise<{ apiKey: string; turnstileToken: string; totp: string }> {
  try {
    const body = (await request.json()) as Record<string, unknown>
    return {
      apiKey: typeof body.apiKey === 'string' ? body.apiKey : '',
      turnstileToken: typeof body.turnstileToken === 'string' ? body.turnstileToken : '',
      totp: typeof body.totp === 'string' ? body.totp : '',
    }
  } catch {
    return { apiKey: '', turnstileToken: '', totp: '' }
  }
}

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_API_KEY
  if (!expected) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 503 })
  }

  const ip = getClientIp(request)

  const backoff = checkLoginBackoff(ip)
  if (!backoff.allowed) {
    return NextResponse.json(
      { error: 'Invalid credentials or request', retryAfter: backoff.retryAfterSeconds },
      { status: 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': String(backoff.retryAfterSeconds) } },
    )
  }

  const rate = loginRateLimiter.check(`login:${ip}`)
  if (!rate.allowed) {
    recordLoginFailure(ip)
    const retryAfter = Math.max(1, Math.ceil((rate.resetAt - Date.now()) / 1000))
    return NextResponse.json(
      { error: 'Invalid credentials or request', retryAfter },
      { status: 429, headers: { 'Cache-Control': 'no-store', 'Retry-After': String(retryAfter) } },
    )
  }

  const { apiKey, turnstileToken, totp } = await readBody(request)

  if (!isTurnstileConfigured()) {
    recordLoginFailure(ip)
    return NextResponse.json({ error: 'Invalid credentials or request' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  const turnstile = await verifyTurnstileToken(turnstileToken, ip)
  if (!turnstile.success) {
    recordLoginFailure(ip)
    return NextResponse.json({ error: 'Invalid credentials or request' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  if (!apiKey || !safeEqual(apiKey, expected)) {
    recordLoginFailure(ip)
    return NextResponse.json({ error: 'Invalid credentials or request' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  const mfaRequired = isTotpConfigured()
  if (mfaRequired && !verifyTotp(totp)) {
    recordLoginFailure(ip)
    return NextResponse.json({ error: 'Invalid credentials or request' }, { status: 401, headers: { 'Cache-Control': 'no-store' } })
  }

  clearLoginFailures(ip)

  const token = createAdminSession(mfaRequired)
  const res = NextResponse.json({ ok: true }, { headers: { 'Cache-Control': 'no-store' } })
  res.cookies.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  })
  return res
}