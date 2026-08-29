import { NextRequest, NextResponse } from 'next/server'
import { checkAdminKey } from '@/lib/admin-auth'
import {
  adminListPortfolios,
  adminUpdatePortfolio,
  adminDeletePortfolio,
} from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const unauthorized = checkAdminKey(request)
  if (unauthorized) return unauthorized

  try {
    const sp = new URL(request.url).searchParams
    const page = Math.max(1, parseInt(sp.get('page') || '1', 10))
    const pageSize = Math.min(100, Math.max(1, parseInt(sp.get('pageSize') || '15', 10)))
    const status = sp.get('status') || undefined
    const q = sp.get('q') || undefined
    const result = await adminListPortfolios(page, pageSize, status, q)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Admin list portfolios failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  const unauthorized = checkAdminKey(request)
  if (unauthorized) return unauthorized

  try {
    const body = await request.json().catch(() => null)
    if (!body || !body.id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 })
    }
    const updated = await adminUpdatePortfolio(String(body.id), body)
    return NextResponse.json({ data: updated })
  } catch (error) {
    console.error('Admin update portfolio failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  const unauthorized = checkAdminKey(request)
  if (unauthorized) return unauthorized

  try {
    const id = new URL(request.url).searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })
    await adminDeletePortfolio(id)
    return NextResponse.json({ data: { deleted: true } })
  } catch (error) {
    console.error('Admin delete portfolio failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
