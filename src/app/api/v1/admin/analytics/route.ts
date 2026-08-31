import { NextRequest, NextResponse } from 'next/server'
import { checkAdminKey } from '@/lib/admin-auth'
import { getAnalytics } from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const unauthorized = checkAdminKey(request)
  if (unauthorized) return unauthorized

  try {
    const analytics = await getAnalytics()
    return NextResponse.json({ data: analytics })
  } catch (error) {
    console.error('Admin analytics failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
