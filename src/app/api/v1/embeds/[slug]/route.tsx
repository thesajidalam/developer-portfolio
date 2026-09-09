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
    overall >= 90 ? '#10b981' : overall >= 75 ? '#34d399' : overall >= 60 ? '#f59e0b' : overall >= 40 ? '#f97316' : '#ef4444'
  const votes = await voteCount(p.id).catch(() => 0)
  const host = hostnameOf(p.portfolioUrl)

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{background:transparent;height:100vh;width:300px;display:flex;align-items:center;justify-content:center;overflow:hidden}
    .card{
      position:relative;width:300px;height:64px;display:flex;align-items:center;gap:10px;padding:0 12px;
      background:linear-gradient(135deg,rgba(17,24,38,0.94) 0%,rgba(10,14,23,0.94) 100%);
      border-radius:16px;text-decoration:none;overflow:hidden;
      box-shadow:inset 0 0 0 1px rgba(125,211,252,0.16),0 8px 24px rgba(0,0,0,0.45),0 0 24px rgba(62,139,255,0.10);
    }
    .card::before{content:"";position:absolute;inset:0 0 auto 0;height:1px;background:linear-gradient(90deg,transparent,rgba(62,139,255,0.85),rgba(34,211,238,0.7),transparent)}
    .card::after{content:"";position:absolute;top:-26px;left:-26px;width:110px;height:110px;border-radius:50%;background:radial-gradient(circle,rgba(62,139,255,0.16),transparent 65%);pointer-events:none}
    .tile{flex:0 0 auto;width:28px;height:28px;border-radius:9px;background:linear-gradient(135deg,#3b82f6 0%,#38bdf8 100%);display:flex;align-items:center;justify-content:center;color:#fff;font-family:ui-monospace,'Cascadia Code',Menlo,Consolas,monospace;font-size:12px;font-weight:800;letter-spacing:-1px;box-shadow:0 3px 10px rgba(62,139,255,0.35)}
    .mid{flex:1 1 auto;min-width:0}
    .name{font-size:13px;font-weight:650;color:#f8fafc;line-height:1.15;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .host{font-size:10px;color:#8e9bb3;margin-top:1px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .bar{height:3px;border-radius:99px;background:rgba(151,166,192,0.22);margin-top:5px;overflow:hidden}
    .fill{height:100%;border-radius:99px;background:linear-gradient(90deg,#3b82f6,#38bdf8)}
    .score{flex:0 0 auto;font-size:20px;font-weight:800;line-height:1;letter-spacing:-0.5px;min-width:38px;text-align:right}
    .brand{flex:0 0 auto;margin-left:2px;font-size:13px;font-weight:800;color:#7dd3fc;letter-spacing:-0.2px}
    .grow{transition:transform .18s ease,box-shadow .18s ease}
    a.card:hover .tile{transform:scale(1.06)}
    a.card:hover .score{transform:translateX(-1px)}
    a.card:hover{box-shadow:inset 0 0 0 1px rgba(125,211,252,0.3),0 10px 28px rgba(0,0,0,0.5),0 0 30px rgba(62,139,255,0.18)}
  </style>
</head>
<body>
  <a class="card" href="${esc(absoluteUrl(p.portfolioUrl))}" target="_blank" rel="noopener noreferrer" title="View ${esc(p.name)}">
    <span class="tile">&lt;/&gt;</span>
    <span class="mid">
      <span class="name">${esc(p.name)}</span>
      <span class="host">${esc(host)}${votes > 0 ? ` · ${votes} votes` : ''}</span>
      <span class="bar"><span class="fill" style="width:${Math.max(4, Math.min(100, overall))}%"></span></span>
    </span>
    <span class="score" style="color:${color}">${overall}</span>
    <span class="brand">&#8599;</span>
  </a>
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