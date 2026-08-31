import { NextRequest, NextResponse } from 'next/server'
import { checkAdminKey } from '@/lib/admin-auth'
import { listReports } from '@/lib/repository'
import { getAdminClient } from '@/lib/supabase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const unauthorized = checkAdminKey(request)
  if (unauthorized) return unauthorized

  try {
    const sp = new URL(request.url).searchParams
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(sp.get('pageSize') || '20', 10)))
    const result = await listReports(page, pageSize)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Admin list reports failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = checkAdminKey(request)
  if (unauthorized) return unauthorized

  try {
    const sp = new URL(request.url).searchParams
    const id = sp.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
    const client = getAdminClient()
    const { error } = await client.from('submissions').delete().eq('id', id)
    if (error) throw new Error(error.message)
    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    console.error('Admin delete report failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
