const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify'
const TURNSTILE_ACTION = 'admin-login'

interface SiteVerifyResponse {
  success?: boolean
  'error-codes'?: string[]
  hostname?: string
  action?: string
}

export function isTurnstileConfigured(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY)
}

export function isAllowedTurnstileHost(hostname: string): boolean {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  const baseHost = baseUrl ? new URL(baseUrl).hostname : ''
  return (
    hostname === baseHost ||
    hostname === 'gitdevfolio.vercel.app' ||
    hostname === 'sajid.js.org' ||
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname.endsWith('.vercel.app')
  )
}

export async function verifyTurnstileToken(token: string, remoteIp: string | null): Promise<{ success: boolean }> {
  const secret = process.env.TURNSTILE_SECRET_KEY
  if (!secret || !token) return { success: false }

  const body = new URLSearchParams({ secret, response: token })
  if (remoteIp) body.set('remoteip', remoteIp)

  let res: Response
  try {
    res = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  } catch {
    return { success: false }
  }
  if (!res.ok) return { success: false }

  let data: SiteVerifyResponse
  try {
    data = (await res.json()) as SiteVerifyResponse
  } catch {
    return { success: false }
  }
  if (!data.success) return { success: false }

  if (!data.hostname || !isAllowedTurnstileHost(data.hostname)) return { success: false }

  if (data.action && data.action !== TURNSTILE_ACTION) return { success: false }

  return { success: true }
}