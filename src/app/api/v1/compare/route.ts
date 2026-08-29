import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createComparison } from '@/lib/repository'
import { ComparisonSchema } from '@/lib/validations'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const parsed = ComparisonSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid comparison ids' }, { status: 400 })
  }
  const id = await createComparison(parsed.data.ids)
  return NextResponse.json({ data: { id } }, { status: 201 })
}