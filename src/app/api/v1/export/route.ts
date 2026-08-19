import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = 'force-static'

export async function GET(request: NextRequest) {
  try {
    const format = new URL(request.url).searchParams.get('format') || 'json'

    const portfolios = await db.portfolio.findMany({
      where: { status: 'approved' },
      orderBy: { submittedAt: 'desc' },
      include: {
        technologies: { include: { technology: true } },
        score: true,
      },
    })

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = portfolios.map((p: any) => ({
      name: p.name,
      slug: p.slug,
      title: p.title,
      portfolioUrl: p.portfolioUrl,
      githubUrl: p.githubUrl,
      description: p.description,
      location: p.location,
      experienceLevel: p.experienceLevel,
      framework: p.framework,
      language: p.language,
      hostingProvider: p.hostingProvider,
      health: p.health,
      featured: p.featured,
      verified: p.verified,
      score: p.score?.overallScore ?? null,
      technologies: p.technologies.map((pt: { technology: { name: string } }) => pt.technology.name),
      submittedAt: p.submittedAt.toISOString(),
    }))

    if (format === 'csv') {
      const headers = [
        'name', 'slug', 'title', 'portfolioUrl', 'githubUrl', 'description',
        'location', 'experienceLevel', 'framework', 'language', 'hostingProvider',
        'health', 'featured', 'verified', 'score', 'technologies', 'submittedAt',
      ]

      const rows = data.map((row: Record<string, unknown>) =>
        headers.map((h) => {
          const val = row[h]
          const str = Array.isArray(val) ? val.join('; ') : String(val ?? '')
          return `"${str.replace(/"/g, '""')}"`
        }).join(',')
      )

      const csv = [headers.join(','), ...rows].join('\n')

      return new NextResponse(csv, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': 'attachment; filename="portfolios.csv"',
        },
      })
    }

    if (format === 'markdown') {
      const lines = [
        '# Developer Portfolios Export',
        '',
        `Generated: ${new Date().toISOString()}`,
        `Total: ${data.length} portfolios`,
        '',
        '| Name | Score | URL | Technologies | Status |',
        '|------|-------|-----|-------------|--------|',
      ]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      for (const p of data as any[]) {
        lines.push(
          `| ${p.name} | ${p.score ?? 'N/A'} | [${p.portfolioUrl}](${p.portfolioUrl}) | ${p.technologies.join(', ')} | ${p.health} |`
        )
      }

      const md = lines.join('\n')

      return new NextResponse(md, {
        status: 200,
        headers: {
          'Content-Type': 'text/markdown; charset=utf-8',
          'Content-Disposition': 'attachment; filename="portfolios.md"',
        },
      })
    }

    return NextResponse.json({
      data,
      meta: {
        total: data.length,
        exportedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to export portfolios:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
