import { NextResponse } from 'next/server'
import { adminListPortfolios, countApproved, fetchApprovedBatch } from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function topCounts(groups: string[][], limit: number): { value: string; count: number }[] {
  const counts: Record<string, number> = {}
  for (const group of groups) {
    for (const item of group) {
      counts[item] = (counts[item] ?? 0) + 1
    }
  }
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }))
}

export async function GET() {
  try {
    const [totalPortfolios, totalApproved, batch] = await Promise.all([
      adminListPortfolios(1, 1).then((r) => r.meta.total),
      countApproved(),
      fetchApprovedBatch(2000),
    ])
    const categories = topCounts(batch.map((p) => p.categories), 15)
    const technologies = topCounts(batch.map((p) => p.technologies), 15)
    return NextResponse.json(
      {
        data: {
          totalPortfolios,
          totalApproved,
          categories,
          technologies,
          updatedAt: new Date().toISOString(),
        },
      },
      { status: 200 },
    )
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}