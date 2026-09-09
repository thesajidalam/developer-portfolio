import { createHmac, timingSafeEqual } from 'node:crypto'
import type { NextRequest } from 'next/server'
import { RateLimiter } from '@/lib/security'

export const ADMIN_SESSION_COOKIE = 'df_admin'
export const SESSION_MAX_AGE = 12 * 60 * 60

interface AdminSessionPayload {
  v: 1
  sub: 'admin'
  mfa: boolean
  iat: number
  exp: number
}

function signingSecret(): string {
  const key = process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_API_KEY || ''
  return createHmac('sha256', 'devfolio-admin-session-v1').update(key).digest('base64')
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString('base64url')
}

function fromB64url(input: string): Buffer {
  return Buffer.from(input, 'base64url')
}

export function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return timingSafeEqual(ab, bb)
}

export function createAdminSession(mfaCompleted: boolean): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: AdminSessionPayload = { v: 1, sub: 'admin', mfa: mfaCompleted, iat: now, exp: now + SESSION_MAX_AGE }
  const body = b64url(JSON.stringify(payload))
  const sig = b64url(createHmac('sha256', signingSecret()).update(body).digest())
  return `${body}.${sig}`
}

export function verifyAdminSession(token: string | undefined | null): AdminSessionPayload | null {
  if (!token) return null
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [body, sig] = parts
  let sigBuf: Buffer
  try {
    sigBuf = fromB64url(sig)
  } catch {
    return null
  }
  const expectedBuf = fromB64url(b64url(createHmac('sha256', signingSecret()).update(body).digest()))
  if (sigBuf.length !== expectedBuf.length || !timingSafeEqual(sigBuf, expectedBuf)) return null

  let payload: AdminSessionPayload
  try {
    payload = JSON.parse(fromB64url(body).toString('utf8'))
  } catch {
    return null
  }
  if (!payload || payload.v !== 1 || payload.sub !== 'admin') return null
  if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return null
  return payload
}

export function getAdminSessionFromRequest(request: NextRequest): AdminSessionPayload | null {
  const cookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
  return verifyAdminSession(cookie)
}

export function getClientIp(request: NextRequest): string {
  const fwd = request.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0]?.trim() || 'unknown'
  return request.headers.get('x-real-ip') || 'unknown'
}

export const loginRateLimiter = new RateLimiter(5, 15 * 60 * 1000)

const loginFailures = new Map<string, { count: number; until: number }>()

export function checkLoginBackoff(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const r = loginFailures.get(ip)
  if (r && r.until > Date.now()) {
    return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((r.until - Date.now()) / 1000)) }
  }
  return { allowed: true, retryAfterSeconds: 0 }
}

export function recordLoginFailure(ip: string): number {
  const prev = loginFailures.get(ip)
  const count = (prev?.count ?? 0) + 1
  const delayMs = Math.min(5000 * 2 ** Math.min(count - 1, 8), 2 * 60 * 60 * 1000)
  loginFailures.set(ip, { count, until: Date.now() + delayMs })
  return Math.ceil(delayMs / 1000)
}

export function clearLoginFailures(ip: string): void {
  loginFailures.delete(ip)
}