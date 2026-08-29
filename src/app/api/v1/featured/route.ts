import { NextResponse } from 'next/server'
import { topScored } from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'Cache-Control': 's-maxage=60, stale-while-revalidate',
}

export async function GET() {
  const portfolios = await topScored(12)
  return NextResponse.json({ data: portfolios }, { status: 200, headers: HEADERS })
}