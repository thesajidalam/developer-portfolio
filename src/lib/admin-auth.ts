import { NextRequest, NextResponse } from 'next/server'

export function checkAdminKey(request: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_API_KEY
  if (!expected) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 503 })
  }
  const auth = request.headers.get('authorization') || ''
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : ''
  if (!token || token !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}
