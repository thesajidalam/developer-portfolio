import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getPortfolioBySlug } from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const portfolio = await getPortfolioBySlug(slug)
  if (!portfolio) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ data: portfolio }, { status: 200 })
}