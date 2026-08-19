import crypto from 'crypto'

export function getSecurityHeaders(): Record<string, string> {
  return {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self'",
      "connect-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
}

interface BucketState {
  tokens: number
  lastRefill: number
}

export class RateLimiter {
  private buckets = new Map<string, BucketState>()
  private maxRequests: number
  private windowMs: number

  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  check(identifier: string): { allowed: boolean; remaining: number; resetAt: number } {
    const now = Date.now()
    const bucket = this.buckets.get(identifier)

    if (!bucket || now - bucket.lastRefill >= this.windowMs) {
      this.buckets.set(identifier, { tokens: this.maxRequests - 1, lastRefill: now })
      return { allowed: true, remaining: this.maxRequests - 1, resetAt: now + this.windowMs }
    }

    if (bucket.tokens <= 0) {
      const resetAt = bucket.lastRefill + this.windowMs
      return { allowed: false, remaining: 0, resetAt }
    }

    bucket.tokens -= 1
    return { allowed: true, remaining: bucket.tokens, resetAt: bucket.lastRefill + this.windowMs }
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/<[^>]*>/g, '')
    .trim()
    .slice(0, 1000)
}

const csrfTokens = new Map<string, number>()

export function generateCSRFToken(): string {
  const token = crypto.randomBytes(32).toString('hex')
  csrfTokens.set(token, Date.now() + 60 * 60 * 1000)
  return token
}

export function validateCSRFToken(token: string): boolean {
  const expiry = csrfTokens.get(token)
  if (expiry === undefined) return false
  if (Date.now() > expiry) {
    csrfTokens.delete(token)
    return false
  }
  return true
}
