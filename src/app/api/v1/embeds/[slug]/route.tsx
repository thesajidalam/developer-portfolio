import { NextRequest, NextResponse } from 'next/server'
import { getPortfolioBySlug, voteCount } from '@/lib/repository'
import { hostnameOf, absoluteUrl } from '@/lib/utils'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const p = await getPortfolioBySlug(slug)
  if (!p) {
    return new NextResponse('Portfolio not found', { status: 404, headers: { 'Content-Type': 'text/plain' } })
  }

  const overall = p.score?.overallScore ?? 0
  const color =
    overall >= 90 ? '#4fe29b' : overall >= 75 ? '#35d07f' : overall >= 60 ? '#f2b84b' : overall >= 40 ? '#ff7a52' : '#ff657a'
  const votes = await voteCount(p.id).catch(() => 0)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#070a12;color:#e8eef9;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:#141b2a;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:20px 24px;width:320px}
    .row{display:flex;align-items:center;justify-content:space-between;gap:16px}
    .name{font-size:18px;font-weight:700;line-height:1.2}
    .host{font-size:13px;color:#98a7bf;margin-top:2px}
    .score{font-size:38px;font-weight:800;line-height:1}
    .bar{height:8px;border-radius:99px;background:rgba(190,160,194,0.14);margin-top:14px;overflow:hidden}
    .fill{height:100%;border-radius:99px;background:#3e8bff}
    .meta{display:flex;justify-content:space-between;margin-top:10px;font-size:12px;color:#98a7bf}
    .link{display:block;margin-top:14px;text-align:center;padding:8px 0;border-radius:10px;background:#3e8bff;color:#fff;text-decoration:none;font-size:13px;font-weight:600}
    .link:hover{background:#66a5ff}
  </style>
</head>
<body>
  <div class="card">
    <div class="row">
      <div>
        <div class="name">${esc(p.name)}</div>
        <div class="host">${esc(hostnameOf(p.portfolioUrl))}</div>
      </div>
      <div class="score" style="color:${color}">${overall}</div>
    </div>
    <div class="bar"><div class="fill" style="width:${overall}%"></div></div>
    <div class="meta">
      <span>DevFolio Score</span>
      <span>${votes} votes · ${p.health === 'healthy' ? 'Healthy' : 'Other'}</span>
    </div>
    <a class="link" href="${esc(absoluteUrl(p.portfolioUrl))}" target="_blank" rel="noopener noreferrer">Visit portfolio</a>
  </div>
</body>
</html>`

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'ALLOWALL',
    },
  })
}
