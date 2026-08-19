import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

interface ExportOptions {
  format: 'json' | 'csv' | 'markdown'
  outputPath?: string
  filters?: {
    featured?: boolean
    verified?: boolean
    status?: string
    experienceLevel?: string
  }
}

function escapeCSV(value: string | null | undefined): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

async function exportJSON(outputPath: string, filters?: ExportOptions['filters']) {
  const where: Record<string, unknown> = {}
  if (filters?.featured !== undefined) where.featured = filters.featured
  if (filters?.verified !== undefined) where.verified = filters.verified
  if (filters?.status) where.status = filters.status
  if (filters?.experienceLevel) where.experienceLevel = filters.experienceLevel

  const portfolios = await prisma.portfolio.findMany({
    where,
    include: {
      technologies: { include: { technology: true } },
      categories: { include: { category: true } },
      tags: { include: { tag: true } },
      score: true,
      healthChecks: { orderBy: { checkedAt: 'desc' }, take: 1 },
    },
    orderBy: { submittedAt: 'desc' },
  })

  const data = portfolios.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    username: p.username,
    title: p.title,
    avatarUrl: p.avatarUrl,
    portfolioUrl: p.portfolioUrl,
    githubUrl: p.githubUrl,
    socialLinks: p.socialLinks ? JSON.parse(p.socialLinks) : null,
    description: p.description,
    location: p.location,
    experienceLevel: p.experienceLevel,
    status: p.status,
    health: p.health,
    framework: p.framework,
    language: p.language,
    hostingProvider: p.hostingProvider,
    featured: p.featured,
    verified: p.verified,
    submittedAt: p.submittedAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    lastChecked: p.lastChecked?.toISOString() ?? null,
    technologies: p.technologies.map((t) => t.technology.name),
    categories: p.categories.map((c) => c.category.name),
    tags: p.tags.map((t) => t.tag.name),
    score: p.score
      ? {
          performance: p.score.performanceScore,
          accessibility: p.score.accessibilityScore,
          seo: p.score.seoScore,
          bestPractices: p.score.bestPracticesScore,
          design: p.score.designScore,
          content: p.score.contentScore,
          overall: p.score.overallScore,
          calculatedAt: p.score.calculatedAt.toISOString(),
        }
      : null,
    latestHealthCheck: p.healthChecks[0]
      ? {
          statusCode: p.healthChecks[0].statusCode,
          responseTime: p.healthChecks[0].responseTime,
          sslValid: p.healthChecks[0].sslValid,
          checkedAt: p.healthChecks[0].checkedAt.toISOString(),
        }
      : null,
  }))

  fs.writeFileSync(outputPath, JSON.stringify(data, null, 2))
  console.log(`Exported ${data.length} portfolios to ${outputPath}`)
}

async function exportCSV(outputPath: string, filters?: ExportOptions['filters']) {
  const where: Record<string, unknown> = {}
  if (filters?.featured !== undefined) where.featured = filters.featured
  if (filters?.verified !== undefined) where.verified = filters.verified
  if (filters?.status) where.status = filters.status
  if (filters?.experienceLevel) where.experienceLevel = filters.experienceLevel

  const portfolios = await prisma.portfolio.findMany({
    where,
    include: {
      technologies: { include: { technology: true } },
      categories: { include: { category: true } },
      score: true,
    },
    orderBy: { submittedAt: 'desc' },
  })

  const headers = [
    'id',
    'name',
    'slug',
    'username',
    'title',
    'portfolioUrl',
    'githubUrl',
    'description',
    'location',
    'experienceLevel',
    'status',
    'health',
    'framework',
    'language',
    'hostingProvider',
    'featured',
    'verified',
    'technologies',
    'categories',
    'overallScore',
    'performanceScore',
    'accessibilityScore',
    'seoScore',
    'bestPracticesScore',
    'designScore',
    'contentScore',
    'submittedAt',
    'updatedAt',
  ]

  const rows = portfolios.map((p) => [
    escapeCSV(p.id),
    escapeCSV(p.name),
    escapeCSV(p.slug),
    escapeCSV(p.username),
    escapeCSV(p.title),
    escapeCSV(p.portfolioUrl),
    escapeCSV(p.githubUrl),
    escapeCSV(p.description),
    escapeCSV(p.location),
    escapeCSV(p.experienceLevel),
    escapeCSV(p.status),
    escapeCSV(p.health),
    escapeCSV(p.framework),
    escapeCSV(p.language),
    escapeCSV(p.hostingProvider),
    escapeCSV(String(p.featured)),
    escapeCSV(String(p.verified)),
    escapeCSV(p.technologies.map((t) => t.technology.name).join('; ')),
    escapeCSV(p.categories.map((c) => c.category.name).join('; ')),
    escapeCSV(p.score?.overallScore?.toString()),
    escapeCSV(p.score?.performanceScore?.toString()),
    escapeCSV(p.score?.accessibilityScore?.toString()),
    escapeCSV(p.score?.seoScore?.toString()),
    escapeCSV(p.score?.bestPracticesScore?.toString()),
    escapeCSV(p.score?.designScore?.toString()),
    escapeCSV(p.score?.contentScore?.toString()),
    escapeCSV(p.submittedAt.toISOString()),
    escapeCSV(p.updatedAt.toISOString()),
  ])

  const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
  fs.writeFileSync(outputPath, csv)
  console.log(`Exported ${rows.length} portfolios to ${outputPath}`)
}

