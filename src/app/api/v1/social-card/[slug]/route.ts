import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function truncate(str: string, max: number): string {
  if (str.length <= max) return str
  return str.slice(0, max - 1) + '…'
}

function getScoreColor(score: number): string {
  if (score >= 90) return '#10b981'
  if (score >= 70) return '#eab308'
  if (score >= 50) return '#f97316'
  return '#ef4444'
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    const portfolio = await db.portfolio.findUnique({
      where: { slug },
      include: {
        technologies: { include: { technology: true } },
        score: true,
      },
    })

    if (!portfolio) {
      return new NextResponse('Portfolio not found', { status: 404 })
    }

    const name = escapeXml(truncate(portfolio.name, 30))
    const title = escapeXml(truncate(portfolio.title ?? 'Developer', 50))
    const score = portfolio.score?.overallScore ?? 0
    const scoreColor = getScoreColor(score)
    const techs = portfolio.technologies.slice(0, 5).map(pt => escapeXml(pt.technology.name))

    const techPills = techs.map((t, i) => {
      const x = 40 + i * 110
      return `
        <rect x="${x}" y="278" width="${t.length * 8 + 20}" height="26" rx="13" fill="#18181b" stroke="#27272a" stroke-width="1"/>
        <text x="${x + 10}" y="295" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="500" fill="#a1a1aa">${t}</text>
      `
    }).join('')

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="320" viewBox="0 0 600 320">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#09090b"/>
      <stop offset="100%" stop-color="#18181b"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
  </defs>

  <rect width="600" height="320" fill="url(#bg)"/>
  <rect x="0" y="0" width="600" height="3" fill="url(#accent)"/>

  <!-- Score circle -->
  <circle cx="520" cy="90" r="48" fill="none" stroke="#27272a" stroke-width="4"/>
  <circle cx="520" cy="90" r="48" fill="none" stroke="${scoreColor}" stroke-width="4"
    stroke-dasharray="${2 * Math.PI * 48}" stroke-dashoffset="${2 * Math.PI * 48 * (1 - score / 100)}"
    stroke-linecap="round" transform="rotate(-90 520 90)"/>
  <text x="520" y="86" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="bold" fill="${scoreColor}">${score}</text>
  <text x="520" y="104" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#71717a">Score</text>

  <!-- Name -->
  <text x="40" y="90" font-family="system-ui, -apple-system, sans-serif" font-size="30" font-weight="bold" fill="#fafafa">${name}</text>

  <!-- Title -->
  <text x="40" y="120" font-family="system-ui, -apple-system, sans-serif" font-size="16" fill="#a1a1aa">${title}</text>

  <!-- Divider -->
  <line x1="40" y1="145" x2="560" y2="145" stroke="#27272a" stroke-width="1"/>

  <!-- Label -->
  <text x="40" y="180" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="600" fill="#71717a" text-transform="uppercase" letter-spacing="1">TECHNOLOGIES</text>

  <!-- Tech pills -->
  ${techPills}

  <!-- Footer -->
  <line x1="40" y1="240" x2="560" y2="240" stroke="#27272a" stroke-width="1"/>
  <text x="40" y="290" font-family="system-ui, -apple-system, sans-serif" font-size="13" font-weight="600" fill="#f59e0b">Developer Portfolio</text>
  <text x="40" y="306" font-family="system-ui, -apple-system, sans-serif" font-size="11" fill="#52525b">developer-portfolio.dev</text>
</svg>`

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    })
  } catch (error) {
    console.error('Failed to generate social card:', error)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
