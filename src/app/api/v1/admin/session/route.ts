import { NextRequest, NextResponse } from 'next/server'
import { getAdminSessionFromRequest } from '@/lib/session'
import { isTotpConfigured } from '@/lib/totp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = getAdminSessionFromRequest(request)
  return NextResponse.json(
    {
      authenticated: Boolean(session),
      mfa: session?.mfa === true,
      mfaConfigured: isTotpConfigured(),
    },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}