async function exportMarkdown(outputPath: string, filters?: ExportOptions['filters']) {
  const where: Record<string, unknown> = {}
  if (filters?.featured !== undefined) where.featured = filters.featured
  if (filters?.verified !== undefined) where.verified = filters.verified
  if (filters?.status) where.status = filters.status
  if (filters?.experienceLevel) where.experienceLevel = filters.experienceLevel

  const portfolios = await prisma.portfolio.findMany({
    where,
    include: {
      technologies: { include: { technology: true } },
      score: true,
    },
    orderBy: { submittedAt: 'desc' },
  })

  const lines: string[] = [
    '# DevBeacon Portfolio Directory',
    '',
    `> Exported on ${new Date().toISOString().split('T')[0]}`,
    `> Total portfolios: ${portfolios.length}`,
    '',
    '---',
    '',
  ]

  for (const p of portfolios) {
    const score = p.score?.overallScore ? ` — **Score: ${p.score.overallScore.toFixed(1)}**` : ''
    lines.push(`## ${p.name}${score}`, '')
    if (p.title) lines.push(`**${p.title}**`)
    if (p.location) lines.push(`📍 ${p.location}`)
    lines.push('')
    lines.push(`- **Portfolio:** [${p.portfolioUrl}](${p.portfolioUrl})`)
    if (p.githubUrl) lines.push(`- **GitHub:** [${p.githubUrl}](${p.githubUrl})`)
    lines.push(`- **Level:** ${p.experienceLevel}`)
    lines.push(`- **Framework:** ${p.framework ?? 'N/A'}`)
    lines.push(`- **Language:** ${p.language ?? 'N/A'}`)
    if (p.technologies.length > 0) {
      lines.push(`- **Technologies:** ${p.technologies.map((t) => t.technology.name).join(', ')}`)
    }
    lines.push(`- **Status:** ${p.status}`)
    lines.push(`- **Health:** ${p.health}`)
    if (p.description) {
      lines.push('')
      lines.push(`> ${p.description}`)
    }
    lines.push('')
    lines.push('---', '')
  }

  fs.writeFileSync(outputPath, lines.join('\n'))
  console.log(`Exported ${portfolios.length} portfolios to ${outputPath}`)
}

async function main() {
  const args = process.argv.slice(2)
  const format = (args[0] as ExportOptions['format']) || 'json'
  const outputDir = args[1] || path.join(process.cwd(), 'exports')

  if (!['json', 'csv', 'markdown'].includes(format)) {
    console.error('Usage: tsx data/export.ts <json|csv|markdown> [output-dir]')
    process.exit(1)
  }

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const ext = format === 'markdown' ? 'md' : format
  const outputPath = path.join(outputDir, `portfolios.${ext}`)

  switch (format) {
    case 'json':
      await exportJSON(outputPath)
      break
    case 'csv':
      await exportCSV(outputPath)
      break
    case 'markdown':
      await exportMarkdown(outputPath)
      break
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
