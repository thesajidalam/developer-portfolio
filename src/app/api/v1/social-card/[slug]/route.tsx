import { NextRequest, NextResponse } from 'next/server'
import { getPortfolioBySlug } from '@/lib/repository'
import { getScoreColor, hostnameOf } from '@/lib/utils'
import { scoreLabel } from '@/lib/scoring'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function scoreHex(score: number): string {
  if (score >= 90) return '#10b981'
  if (score >= 75) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  if (score >= 40) return '#f97316'
  return '#ef4444'
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPortfolioBySlug(slug)
  if (!p) {
    return new NextResponse('Portfolio not found', { status: 404 })
  }

  const overall = p.score?.overallScore ?? 0
  const color = scoreHex(overall)
  const label = scoreLabel(overall).label
  const name = esc(p.name)
  const host = esc(hostnameOf(p.portfolioUrl))
  const tech = (p.technologies ?? []).slice(0, 5).map(esc)

  const techChips = tech
    .map(
      (t, i) =>
        `<rect x="${44 + i * 166}" y="448" width="154" height="36" rx="18" fill="#1e293b"/>
         <text x="${131 + i * 166}" y="472" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="19" fill="#e2e8f0">#${t}</text>`,
    )
    .join('')

  const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#1e1b4b"/>
    </linearGradient>
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#6366f1"/>
      <stop offset="100%" stop-color="#38bdf8"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <circle cx="1040" cy="120" r="260" fill="#6366f1" opacity="0.12"/>
  <circle cx="120" cy="560" r="220" fill="#38bdf8" opacity="0.08"/>

  <text x="48" y="60" font-family="Inter,system-ui,sans-serif" font-weight="800" font-size="26" fill="#818cf8" letter-spacing="1">DEVFOLIO</text>

  <text x="48" y="250" font-family="Inter,system-ui,sans-serif" font-weight="700" font-size="64" fill="#ffffff">${name}</text>
  <text x="48" y="306" font-family="Inter,system-ui,sans-serif" font-size="34" fill="#94a3b8">${host}</text>

  <circle cx="980" cy="285" r="118" fill="none" stroke="#1e293b" stroke-width="18"/>
  <circle cx="980" cy="285" r="118" fill="none" stroke="${color}" stroke-width="18" stroke-linecap="round"
    stroke-dasharray="${2 * Math.PI * 118}" stroke-dashoffset="${2 * Math.PI * 118 * (1 - overall / 100)}" transform="rotate(-90 980 285)"/>
  <text x="980" y="300" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="800" font-size="76" fill="${color}">${overall}</text>
  <text x="980" y="356" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="26" fill="${color}">${esc(label)}</text>

  ${techChips}

  <text x="48" y="540" font-family="Inter,system-ui,sans-serif" font-size="26" fill="#64748b">${p.health === 'healthy' ? '● Healthy' : p.health === 'needs_attention' ? '● Needs attention' : '● Status unknown'}</text>
  <text x="48" y="596" font-family="Inter,system-ui,sans-serif" font-size="22" fill="#475569">Scored across Performance · Accessibility · SEO · Design · Content</text>

  <rect x="850" y="540" width="302" height="62" rx="31" fill="url(#glow)"/>
  <text x="1001" y="579" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-weight="700" font-size="26" fill="#ffffff">Check my score</text>
  <text x="1001" y="612" text-anchor="middle" font-family="Inter,system-ui,sans-serif" font-size="19" fill="#c7d2fe">gitdevfolio.vercel.app</text>
</svg>`

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
