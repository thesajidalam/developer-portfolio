import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { listPortfolios } from '@/lib/repository'
import { PortfolioFiltersSchema } from '@/lib/validations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 's-maxage=60, stale-while-revalidate',
}

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams
  const parsed = PortfolioFiltersSchema.safeParse(Object.fromEntries(params))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid query parameters' }, { status: 400 })
  }
  const result = await listPortfolios(parsed.data)
  return NextResponse.json(
    { data: result.data, meta: result.meta },
    { status: 200, headers: HEADERS },
  )
}