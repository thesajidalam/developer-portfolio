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
    overall >= 90 ? '#10b981' : overall >= 70 ? '#22c55e' : overall >= 50 ? '#f59e0b' : '#ef4444'
  const votes = await voteCount(p.id).catch(() => 0)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:#0f172a;color:#f1f5f9;font-family:system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;height:100vh;display:flex;align-items:center;justify-content:center}
    .card{background:#1e293b;border:1px solid #334155;border-radius:16px;padding:20px 24px;width:320px}
    .row{display:flex;align-items:center;justify-content:space-between;gap:16px}
    .name{font-size:18px;font-weight:700;line-height:1.2}
    .host{font-size:13px;color:#94a3b8;margin-top:2px}
    .score{font-size:38px;font-weight:800;line-height:1}
    .bar{height:8px;border-radius:99px;background:#334155;margin-top:14px;overflow:hidden}
    .fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#6366f1,#38bdf8)}
    .meta{display:flex;justify-content:space-between;margin-top:10px;font-size:12px;color:#94a3b8}
    .link{display:block;margin-top:14px;text-align:center;padding:8px 0;border-radius:10px;background:#4f46e5;color:#fff;text-decoration:none;font-size:13px;font-weight:600}
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
