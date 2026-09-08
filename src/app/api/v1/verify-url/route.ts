import { NextRequest, NextResponse } from 'next/server'
import { normalizePortfolioUrl } from '@/lib/utils'
import { validateUrlSafety } from '@/lib/ssrf-protection'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

async function probe(url: string): Promise<{ ok: boolean; status: number }> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch(url, {
      method: 'HEAD',
      redirect: 'follow',
      headers: { 'User-Agent': 'DevFolio-Verify/1.0' },
      signal: controller.signal,
    })
    return { ok: res.ok, status: res.status }
  } catch {
    return { ok: false, status: 0 }
  } finally {
    clearTimeout(timer)
  }
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const raw = (body as { url?: unknown } | null)?.url
  if (typeof raw !== 'string' || !raw.trim()) {
    return NextResponse.json({ error: 'URL is required' }, { status: 400 })
  }

  const url = normalizePortfolioUrl(raw)
  if (!url) {
    return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 })
  }

  const safety = validateUrlSafety(url)
  if (!safety.safe) {
    return NextResponse.json({ error: safety.reason || 'URL not accepted' }, { status: 400 })
  }

  const result = await probe(url)
  return NextResponse.json({ data: { ...result, url } })
}