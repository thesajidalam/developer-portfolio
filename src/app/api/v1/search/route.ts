import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { listPortfolios } from '@/lib/repository'
import { SearchQuerySchema } from '@/lib/validations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const params = new URL(request.url).searchParams
  const parsed = SearchQuerySchema.safeParse(Object.fromEntries(params))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid search query' }, { status: 400 })
  }
  const result = await listPortfolios({ search: parsed.data.q, pageSize: 20 })
  return NextResponse.json({ data: result.data }, { status: 200 })
}