import { NextRequest, NextResponse } from 'next/server'
import { checkAdminKey } from '@/lib/admin-auth'
import { listSubmittersEmails } from '@/lib/repository'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const unauthorized = checkAdminKey(request)
  if (unauthorized) return unauthorized

  try {
    const emails = await listSubmittersEmails()
    return NextResponse.json({ data: emails, total: emails.length })
  } catch (error) {
    console.error('Admin list newsletter emails failed:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
