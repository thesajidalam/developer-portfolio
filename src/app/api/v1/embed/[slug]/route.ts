import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const reqUrl = new URL(request.url)
    const style = reqUrl.searchParams.get('style') || 'minimal'

    const portfolio = await db.portfolio.findUnique({
      where: { slug },
      include: {
        technologies: { include: { technology: true } },
        score: true,
      },
    })

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 })
    }

    const name = escapeHtml(portfolio.name)
    const title = escapeHtml(portfolio.title || 'Developer')
    const score = portfolio.score?.overallScore ?? 0
    const url = escapeHtml(portfolio.portfolioUrl)
    const techs = portfolio.technologies.slice(0, 4).map((pt) => escapeHtml(pt.technology.name))

    let html: string

    if (style === 'full') {
      const techList = techs.map((t) => `<span style="background:#27272a;color:#a1a1aa;padding:2px 8px;border-radius:12px;font-size:11px;margin-right:4px;">${t}</span>`).join('')
      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#09090b;color:#fafafa;">
<div style="border:1px solid #27272a;border-radius:12px;padding:16px;max-width:400px;background:#18181b;">
<div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
<div style="width:40px;height:40px;border-radius:50%;background:#27272a;display:flex;align-items:center;justify-content:center;font-weight:bold;font-size:16px;color:#f59e0b;">${name.charAt(0).toUpperCase()}</div>
<div><div style="font-weight:600;font-size:14px;">${name}</div><div style="color:#a1a1aa;font-size:12px;">${title}</div></div>
<div style="margin-left:auto;font-size:18px;font-weight:bold;color:${score >= 90 ? '#10b981' : score >= 70 ? '#eab308' : '#f97316'};">${score}</div>
</div>
<div style="margin-bottom:12px;">${techList}</div>
<a href="${url}" target="_blank" rel="noopener" style="display:inline-block;background:#f59e0b;color:#09090b;padding:6px 16px;border-radius:8px;font-size:12px;font-weight:600;text-decoration:none;">View Portfolio</a>
<div style="margin-top:12px;padding-top:8px;border-top:1px solid #27272a;color:#52525b;font-size:10px;">Powered by Developer Portfolio</div>
</div></body></html>`
    } else {
      html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;font-family:system-ui,-apple-system,sans-serif;background:#09090b;color:#fafafa;">
<div style="display:inline-flex;align-items:center;gap:10px;border:1px solid #27272a;border-radius:8px;padding:8px 14px;background:#18181b;font-size:13px;">
<span style="font-weight:600;">${name}</span>
<span style="color:#a1a1aa;">${title}</span>
<span style="color:${score >= 90 ? '#10b981' : score >= 70 ? '#eab308' : '#f97316'};font-weight:bold;">${score}</span>
<a href="${url}" target="_blank" rel="noopener" style="color:#f59e0b;text-decoration:none;font-weight:600;font-size:11px;">View &rarr;</a>
</div></body></html>`
    }

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      },
    })
  } catch (error) {
    console.error('Failed to generate embed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
