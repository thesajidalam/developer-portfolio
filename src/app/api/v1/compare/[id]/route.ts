import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getComparison, getPortfolioById } from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const ids = await getComparison(id)
  if (!ids) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  const portfolios = (
    await Promise.all(ids.map((portfolioId) => getPortfolioById(portfolioId)))
  ).filter((p): p is NonNullable<typeof p> => p !== null)
  return NextResponse.json({ data: { ids, portfolios } }, { status: 200 })
}